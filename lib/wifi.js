'use strict';
const WebSocketServer = require('ws').Server;
const Path = require('path');
const URL = require('url');
const Fse = require('fs-extra');
const EventEmitter = require('events');
const Utils = require('../utils');
const Package = require('./package');
const os = require('os');

const COMMAND = {
  HEART_BEAT: 4,
  DOWNLOAD: 2,
  LOG: 8,
  WEB_PREVIEW: 9
};

const moduleOptions = {
  port: null,
  tempPath: null,
  socketServer: null,
  workspace: null,
  httpServer: null,
  connectionCount: 0,
  logEmitter: new EventEmitter()
};

module.exports = {
  getLocalIp(){
    const interfaces = os.networkInterfaces();

    return Object.keys(interfaces).reduce((addr, dev) => {
      const newAddress = interfaces[dev]
                .filter(detail => detail.family === 'IPv4' && detail.address !== '127.0.0.1')
                .map(d => d.address);
      return [...addr, ...newAddress];
    }, []);
  },
  info(){
    return {
      ip: this.getLocalIp(),
      port: moduleOptions.port,
      connectionCount: moduleOptions.connectionCount
    };
  },
  start({
        tempPath,
        port = 8686,
        onConnection,
        onClose
    }){
    const server = require('http').createServer((req, res) => {
      const pathname = URL.parse(req.url).pathname;
      let zipPath = decodeURIComponent(pathname);
      if (zipPath.indexOf('/') === 0) {
        zipPath = zipPath.replace('/', '');
      }
            // const zipPath = Path.join(moduleOptions.tempPath, pathname);
      console.log('http download zipPath-->', zipPath);
      if (!Fse.existsSync(zipPath)) {
        this.notFound({
          res
        });
        return;
      }
      const stat = Fse.statSync(zipPath);
      console.log('file stat size->', stat.size);
      res.setHeader('Accept-Ranges', 'bytes');
      if (req.headers.range) {
        const range = Utils.parseRange(req.headers.range, stat.size);
        if (range) {
          res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${stat.size}`);
          res.setHeader('Content-Length', range.end - range.start + 1);
          Fse.createReadStream(zipPath, {
            start: range.start,
            end: range.end
          }).pipe(res);
        } else {
          res.removeHeader('Content-Length');
          res.writeHead(416, 'Request Range Not Satisfiable');
          res.end();
        }
      } else {
        res.setHeader('Content-Length', stat.size);
        Fse.createReadStream(zipPath).pipe(res);
      }

    });
    const wss = new WebSocketServer({
      server
    });

    moduleOptions.port = port;
    moduleOptions.socketServer = wss;
    moduleOptions.httpServer = server;
    moduleOptions.tempPath = tempPath;

    wss.on('connection', (socket) => {
      this.afterSocketConnect({
        socket,
        onConnection,
        onClose
      });
    });

    server.listen(port, () => {
      console.log(`敏行服务: ${JSON.stringify(this.getLocalIp())} port: ${server.address().port}`);
    });
  },
  end(){
    moduleOptions.socketServer.close();
    moduleOptions.httpServer.close();
    console.log('敏行 Wifi 真机同步服务 已关闭...');
  },
  afterSocketConnect({
        socket,
        onConnection,
        onClose
    }){
    moduleOptions.connectionCount += 1;
    if (onConnection && onConnection instanceof Function) {
      onConnection();
    }
    console.log(`有设备连接, 当前连接设备数:${moduleOptions.connectionCount}, port:${moduleOptions.port}`);

    socket.send(JSON.stringify(this.httpPortCmd({port: moduleOptions.port})));

    socket.on('error', err => {
      console.error(err);
            // silent...
    });

    socket.on('close', () => {
      moduleOptions.connectionCount -= 1;
      console.log(`有设备断开,当前连接设备数:${moduleOptions.connectionCount}`);
      if (onClose && onClose instanceof Function) {
        onClose();
      }
    });

    socket.on('message', (message) => {
      let incoming = '';
      try {
        incoming = JSON.parse(message);
      } catch (e) {
        console.warn(`socket on message JSON.parse error->${e}`);
        incoming = message;
      }
      incoming.command = incoming.command - 0;

      if (incoming.command === COMMAND.HEART_BEAT) {
        const cmd = this.replyLoaderHeartbeatCmd({
          command: incoming.command
        });
        this.sendCommand({
          socket,
          cmd
        });
      }

      if (incoming.command === COMMAND.DOWNLOAD) {
        console.log('incomming->', incoming);
        Package.getDownloadCmd({
          appId: incoming.appId,
          projectPath: incoming.projectPath,
          timestamp: incoming.timestamp,
          tempPath: moduleOptions.tempPath
        }).then(cmd => {
          console.log('command->', cmd);
          if (cmd) {
            this.sendCommand({
              socket,
              cmd
            });
          }
        });
      }

      if (incoming.command === COMMAND.LOG) {
        this.handleLog({
          cmd: incoming
        });
      }
    });
  },
  sync({
        project,
        updateAll
    }){ // 更新,全量或增量.

    if (typeof project !== 'string') {
      console.log(`${project} 不是一个有效的文件路径`);
      return;
    }

    const projectPath = Path.resolve(project);
    const configPath = Path.resolve(projectPath, 'plugin.properties');
    const workspace = Path.resolve(projectPath, '..');
    let appId = null;

    if (Fse.existsSync(configPath)) {
      const appInfo = Utils.readPropertiesSync(configPath);
      if (appInfo) {
        appId = appInfo.app_id;
      }
    }

    if (!appId) {
      console.log(`${project} 似乎不是一个有效的敏行项目`);
      return;
    }

    moduleOptions.workspace = workspace;

    const cmd = this.syncCmd({
      appId,
      projectPath,
      updateAll
    });
    this.broadcastCommand({
      socketServer: moduleOptions.socketServer,
      cmd
    });
  },
  webPreview({
        src
    }){
        // src  9200/index.html
    const cmd = this.webPreviewCmd({src});
    this.broadcastCommand({
      socketServer: moduleOptions.socketServer,
      cmd
    });
  },
  preview({
        file
    }){ // 页面实时预览.
    if (typeof file !== 'string') {
      console.log(`${file} 不是一个有效的文件路径`);
      return;
    }
    file = Path.resolve(file);

    const {
            app_id,
            project
        } = Utils.fetchProjectRootInfoByFile(file);

    if (!app_id) {
      console.log(`${file} 似乎不在有效的敏行项目中`);
      return;
    }

    moduleOptions.workspace = Path.resolve(project, '..');

    const cmd = this.previewCmd({
      file,
      workspace: moduleOptions.workspace,
      appId: app_id
    });
    this.broadcastCommand({
      socketServer: moduleOptions.socketServer,
      cmd
    });
  },
  broadcastCommand({
        socketServer,
        cmd
    }){
    socketServer.clients.forEach((socket) => {
      this.sendCommand({
        socket,
        cmd
      });
    });
  },
  sendCommand({
        socket,
        cmd
    }){
    const cmdStr = JSON.stringify(cmd);
    console.log('send cmd->', cmd);
    socket.send(cmdStr, (error) => {
      if (error) {
        console.warn(`Socket send message error->${error}`);
      }
    });
  },
  log(callback){
    return new Promise(resolve => {
      this.on('log', log => {
        callback(log);
        resolve();
      });
    });
  },
  handleLog({
        cmd
    }){
    moduleOptions.logEmitter.emit('log', {
      content: cmd.content,
      level: cmd.level
    });
  },
  on(event, callback){
    moduleOptions.logEmitter.on(event, callback);
  },
  syncCmd({
        appId,
        projectPath,
        updateAll = true
    }){
    return {
      command: 1,
      appId,
      projectPath,
      updateAll,
    };
  },
  replyLoaderHeartbeatCmd({
        command
    }){
    return {
      command
    };
  },
  webPreviewCmd({
        src
    }){
    src = src.indexOf('http') > -1 ? src : `http://${src}`;
    console.log('src-->', src);
    return {
      command: COMMAND.WEB_PREVIEW,
      path: src
    };
  },
  previewCmd({
        file,
        workspace,
        appId
    }){ // 发送‘页面实时预览’指令
    const absoluteUrlPath = this.absoluteUrlPath({
      file,
      workspace,
      appId
    });

    return {
      command: 6,
      path: absoluteUrlPath,
      appId
    };
  },
  httpPortCmd({
        port
    }){ // 返回 http 端口信息.
    return {
      command: 7,
      port
    };
  },
  absoluteUrlPath({
        file,
        workspace,
        appId
    }){ // 本地文件对应的服务器地址.
    let relativePath = Path.relative(workspace, file);
    relativePath = relativePath.replace(/\\/g, '/');
    const absoluteUrlPath = `/${relativePath.replace(/^[^\/]*/, appId)}`;
    return absoluteUrlPath;
  },
  notFound({
        res
    }){ // 404
    res.writeHead(404, {
      'Content-Type': 'text/plain'
    });
    res.write('404 Not found');
    res.end();
  }
};

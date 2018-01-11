const WebSocketServer = require('ws').Server;
const Path = require('path');
const URL = require('url');
const Fse = require('fs-extra');
const fsp = require('fs-promise');
const EventEmitter = require('events');
const os = require('os');
const _ = require('underscore');
const co = require('co');
const promisify = require('promisify-node');
const qrcode = require('qrcode');
const qs = require('qs');
const Utils = require('../utils');
const {loggerBuilder} = require('../utils');
const {QRCODE_TEMP} = require('../utils/config');
const Package = require('./package');

function generateHtmlPage(title, dataURL){
    return `<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width,initial-scale=1.0">
                    <!-- Set render engine for 360 browser -->
                    <meta name="renderer" content="webkit">
                    <meta http-equiv="pragma" content="no-cache">
                    <meta http-equiv="cache-control" content="no-cache">
                    <meta http-equiv="expires" content="0">
                    <title>${title}</title>
                </head>
                <body>
                    <h3>${title}</h3>
                    <img src="${dataURL}">
                </body>
            </html>`.replace(/^ {12}/g, '');
}
const toDataURL = promisify(qrcode.toDataURL);
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
    remoteIps: [],
    remoteIp: null,
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
    info(qrCodeTitle){ // 如果 qrCodeTitle 是 非空字符串，就返回一个Promise。否则，就是一个同步方法。
        const data = {
            ip: this.getLocalIp(),
            port: moduleOptions.port,
            connectionCount: moduleOptions.connectionCount
        };
        if (_.isString(qrCodeTitle) && !_.isEmpty(qrCodeTitle)) {
            return co(function *(){
                yield fsp.mkdirs(QRCODE_TEMP);
                const {ip: [ip], port} = data;
                const qrcodeFileName = `${ip}_${data.port}.html`;
                const qrcodeFilePath = Path.join(QRCODE_TEMP, qrcodeFileName);
                const exists = yield fsp.stat(qrcodeFilePath).then(stat => stat.isFile(), () => false);
                if (!exists) {
                    const dataURL = yield toDataURL(`native://mxDevApp?${qs.stringify({
                        ip, port, type: 'connect-minxing-devtool'
                    })}`);
                    const html = generateHtmlPage(qrCodeTitle, dataURL);
                    yield fsp.writeFile(qrcodeFilePath, html);
                }
                return _.extendOwn(data, {qrcodeFilePath});
            });
        }
        return data;
    },
    start({tempPath, port = 8686, onConnection, onClose}){
        const logDebug = loggerBuilder.debug('start');
        const logInfo = loggerBuilder.info('start');
        const server = require('http').createServer(co.wrap(function *(req, res){
            const pathname = URL.parse(req.url).pathname;
            let zipPath = decodeURIComponent(pathname);
            if (zipPath.indexOf('/') === 0) {
                zipPath = zipPath.replace('/', '');
            }
      // const zipPath = Path.join(moduleOptions.tempPath, pathname);
            logDebug('http download zipPath-->', zipPath);
            const fileSize = yield fsp.stat(zipPath).then(stats => stats.size, () => false);
            logDebug('file stat size->', fileSize);
            if (!_.isNumber(fileSize)) {
                this.notFound({res});
                return;
            }
            res.setHeader('Accept-Ranges', 'bytes');
            if (req.headers.range) {
                const range = Utils.parseRange(req.headers.range, fileSize);
                if (range) {
                    res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${fileSize}`);
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
                res.setHeader('Content-Length', fileSize);
                Fse.createReadStream(zipPath).pipe(res);
            }
        })).listen(port, () => logInfo('敏行服务: %s, port: %d',
      JSON.stringify(this.getLocalIp()), server.address().port));
        const wss = new WebSocketServer({server}).on('connection', socket => this.afterSocketConnect({
            socket, onConnection, onClose
        }));
        _.extendOwn(moduleOptions, {
            port, tempPath,
            socketServer: wss,
            httpServer: server
        });
    },
    end(){
        const logInfo = loggerBuilder.info('end');
        moduleOptions.socketServer.close();
        moduleOptions.httpServer.close();
        logInfo('敏行 Wifi 真机同步服务 已关闭...');
    },
    afterSocketConnect({socket, onConnection, onClose}){
        const logDebug = loggerBuilder.debug('afterSocketConnect');
        const logInfo = loggerBuilder.info('afterSocketConnect');
        const logWarn = loggerBuilder.warn('afterSocketConnect');
        const logErr = loggerBuilder.error('afterSocketConnect');

        moduleOptions.remoteIp = socket._sender._socket.remoteAddress;
        moduleOptions.remoteIps.push(moduleOptions.remoteIp);
        moduleOptions.connectionCount += 1;

        _.isFunction(onConnection) && onConnection(moduleOptions.remoteIps, moduleOptions.remoteIp);

        logInfo('有设备连接, 当前连接设备数:%d, 连接主机:%s, port:%d', moduleOptions.connectionCount,
            JSON.stringify(moduleOptions.remoteIps), moduleOptions.port);

        socket.on('error', logErr).on('close', function(){

            moduleOptions.remoteIp = this._sender._socket.remoteAddress;
            const delIndex = moduleOptions.remoteIps.indexOf(moduleOptions.remoteIp);
            delIndex > -1 && moduleOptions.remoteIps.splice(delIndex, 1);
            moduleOptions.connectionCount -= 1;

            logInfo(`有设备断开,当前连接设备数:${moduleOptions.connectionCount},客户端:${JSON.stringify(moduleOptions.remoteIps)}`);
            _.isFunction(onClose) && onClose(moduleOptions.remoteIps, moduleOptions.remoteIp);
        }).on('message', message => {
            let incoming = '';
            try {
                incoming = JSON.parse(message);
            } catch (e) {
                logWarn(`socket on message JSON.parse error->${e}`);
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
                logDebug('incomming->', incoming);
                Package.getDownloadCmd({
                    appId: incoming.appId,
                    projectPath: incoming.projectPath,
                    timestamp: incoming.timestamp,
                    tempPath: moduleOptions.tempPath
                }).then(cmd => {
                    logDebug('command->', cmd);
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
        }).send(JSON.stringify(this.httpPortCmd({port: moduleOptions.port})));
    },
    sync({project, updateAll}){ // 更新,全量或增量.
        const logWarn = loggerBuilder.warn('sync');
        if (typeof project !== 'string') {
            logWarn(`${project} 不是一个有效的文件路径`);
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
            logWarn(`${project} 似乎不是一个有效的敏行项目`);
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
    webPreview({src}){
    // src  9200/index.html
        const cmd = this.webPreviewCmd({src});
        this.broadcastCommand({
            socketServer: moduleOptions.socketServer,
            cmd
        });
    },
    preview({file}){ // 页面实时预览.
        const logWarn = loggerBuilder.warn('preview');
        if (typeof file !== 'string') {
            logWarn(`${file} 不是一个有效的文件路径`);
            return;
        }
        file = Path.resolve(file);

        const {
      app_id: appId,
      project
    } = Utils.fetchProjectRootInfoByFile(file);

        if (!appId) {
            logWarn(`${file} 似乎不在有效的敏行项目中`);
            return;
        }

        moduleOptions.workspace = Path.resolve(project, '..');

        const cmd = this.previewCmd({
            file, appId,
            workspace: moduleOptions.workspace
        });
        this.broadcastCommand({
            socketServer: moduleOptions.socketServer,
            cmd
        });
    },
    broadcastCommand({socketServer, cmd}){
        socketServer.clients.forEach(socket => {
            this.sendCommand({socket, cmd});
        });
    },
    sendCommand({socket, cmd}){
        const logTrace = loggerBuilder.trace('sendCommand');
        const logWarn = loggerBuilder.warn('sendCommand');
        const cmdStr = JSON.stringify(cmd);
        logTrace('send cmd->', cmd);
        socket.send(cmdStr, error => {
            if (error) {
                logWarn(`Socket send message error->${error}`);
            }
        });
    },
    log(callback){
        return new Promise(resolve => {
            this.on('log', log => {
                callback(log); // eslint-disable-line callback-return
                resolve();
            });
        });
    },
    handleLog({cmd}){
        moduleOptions.logEmitter.emit('log', {
            content: cmd.content,
            level: cmd.level
        });
    },
    on(event, callback){
        moduleOptions.logEmitter.on(event, callback);
    },
    syncCmd({appId, projectPath, updateAll = true}){
        return {
            command: 1,
            appId,
            projectPath,
            updateAll,
        };
    },
    replyLoaderHeartbeatCmd({command}){
        return {
            command
        };
    },
    webPreviewCmd({src}){
        const logDebug = loggerBuilder.debug('webPreviewCmd');
        src = src.indexOf('http') > -1 ? src : `http://${src}`;
        logDebug('src-->', src);
        return {
            command: COMMAND.WEB_PREVIEW,
            path: src
        };
    },
    previewCmd({file, workspace, appId}){ // 发送‘页面实时预览’指令
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
    httpPortCmd({port}){ // 返回 http 端口信息.
        return {
            command: 7,
            port
        };
    },
    absoluteUrlPath({file, workspace, appId}){ // 本地文件对应的服务器地址.
        let relativePath = Path.relative(workspace, file);
        relativePath = relativePath.replace(/\\/g, '/');
        const absoluteUrlPath = `/${relativePath.replace(/^[^\/]*/, appId)}`;
        return absoluteUrlPath;
    },
    notFound({res}){ // 404
        res.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        res.write('404 Not found');
        res.end();
    }
};

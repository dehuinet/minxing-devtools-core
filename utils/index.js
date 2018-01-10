const Fse = require('fs-extra');
const Path = require('path');
const projectStructure = require('./project_structure.json');
const _ = require('underscore');
const cluster = require('cluster');
const pckg = require('../package.json');
const debug = _.extendOwn(require('debug'), {
  log: console.log // eslint-disable-line no-console
});

_.extendOwn(exports, {
  getProjectStructure,
  readPropertiesSync,
  getAppId(propertiesPath){
    return readPropertiesSync(propertiesPath).app_id;
  },
  parseRange(str, size){
    if (str.indexOf(',') !== -1) {
      return undefined;
    }
    str = str.replace('bytes=', '');
    const range = str.split('-');
    let start = parseInt(range[0]);
    let end = parseInt(range[1]);
      // Case: -100
    if (isNaN(start)) {
      start = size - end;
      end = size - 1;
          // Case: 100-
    } else if (isNaN(end)) {
      end = size - 1;
    }
      // Invalid
    if (isNaN(start) || isNaN(end) || start > end || end > size) {
      return undefined;
    }
    return {
      start,
      end
    };
  },
  getAppType(propertiesPath){
    return readPropertiesSync(propertiesPath).type;
  },
  validatePackageName(name){
    const logErr = exports.loggerBuilder.error('validatePackageName');
    let valid = true;
    if (!name.match(/^[\w]{1,20}$/i)) {
      logErr('"%s" 应用名称无效. 应用名称应在20个字符以内,且不能包含空格和符号!', name);
      valid = false;
    }
    return valid;
  },
  fetchProjectOfTempPath({tempPath, projectPath}){
    projectPath = Path.resolve(projectPath);
    if (/^[a-zA-z]:\\/.test(projectPath)) {
      projectPath = projectPath.split(':\\')[1];
    }
    return Path.join(tempPath, projectPath);
  },
  fetchProjectRootInfoByFile(file){
    const logWarn = exports.loggerBuilder.warn('fetchProjectRootInfoByFile');
    if (typeof file !== 'string') {
      logWarn(`${file} 不是一个有效的文件路径`);
      return undefined;
    }
    const info = (function getInfo(_project){
      const configPath = Path.resolve(_project, 'plugin.properties');
      if (Fse.existsSync(configPath)) {
        const config = readPropertiesSync(configPath);
        return Object.assign({}, {project: _project}, config);
      }
      if (_project.toLowerCase() === Path.resolve('/').toLowerCase()) { // 在windows系统上，盘符一般都是大写的。
        return undefined;
      }
      _project = Path.resolve(_project, '..');
      return getInfo(_project);
    })(Path.resolve(file));
    if (info) {
      const directoryPath = Path.resolve(info.project, getProjectStructure()[info.type]);
      if (Fse.existsSync(directoryPath) && Fse.statSync(directoryPath).isDirectory()) {
        return info;
      }
      return '';
    }
    return '';
  },
  loggerBuilder: {
    trace: _.partial(loggerBuilder, 'trace'),
    debug: _.partial(loggerBuilder, 'debug'),
    info: _.partial(loggerBuilder, 'info'),
    warn: _.partial(loggerBuilder, 'warn'),
    error: _.partial(loggerBuilder, 'error')
  }
});

function loggerBuilder(level, category){
  if (cluster.isWorker) {
    return debug(`${level}:${pckg.name}[${cluster.worker.process.pid}/${cluster.worker.id}]:${category}`);
  }
  return debug(`${level}:${pckg.name}:${category}`);
}
function getProjectStructure(){
  return projectStructure;
}
function readPropertiesSync(propertiesPath){
  const fs = require('fs');
    // 读取并解析plugin.properties文件
  const content = fs.readFileSync(propertiesPath, 'utf-8');
  const regexjing = /\s*(#+)/; // 去除注释行的正则
  const regexkong = /\s*=\s*/; // 去除=号前后的空格的正则
  const obj = {}; // 存储键值对
  let arrCase = null;
  const regexline = /.+/g; // 匹配换行符以外的所有字符的正则
  while (!_.isEmpty(arrCase = regexline.exec(content))) { // 过滤掉空行
    if (!regexjing.test(arrCase)) { // 去除注释行
      obj[arrCase.toString().split(regexkong)[0]] = arrCase.toString().split(regexkong)[1].split(';')[0]; // 存储键值对
    }
  }
  return obj;
}

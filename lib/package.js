const fse = require('fs-extra');
const path = require('path');
const glob = require("glob")
const Utils = require('../utils/utils');
const MXBuild = require('./build');

const Package = {
    $zipPhase: false,
    clearTemp(tempPath) {
        fse.existsSync(tempPath) && fse.removeSync(tempPath);
    },   
    getProjectModifyTimestampAndFiles({
        appId,
        projectPath
    }) {
        return new Promise((resolve, reject) => {
            let fileList = this.globMatch({
                project: projectPath
            }) || [];
            const time = fileList.reduce((timestamp, file) => {
                const stat = fse.statSync(file);
                let {
                    mtime,
                    ctime
                } = stat;
                mtime = mtime.getTime()/ 1000.0;
                ctime = ctime.getTime()/ 1000.0;
                // 取创建时间和修改时间中，最新的时间
                const validateTime = mtime >= ctime ? mtime : ctime;
                return validateTime > timestamp ? validateTime : timestamp;
            }, 0)
            resolve({
                timestamp: time,
                project: projectPath,
                fileList
            })
        })
    },
    getDownloadCmd(params) {

        if (this.$zipPhase) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    this.getDownloadCmd(params)
                        .then(_ => resolve(_))
                        .catch(e => reject(e));
                }, 2000);
            })
        } else {
            if (params.timestamp) {
                // 增量
                return this.getSmartCmd(params)
            } else {
                // 全量
                return this.getSyncCmd(params)
                
            }
        }


    },
    getSmartCmd({
        appId,
        projectPath,
        timestamp,
        tempPath
    }) {
        const projectOfTempPath = Utils.fetchProjectOfTempPath({tempPath, projectPath});
        return this.getProjectModifyTimestampAndFiles({
            appId,
            projectPath
        }).then(data => {
            const lastModifyTime = data.timestamp;
            const allFileList = data.fileList;
            const projectPath = data.project;
            const startToEnd = `${timestamp}-${lastModifyTime}`;
            const fileName = `${startToEnd}.zip`;
            const filePath = path.join(projectOfTempPath, fileName);
            if (fse.existsSync(filePath)) {
                return Promise.resolve(`${startToEnd}`)
            } else {
                // 根据timestamp 找增量文件
                return this.zipSmartPackage({
                    fileList: allFileList,
                    projectPath,
                    tempPath,
                    appId,
                    startToEnd: `${timestamp}-${lastModifyTime}`
                });
            }
        }).then(sToE => {
            if (!sToE) {
                return Promise.resolve();
            } else {
                return Promise.resolve({
                    command: 3,
                    zipPath: path.join(projectOfTempPath, `${sToE}.zip`),
                    appId: appId,
                    timestamp: sToE.split('-')[1]
                });
            }
        })
    },
    zipSmartPackage({
        fileList,
        projectPath,
        tempPath,
        appId,
        startToEnd
    }) {
        // fileList -> 全路径[];
        // projectPath -> /Users/Roy/Desktop/apicloudtest;
        // tempPath -> /Users/Roy/program/atom-package/atom-minxing-package/temp;
        // name -> appId#timestamp;
        return new Promise(resolve => {
            const start = startToEnd.split('-')[0];
            const end = startToEnd.split('-')[1];
            fileList = fileList.filter(file => {
                const stat = fse.statSync(file)
                let {
                    mtime,
                    ctime
                } = stat;
                const validateTime = mtime >= ctime ? mtime : ctime;
                return validateTime.getTime()/ 1000.0 > start;
            });
            if (fileList.length === 0) {
                resolve();
            } else {
                this.$zipPhase = true;
                const name = `${startToEnd}`;
                const projectOfTempPath = Utils.fetchProjectOfTempPath({tempPath, projectPath});
                const tempAppPath = path.join(projectOfTempPath, name);
                const copiedFiles = [];
                const fileListCount = fileList.length;
                fileList.forEach(filePath => {
                    const relativePath = path.relative(projectPath, filePath);
                    const targetPath = path.resolve(tempAppPath, relativePath);
                    fse.copy(filePath, targetPath, (e) => {
                        if (e) reject(e);
                        copiedFiles.push(targetPath);
                        if (copiedFiles.length === fileListCount) {
                            MXBuild.build({
                                projectRootPath: tempAppPath,
                                savePath: projectOfTempPath,
                                projectName: name
                            }).then(() => {
                                this.$zipPhase = false;
                                resolve(startToEnd)
                            })
                        }
                    })
                })
            }
        })

    },
    getSyncCmd({
        appId,
        projectPath,
        tempPath
    }) {
        const projectOfTempPath = Utils.fetchProjectOfTempPath({tempPath, projectPath});
        return this.getProjectModifyTimestampAndFiles({
            appId,
            projectPath
        })
        .then(data => {
            const {
                fileList,
                timestamp,
            } = data;
            const fileName = `${timestamp}.zip`;
            const filePath = path.join(projectOfTempPath, fileName);
            if (fse.existsSync(filePath)) {
                // start-lastmodifytime 查看是否存在该zip文件
                return Promise.resolve(`${timestamp}`)
            } else {
                return this.zipSyncPackage({
                    fileList,
                    projectPath,
                    tempPath,
                    appId,
                    timestamp
                })
            }
        })
        .then(newTimestamp => {
            return Promise.resolve({
                command: 3,
                zipPath: path.join(projectOfTempPath, `${newTimestamp}.zip`),
                appId: appId,
                timestamp: newTimestamp
            });
        })
    },
    zipSyncPackage({
        fileList,
        projectPath,
        tempPath,
        appId,
        timestamp
    }) {
        // fileList -> 全路径[];
        // projectPath -> /Users/Roy/Desktop/apicloudtest;
        // tempPath -> /Users/Roy/program/atom-package/atom-minxing-package/temp;
        // name -> appId#timestamp;
        return new Promise((resolve, reject) => {
            const name = `${timestamp}`;
            const projectOfTempPath = Utils.fetchProjectOfTempPath({tempPath, projectPath});
            const tempAppPath = path.join(projectOfTempPath, name);
            const copiedFiles = [];
            const fileListCount = fileList.length;
            
            fileList.forEach(filePath => {
                this.$zipPhase = true;
                const relativePath = path.relative(projectPath, filePath);
                const targetPath = path.resolve(tempAppPath, relativePath);
                fse.copy(filePath, targetPath, (e) => {
                    if (e) reject(e);
                    copiedFiles.push(targetPath);
                    if (copiedFiles.length === fileListCount) {
                        MXBuild.build({
                            projectRootPath: tempAppPath,
                            savePath: projectOfTempPath,
                            projectName: name
                        }).then(() => {
                            this.$zipPhase = false;
                            resolve(timestamp)
                        })
                    }
                })
            })
        })
    },
    projectPath({
        appId,
        workspace
    }) { // 特定appId对应的项目的根目录.
        let projectPath = null
        return new Promise((resolve) => {
            fse.walk(workspace, {
                    filter: (file) => {
                        return path.resolve(workspace) === path.resolve(file, "./..")
                    }
                })
                .on('data', (item) => {
                    let itemPath = item.path
                    let itemStats = item.stats
                    let configFilePath = path.join(itemPath, "plugin.properties")

                    if (!itemStats.isDirectory() || !fse.existsSync(configFilePath)) {
                        return
                    }

                    const app_id = Utils.getAppId(configFilePath);
                    if (appId === app_id) {
                        resolve(itemPath)
                    }
                })
                .on('end', function () {
                    resolve(projectPath)
                })
        })
    },
    globMatch({
        project,
        sync = ".syncignore"
    }) { // 读取 .syncignore 忽略后的文件.
        let syncPath = path.resolve(project, sync)
        let syncignore = (fse.existsSync(syncPath) &&
            fse.readFileSync(syncPath, {
                encoding: "utf8"
            })) || ""

        let globmaths = glob.sync("**", {
            nodir: true,
            ignore: syncignore,
            realpath: true,
            cwd: project,
        })

        return globmaths
    }

}

module.exports = Package;
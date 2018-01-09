const Fse = require('fs-extra');
const Path = require('path');
const Utils = require('../utils');


const page_template_path = "../page_template";

const APICloud_template_path = `${page_template_path}/apicloud`;
const APICloud_template_config = require(`${APICloud_template_path}/config.json`);

const html5_template_path = `${page_template_path}/html5`;
const html5_template_config = require(`${html5_template_path}/config.json`);

const template_path = {
    "APICloud": APICloud_template_path,
    "html5": html5_template_path
}

const template_config = {
    "APICloud": APICloud_template_config,
    "html5": html5_template_config
};

module.exports = {
    getConfig() {
        return template_config;
    },
    getOutputPath({
        type,
        projectRootPath,
        filePath
    }) {
        return Path.resolve(projectRootPath, Utils.getProjectStructure()[type]);
    },
    add({
        type,
        name,
        output,
        project,
        template
    }) {
        type += "";
        name += "";
        output += "";
        template += "";

        const realTemplateName = template_config[type][template];
        if (!realTemplateName) {
            const err = `${type}类型下找不到页面框架模板:${template},目前支持的页面模板为:${Object.keys(template_config[type])}`;
            console.error(err);
            return err;
        }

        var root = Path.resolve(project);
        var configPath = Path.resolve(project, "plugin.properties");

        // 检测是否有plugin.properties
        if (!Fse.existsSync(root) || !Fse.existsSync(configPath)) {
            const err = `${root} 不是一个有效的敏行插件项目!`;
            console.error(err);
            return err;
        }

        // 再检测plugin.properties中type是否等于type
        if (Utils.readPropertiesSync(configPath).type !== type) {
            const err = `该模板并不是一个${type}类型的模版!`;
            console.error(err);
            return err;
        }


        try {
            let templatePath = Path.join(__dirname, template_path[type], realTemplateName)

            Fse.walk(templatePath)
                .on('data', function (item) {
                    let itemPath = item.path
                    let itemStats = item.stats

                    let relativePath = Path.relative(templatePath, itemPath)
                    let targetPath = Path.resolve(output, relativePath)
                    let targetDir = Path.dirname(targetPath)

                    if (itemStats.isDirectory()) { // 说明是目录.
                        return
                    }

                    let fileName = Path.basename(targetPath);
                    fileName = fileName.replace(/minxingPage|apicloudFrame|apicloudWindow(?=\.html)/g, (match) => {
                        let matchDict = {
                            "minxingPage": `${name}`,
                            "apicloudFrame": `${name}_frame`,
                            "apicloudWindow": `${name}_window`
                        }
                        return matchDict[match]
                    })

                    targetPath = Path.resolve(targetDir, fileName);
                    Fse.copySync(itemPath, targetPath, {
                        filter: () => (!/^[.]+/.test(fileName))
                    })

                    if (/\.html$/.test(fileName)) {
                        let targetFileText = Fse.readFileSync(targetPath, 'utf8')
                        targetFileText = targetFileText.replace(/minxingPage|apicloudFrame|apicloudWindow/g, (match) => {
                            let matchDict = {
                                "minxingPage": `${name}`,
                                "apicloudFrame": `${name}_frame`,
                                "apicloudWindow": `${name}_window`
                            }
                            return matchDict[match]
                        })

                        Fse.writeFileSync(targetPath, targetFileText)
                    }
                })
                .on('end', function () {
                    return;
                })
        } catch (err) {
            console.error(`创建 ${type} 页面框架失败: ${err}`);
            return
        }
    }
};

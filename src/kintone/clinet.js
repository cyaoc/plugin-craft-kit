const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const fs = require("fs-extra");
const logger = require("../logger");

// 处理错误信息
const handleError = (error) => {
  const message = error.response?.data?.message || error.message;
  throw new Error(message);
};

// 获取模板中的文件键列表
const getFileKeys = (template, key) => {
  if (!template.has(key)) template.set(key, { jsType: key, fileKeys: [] });
  return template.get(key).fileKeys;
};

// 提取主机名
const host = (str) => {
  try {
    return new URL(str).host;
  } catch {
    return str;
  }
};

module.exports = class Client {
  constructor(env) {
    this.instance = axios.create({
      baseURL: `https://${host(env.baseurl)}`,
      timeout: 10000,
      headers: {
        "X-Cybozu-Authorization": Buffer.from(
          `${env.username}:${env.password}`,
        ).toString("base64"),
      },
    });
  }

  // 上传插件
  async uploadPlugin(name, buff) {
    const fd = new FormData();
    fd.append("file", buff, name);
    const config = { headers: { ...fd.getHeaders() } };

    try {
      const uploadResponse = await this.instance.post(
        "/k/api/blob/upload.json",
        fd,
        config,
      );
      const importResponse = await this.instance.post(
        "/k/api/dev/plugin/import.json",
        {
          item: uploadResponse.data.result.fileKey,
        },
      );

      if (importResponse.data.success) {
        logger.info(`${name} has been uploaded!`);
      }
    } catch (err) {
      handleError(err);
    }
  }

  // 上传文件
  async upload(files, types) {
    const fileList = files.flatMap((file) => {
      return types.map((type) => ({
        path: file,
        name: path.basename(file),
        type:
          path.extname(file).slice(1) === "js"
            ? type.toUpperCase()
            : `${type.toUpperCase()}_CSS`,
      }));
    });

    try {
      const responses = await Promise.all(
        fileList.map(async (file) => {
          const fd = new FormData();
          fd.append("file", fs.readFileSync(file.path), file.name);
          const config = { headers: { ...fd.getHeaders() } };
          return this.instance.post("/k/v1/file.json", fd, config);
        }),
      );

      return responses.map((response, index) => ({
        type: fileList[index].type,
        name: fileList[index].name,
        contentId: response.data.fileKey,
      }));
    } catch (err) {
      handleError(err);
    }
  }

  // 自定义链接
  async customizeLinks(urls, options = {}) {
    if (!urls.length) {
      logger.warn("URL not found");
      return;
    }

    const opt = { ...options, upload: options.upload || ["desktop", "mobile"] };
    const urlMap = urls.map((url) => ({
      types: new Set(opt.upload.map((el) => el.toUpperCase())),
      contentUrl: url,
    }));

    const updateScripts = (scripts) => {
      const template = new Map();

      scripts.forEach((script) => {
        const fileKeys = getFileKeys(template, script.type);
        if (script.locationType === "URL") {
          const urlEntry = urlMap.find(
            (entry) => entry.contentUrl === script.contentUrl,
          );
          if (urlEntry) {
            urlEntry.types.delete(script.type);
            if (!urlEntry.types.size) {
              urlMap.splice(urlMap.indexOf(urlEntry), 1);
            }
          }
        }
        fileKeys.push(
          script.locationType === "URL" ? script.contentUrl : script.contentId,
        );
      });

      if (!urlMap.length) return;

      urlMap.forEach((urlEntry) => {
        urlEntry.types.forEach((type) =>
          getFileKeys(template, type).push(urlEntry.contentUrl),
        );
      });

      return Array.from(template.values());
    };

    await this.customize(updateScripts, opt.appid);
  }

  // 自定义文件
  async customizeFiles(files, options = {}) {
    if (!files.length) {
      logger.warn("File not found");
      return;
    }

    const opt = { ...options, upload: options.upload || ["desktop", "mobile"] };
    const fileData = await this.upload(files, opt.upload);

    const updateScripts = (scripts) => {
      const template = new Map();

      scripts.forEach((script) => {
        const fileKeys = getFileKeys(template, script.type);
        if (script.locationType === "BLOB") {
          const fileEntry = fileData.find(
            (file) => file.name === script.name && file.type === script.type,
          );
          if (fileEntry) {
            fileKeys.push(fileEntry.contentId);
            fileData.splice(fileData.indexOf(fileEntry), 1);
          } else {
            fileKeys.push(script.contentId);
          }
        } else {
          fileKeys.push(script.contentUrl);
        }
      });

      fileData.forEach((file) =>
        getFileKeys(template, file.type).push(file.contentId),
      );

      return Array.from(template.values());
    };

    await this.customize(updateScripts, opt.appid);
  }

  // 自定义脚本
  async customize(callback, appid) {
    try {
      const settings = appid
        ? await this.instance.post("/k/api/js/get.json", { app: appid })
        : await this.instance.post("/k/api/js/getSystemSetting.json", {});

      const jsFiles = callback(settings.data.result.scripts);
      if (!jsFiles) {
        logger.info("No need to update!");
        return;
      }

      const body = { jsScope: settings.data.result.scope, jsFiles };
      if (appid) {
        const app = await this.instance.get(`/k/v1/app.json?id=${appid}`);
        body.id = appid;
        body.name = app.data.name;
        await this.instance.post("/k/api/dev/app/update.json", body);
        await this.instance.post("/k/api/dev/app/deploy.json", { app: appid });
      } else {
        await this.instance.post("/k/api/js/updateSystemSetting.json", body);
      }

      logger.info("The configuration has been updated");
    } catch (err) {
      handleError(err);
    }
  }
};

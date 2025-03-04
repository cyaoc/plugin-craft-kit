# Rsbuild 插件 for kintone

专为 Rsbuild 打造的 kintone 插件开发工具链，深度集成 HTTPS 开发环境与自动部署工作流。

## 免责声明
- kintone 是 Cybozu 公司的注册商标。
- Rsbuild 是字节跳动开源的构建工具。
- 本项目是独立开发的第三方工具，与 Cybozu 公司和字节跳动没有任何关联。
- 使用本工具开发的插件是否上架 kintone 市场，需要遵守 Cybozu 公司的相关规定。

## 核心价值
### 🚀 Rsbuild 深度集成
- 自动注入 Rsbuild 入口配置（基于 manifest.json）
- 开发/生产环境智能构建
- 与 Rsbuild 配置无缝兼容

### 🔐 安全开发闭环
- 自动生成本地 HTTPS 证书（支持 macOS/Windows/Linux）
- 开发服务器强制 WSS 安全连接
- 自动签名插件产物

### ⚡ 极速开发体验
- 热模块替换 (HMR) 支持
- injectStyles 自动注入 CSS

### 📦 自动化部署流
- 编译产物自动打包为 plugin.zip
- 开发模式自动上传插件至 kintone
- 开发模式直连本地服务器（无需手动部署）

## 快速开始

### 创建项目
```bash
# 创建新项目目录
mkdir my-kintone-plugin && cd my-kintone-plugin

# 初始化 package.json
npm init -y

# 安装必需依赖
npm install @rsbuild/core --save-dev

# 安装工具链
npm install @cyaod/plugin-craft-kit --save-dev
```

### 配置项目
创建 rsbuild.config.mjs：

```javascript
import { defineConfig } from '@rsbuild/core';
import { pluginCraftKit } from '@cyaod/plugin-craft-kit';

export default defineConfig({
  plugins: [
    pluginCraftKit()
  ]
});
```
详细配置可参考 [Playground](./playground/rsbuild.config.mjs) 示例。

### 开发与构建
```bash
# 开发模式（自动生成证书 + 热更新）
npm run dev

# 生产构建（自动签名打包）
npm run build
```

## 高级配置项
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|-----|
| plugin.manifest | string | 'manifest.json' | 插件清单文件路径 |
| plugin.ppk | string | 'private.ppk' | 私钥文件路径 |
| plugin.output | string | 'plugin.zip' | 输出文件名称 |
| devTools.icon.type | 'badge' \| false | false | 开发模式是否打上Dev角标 |
| devTools.upload | boolean \| object | false | 开发模式是否自动上传kintone插件 |
| devTools.upload.client | object | null | [@kintone/rest-api-client 参数](https://github.com/kintone/js-sdk/tree/main/packages/rest-api-client#parameters-for-kintonerestapiclient) |


### 命令行工具
```bash
# 生成自签名根证书并安装到系统的可信证书列表
npx @cyaod/plugin-craft-kit cert install

# 卸载plugin-craft-kit的根证书
npx @cyaod/plugin-craft-kit cert uninstall

# 生成并保存自签名证书文件
npx @cyaod/plugin-craft-kit cert gen [domains...] [options]
```

gen命令可用选项：

- -o, --output-dir <path> 证书输出目录
- -c, --cert-file <filename> 证书文件名
- -k, --key-file <filename> 私钥文件名

## 许可证

本项目采用 MIT 许可证。

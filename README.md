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

```bash
# 1. 安装工具链
npm install @cyao/plugin-craft-kit --save-dev

# 2. 开发模式（自动生成证书 + 热更新）
rsbuild dev

# 3. 生产构建（自动签名打包）
rsbuild build
```

### 核心配置 (rsbuild.config.mjs)
```javascript
import { defineConfig } from '@rsbuild/core';
import { pluginCraftKit } from '@cyao/plugin-craft-kit';

export default defineConfig({
  plugins: [
    pluginCraftKit()
  ]
});
```

## 高级配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|-----|
| plugin.manifest | string | 'manifest.json' | 插件清单文件路径 |
| plugin.ppk | string | 'private.ppk' | 私钥文件路径 |
| plugin.output | string | 'plugin.zip' | 输出文件名称 |
| devTools.upload | boolean \| object | false | 开发模式是否自动上传kintone插件 |
| devTools.upload.client | object | null | [@kintone/rest-api-client 参数](https://github.com/kintone/js-sdk/tree/main/packages/rest-api-client#parameters-for-kintonerestapiclient) |
| devTools.upload.pluginId | string | null | 要更新的插件ID |

## 示例核心结构
```
playground/
├── src/
│   ├── manifest.json    # 插件配置入口
│   └── rsbuild.config.mjs # 构建配置
└── private.ppk          # 自动生成签名密钥
```

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](./LICENSE) 文件。

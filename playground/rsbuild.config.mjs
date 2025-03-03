import { defineConfig } from '@rsbuild/core';
import { pluginCraftKit } from '../src';

export default defineConfig({
  plugins: [
    pluginCraftKit({
      // 插件基础配置
      plugin: {
        manifest: 'src/manifest.json', // 插件清单文件路径
        // ppk: 'private.ppk',        // 私钥文件路径，默认值：private.ppk
        // output: 'plugin.zip'        // 插件打包输出文件名，默认值：plugin.zip
      },
      // 开发工具配置
      devTools: {
        // 开发环境图标处理配置
        icon: {
          // 可选值:
          // - 'badge': 在右下角添加开发标记（红色角标）
          // - false: 不处理图标（保持原样）
          type: 'badge',
        },
        // 自动上传配置
        upload: {
          // Kintone REST API 客户端配置
          client: {
            // Kintone 环境 URL
            baseUrl: process.env.KINTONE_BASE_URL,
            // 认证信息
            auth: {
              username: process.env.KINTONE_USERNAME,
              password: process.env.KINTONE_PASSWORD,
            },
          },
        },
      },
    }),
  ],
});

# Plugin Craft Kit for kintone with Rsbuild

A specialized toolchain for kintone plugin development built on Rsbuild, featuring deep integration with HTTPS development environments and automated deployment workflows.

## Disclaimer
- kintone is a registered trademark of Cybozu Inc.
- Rsbuild is an open-source build tool developed by ByteDance.
- This project is an independently developed third-party tool with no affiliation to Cybozu Inc. or ByteDance.
- Plugins developed using this toolchain must comply with Cybozu Inc.'s regulations if published to the kintone marketplace.

## Core Features
### 🚀 Seamless Rsbuild Integration
- Automatic Rsbuild entry configuration injection (based on manifest.json)
- Intelligent build process for development and production environments
- Full compatibility with existing Rsbuild configurations

### 🔐 Secure Development Lifecycle
- Automatic local HTTPS certificate generation (supports macOS/Windows/Linux)
- Enforced WSS secure connections for development servers
- Automated plugin artifact signing

### ⚡ Enhanced Developer Experience
- Hot Module Replacement (HMR) support
- Automatic CSS injection via injectStyles

### 📦 Streamlined Deployment Pipeline
- Automatic compilation and packaging of artifacts into plugin.zip
- Automated plugin uploads to kintone in development mode
- Direct connection to local development server (eliminating manual deployment)

## Quick Start

### Project Setup
```bash
# Create a new project directory
mkdir my-kintone-plugin && cd my-kintone-plugin

# Initialize package.json
npm init -y

# Install required dependencies
npm install @rsbuild/core --save-dev

# Install the toolchain
npm install @cyaod/plugin-craft-kit --save-dev
```

### Project Configuration
Create rsbuild.config.mjs：

```javascript
import { defineConfig } from '@rsbuild/core';
import { pluginCraftKit } from '@cyaod/plugin-craft-kit';

export default defineConfig({
  plugins: [
    pluginCraftKit()
  ]
});
```
For detailed configuration examples, refer to the [Playground](./playground/rsbuild.config.mjs).

### Development and Building
```bash
# Development mode (automatic certificate generation + hot reloading)
npm run dev

# Production build (automatic signing and packaging)
npm run build
```

## Advanced Configuration Options
| Parameter | Type | Default | Description |
|------|------|--------|-----|
| plugin.manifest | string | 'manifest.json' | Path to the plugin manifest file |
| plugin.ppk | string | 'private.ppk' | Path to the private key file |
| plugin.output | string | 'plugin.zip' | Output filename |
| devTools.icon.type | 'badge' \| false | false | Whether to add a Dev badge in development mode |
| devTools.upload | boolean \| object | false | Whether to automatically upload the plugin to kintone in development mode |
| devTools.upload.client | object | null | [@kintone/rest-api-client parameters](https://github.com/kintone/js-sdk/tree/main/packages/rest-api-client#parameters-for-kintonerestapiclient) |


### Command Line Tools
```bash
# Generate and install a self-signed root certificate to the system's trusted certificate store
npx @cyaod/plugin-craft-kit cert install

# Uninstall the plugin-craft-kit root certificate
npx @cyaod/plugin-craft-kit cert uninstall

# Generate and save self-signed certificate files
npx @cyaod/plugin-craft-kit cert gen [domains...] [options]
```

Available options for the gen command:

- -o, --output-dir <path> - Certificate output directory
- -c, --cert-file <filename> Certificate filename
- -k, --key-file <filename> Private key filename

## License

This project is licensed under the MIT License.

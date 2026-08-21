# xmlf666-plugin-manager（profile 安装版）

官方 profile 机制安装的"插件管理"插件：host 端插件管理网关 + 浏览器"插件管理"设置分区（列出 `$DSH_HOME/plugin` 下的插件）。不改 DSH 源码。插件名带 `xmlf666-` 前缀，避免与其他用户的插件重名。

## 安装（三步）

```cmd
REM 1. 把子包复制进目标 profile 的 node_modules（默认 web：~/.dsh/profiles/web/node_modules）
node link.mjs

REM 2. 注册聚合包（在任意 harness 源码目录执行）
cd /d <harness checkout>
pnpm dsh plugin --profile web add link:<本目录的绝对路径>

REM 3. 重启
pnpm run dsh web
```

## 卸载（两步，彻底干净）

```cmd
REM 1. 移除 profile 配置（bundles/依赖）
cd /d <harness checkout>
pnpm run dsh plugin --profile web remove xmlf666-plugin-manager

REM 2. 删除目标 profile node_modules 里的插件副本（聚合包 + 子包）
cd /d <本目录>
node unlink.mjs
```

## 说明

- 子包在 `subpackages/`（`@deepseek-ai/dsh-host-plugin-manager`、`@deepseek-ai/dsh-client-ui-plugin-manager`）。`link.mjs` 把它们**复制**进目标 profile 的 `node_modules/@deepseek-ai/`（默认 `~/.dsh/profiles/web/node_modules/@deepseek-ai/`；真实目录而非链接，保证 host 包在 profile 依赖树内、`zod` 等依赖可解析）。与 dsh-web-ui 一致：插件只存在于 profile 依赖树，不写入 `$DSH_HOME/plugin`。
- 自定义 DSH_HOME / profile 时：`node link.mjs --home <dir> --profile <name>` / `node unlink.mjs --home <dir> --profile <name>`（`--profile` 默认 `web`）。
- 浏览器端通过同源 `/api` RPC 调用 host 网关，不依赖任何源码注入。
- "插件管理"扫描的插件仓库目录仍是 `$DSH_HOME/plugin`（profile 安装的插件不在其中）。

## 安装

按官方 profile bundle 契约安装（不改 DSH 源码、无需手工拷贝）。**必须用 `file:`（拷贝）而不是 `link:`** —— `link:` 是符号链接，pnpm 不会把本包声明依赖的两个子包拷进 profile 的 `node_modules`，插件会解析不到。

```cmd
pnpm dsh plugin --profile web add file:<本目录的绝对路径>

重启
pnpm dsh web
```

`dsh plugin --profile web add` 会把本包（聚合 bundle）**连同它依赖的两个子包**一并拷进
`~/.dsh/profiles/web/node_modules`，并把声明了 `dsh.bundle` 的聚合包追加到
`dsh.profile.bundles`。子包以 `peerDependencies`（`"*"`）依赖宿主已有的
`@deepseek-ai/*` 包（`cordis`、`dsh-home-paths`、`dsh-typert-protocol` 等），运行时由
harness 的安装依赖回退目录（`~/.dsh/profiles/node_modules`）提供，无需重复安装。

- 因为 `file:` 是拷贝，**改完源码、重跑子包构建（`<子包目录> pnpm bundle`）后，需再执行一次上面的 `add file:<路径>`** 让 profile 拿到最新拷贝。

## 卸载

```cmd
pnpm dsh plugin --profile web remove xmlf666-plugin-manager
```

## 说明

- 运行后在设置中可以看到一个选项“插件管理”，进入后可查看除官方以外当前已安装的自定义插件，包括它的依赖；当前只支持以官方标准安装的插件。
- 浏览器端通过同源 `/api` RPC 调用 host 网关，不依赖任何源码注入。
- 聚合包 `xmlf666-plugin-manager` 声明了 `dsh.bundle`，其 `cordis.patch.yml` 插入两个子包：`@deepseek-ai/dsh-host-plugin-manager`（host 网关）与 `@deepseek-ai/dsh-client-ui-plugin-manager`（浏览器设置分区）。
- `link.mjs` / `unlink.mjs` 已废弃并删除：官方 `dsh plugin add` 由 pnpm 负责依赖拷贝，不再需要手工复制。

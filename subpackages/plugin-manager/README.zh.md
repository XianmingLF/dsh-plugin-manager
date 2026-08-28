# dsh-xianminglf-host-plugin-manager

[English](README.md) | 中文

插件管理器。`PluginManagerGateway` 注册 `pluginManager` 服务，通过 Typert 生成一套 Remote：

- `pluginManager/deployment` —— 部署类型（`DSH_DEPLOYMENT=test` 时为 `test`，否则为 `exe`），浏览器据此隐藏仅测试版可见的界面。
- `pluginManager/list` —— 管理根目录（默认 `$DSH_HOME/plugin`）下已安装插件目录的清单：目录名、`name.txt` 显示名（缺失时回退目录名）、`*-main` 子目录名、目录内 `SKILL.md` 摘要。
- `pluginManager/removePlugin` —— 删除一个插件目录及其 `plugin-config`/`plugin-data`/`plugin-tmp`/`plugin-yml` 下的同名托管目录；管理根之外的名称会被拒绝。

该服务仅以 Remote 形式存在，刻意不声明同进程的 Cordis `Context` 合并。客户端包通过显式 [`api-remotes`](../../api/remotes/README.zh.md) 装配消费，而不是导入 Host 实现。

## Model Experience

无：该 Host 端管理投影不注册任何提示词、工具、消息或供应商请求。

#### KV Cache effect

无：本包从不组装模型输入。

## Known Limitations and Deferred Work

- **Host 文件系统信任** —— 目录清单与删除直接使用 Node `fs` 读写管理根目录，不经由面向 agent 的文件系统策略服务。

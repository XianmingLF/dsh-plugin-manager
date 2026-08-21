# @deepseek-ai/dsh-host-plugin-manager

测试版插件管理器。`PluginManagerGateway` 注册 `pluginManager` 服务，通过 Typert 生成一套 Remote：

- `pluginManager/deployment` —— 部署类型（`DSH_DEPLOYMENT=test` 时为 `test`，否则为 `exe`），浏览器据此隐藏仅测试版可见的界面。
- `pluginManager/list` —— 管理根目录（默认 `$DSH_HOME/plugin`）下已安装插件目录的清单：目录名、`name.txt` 显示名（缺失时回退目录名）、`*-main` 子目录名、目录内 `SKILL.md` 摘要。
- `pluginManager/removePlugin` —— 删除一个插件目录及其 `plugin-config`/`plugin-data`/`plugin-tmp`/`plugin-yml` 下的同名托管目录；管理根之外的名称会被拒绝。

exe 导出在独立包（[`dsh-host-exporter`](../exporter/README.zh.md)）中提供。所有部署路径均为 `Config` 字段，带环境变量默认值（`DSH_PLUGIN_MANAGER_ROOT`），因此打包的 exe 安装保持默认配置，而测试版本管理 `D:\AI\deepSeekGUI\plugin`。

## Model Experience

无：该 Host 端管理投影不注册任何提示词、工具、消息或供应商请求。

#### KV Cache effect

无：本包从不组装模型输入。

## Known Limitations and Deferred Work

- **Host 文件系统信任** —— 目录清单与删除直接使用 Node `fs` 读写管理根目录，不经由面向 agent 的文件系统策略服务。
- **同一时间一个部署** —— `buildExe` 拒绝并发任务且没有队列；部署被宿主进程打断会遗留 `running` 状态文件，下次轮询该 job id 时才视为过期。

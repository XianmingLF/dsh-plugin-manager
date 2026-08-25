# dsh-client-xianminglf-plugin-manager

[English](README.md) | 中文

插件管理（浏览器端）。在挂载了 plugin-manager 网关的每个安装中注册**设置分区 插件管理**：管理根目录（`pluginManager/list`）之上的四列表格（名称 / 插件名称 / 详细 / 删除）。名称列优先取插件目录内 `name.txt`；插件名称列显示目录名（插件 `*-main` 文件夹的上级目录）。"详细"展开该行，展示插件内发现的 `SKILL.md` 列表；"删除"先内联确认，再调用 `pluginManager/removePlugin`。

exe 导出是独立的设置分区，由 [`ui-exporter`](../ui-exporter/README.zh.md) 提供。该分区是通用插件界面（不按部署类型门控），安装插件后打包的 exe 也会显示。本包通过显式 [`api-remotes`](../../api/remotes/README.zh.md) 装配消费 Host 网关。

## Model Experience

无：该浏览器端贡献不注册任何提示词、工具、消息或供应商请求。

#### KV Cache effect

无：本包从不组装模型输入。

## Known Limitations and Deferred Work

- **内联确认** —— 删除确认使用轻量内联控件，而非共享模态组件。

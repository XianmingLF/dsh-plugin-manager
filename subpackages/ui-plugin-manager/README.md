# dsh-client-xianminglf-plugin-manager

English | [中文](README.zh.md)

Plugin management for the dsh web GUI, browser half. Registers the **Settings section 插件管理** in every harness installation that mounts the plugin-manager gateway: a four-column catalog (名称 / 插件名称 / 详细 / 删除) over the managed plugin root (`pluginManager/list`). The name column prefers `name.txt` inside the plugin directory; the plugin-name column shows the directory name (the parent of the plugin's `*-main` folder). 详细 expands the row to the plugin's discovered `SKILL.md` list; 删除 confirms inline before calling `pluginManager/removePlugin`.

## Model Experience

None, as this browser contribution registers no prompt, tool, message, or provider request.

#### KV Cache effect

None; this package never assembles model input.

## Known Limitations and Deferred Work

- **Inline confirmations** — delete confirmations are lightweight inline controls, not the shared modal machinery.

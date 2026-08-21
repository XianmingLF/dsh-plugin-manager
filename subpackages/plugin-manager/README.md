# @deepseek-ai/dsh-host-plugin-manager

English | [中文](README.zh.md)

Test-version plugin manager for the dsh web GUI. `PluginManagerGateway` registers the `pluginManager` service and publishes generated direct Remotes under one namespace:

- `pluginManager/deployment` — the deployment flavor (`test` when `DSH_DEPLOYMENT=test`, otherwise `exe`); the browser gates test-only surfaces on it.
- `pluginManager/list` — catalog of installed plugin directories under the managed plugin root (default `$DSH_HOME/plugin`): plugin directory name, display name from `name.txt` (falling back to the directory name), the plugin's `*-main` subdirectory name, and the `SKILL.md` summaries discovered under the directory.
- `pluginManager/removePlugin` — delete one plugin directory plus its managed siblings under `plugin-config`/`plugin-data`/`plugin-tmp`/`plugin-yml` when present; names outside the managed root are rejected.

Exe export lives in its own package ([`dsh-host-exporter`](../exporter/README.md)). All deployment paths are `Config` fields with environment-derived defaults (`DSH_PLUGIN_MANAGER_ROOT`), so a packaged exe installation keeps its default configuration while the test harness manages `D:\AI\deepSeekGUI\plugin`.

The service is Remote-only and deliberately declares no same-process Cordis `Context` merge. Client packages consume it through the explicit [`api-remotes`](../../api/remotes/README.md) assembly rather than importing the Host implementation.

## Model Experience

None, as this Host-only management projection registers no prompt, tool, message, or provider request.

#### KV Cache effect

None; this package never assembles model input.

## Known Limitations and Deferred Work

- **Host-filesystem trust** — the catalog and deletion read and write the managed plugin root directly with Node `fs`; the root is not mediated by the agent-facing filesystem policy service.
- **One deploy at a time** — `buildExe` rejects concurrent jobs and offers no queue; a deploy interrupted by the host process leaves a `running` status file behind, which the next boot treats as stale until its job id is polled.

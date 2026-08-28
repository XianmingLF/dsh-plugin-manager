> 中文: [README.md](README.md)

## Install

```cmd
cd <harness directory>

# Option 1: install from npm registry
pnpm dsh plugin --profile web add @xianminglf/plugin-manager

# Option 2: install from source (local directory)
pnpm dsh plugin --profile web add file:<this directory path>

Restart
pnpm dsh web
```

## Uninstall

```cmd
cd <harness directory>
pnpm dsh plugin --profile web remove @xianminglf/plugin-manager
```

## Notes

- After it runs, a “插件管理” (Plugin Manager) entry appears in Settings. Open it to see every non-official custom plugin currently installed (name, version, description), and to enable/disable or delete them.
- Only plugins installed through the official standard are supported.
- The plugin supports true hot update: enable/disable takes effect immediately through `disabled` rows in the profile's user layer (`cordis.patch.yml`) via HMR recomposition; the plugin always stays in the profile.

## Self-delete recovery (important)

If this plugin is deleted directly (and its package references are left behind in the profile), the next `dsh web` fails, for example:

```
Failed to load plugins
failed to import loader entry ... (@xianminglf/plugin-manager): client-modules: bundle script /plugins/@xianminglf/plugin-manager/client.js?... failed to load
```

Run the **one-click recovery script** to scrub the leftover plugin references (dependencies / bundles / node_modules) from the profile so `dsh web` boots cleanly again (double-click on Windows, run on Unix):

| Platform | Script |
|---|---|
| Windows | double-click **`win10或者win11不小心把这个插件删了双击这个.cmd`** |
| Unix | `bash unix不小心把这个插件删了双击这个.sh` |

```cmd
REM Stop dsh web first, then run in the plugin directory (one step is enough)
win10或者win11不小心把这个插件删了双击这个.cmd
```

The script (`fix-self-delete.mjs`) defaults to `~/.dsh` and the `web` profile. It removes the plugin package (`@xianminglf/plugin-manager`) from `~/.dsh/profiles/<profile>/package.json` `dependencies` and `dsh.profile.bundles`, deletes the matching `node_modules/<pkg>` directory, and (when `js-yaml` is installed) scrubs the leftover plugin rows from the user layer `cordis.patch.yml`.

Extra arguments are only needed for a non-default profile / DSH_HOME, or to switch language (defaults are fine otherwise):

```cmd
node fix-self-delete.mjs --profile <name>   REM another profile
node fix-self-delete.mjs --home <dir>        REM custom DSH_HOME
node fix-self-delete.mjs --lang zh           REM Chinese output (the default is zh; use --lang en for English)
```

> English: [README_en.md](README_en.md)

## 安装

```cmd
cd <harnees目录>

配置插件
pnpm dsh plugin --profile web add file:<本目录路径>

重启即可
pnpm dsh web
```

## 卸载

```cmd
cd <harnees目录>
pnpm dsh plugin --profile web remove xianminglf-plugin-manager
```

## 说明

- 运行后在设置中会出现“插件管理”，可查看除官方以外当前已安装的自定义插件（含名称、版本、说明），并支持启用/停用与删除。
- 只支持以官方标准安装的插件。
- 插件支持真正的热更新：启用/停用通过 profile 用户层（`cordis.patch.yml`）的 `disabled` 行即时生效（HMR 热重组），插件始终保留在 profile 中。

## 自删除恢复（重要）

如果不小心把这个插件自己删除了（删除后 profile 里仍可能残留它的包引用），下次 `dsh web` 会报错，例如：

```
Failed to load plugins
failed to import loader entry ... (dsh-client-xianminglf-plugin-manager): client-modules: bundle script /plugins/dsh-client-xianminglf-plugin-manager/client.js?... failed to load
```

此时运行**一键恢复脚本**，清理 profile 里残留的该插件引用（依赖/bundles/node_modules），即可正常启动（Windows 双击，Unix 执行）：

| 平台 | 脚本 |
|---|---|
| Windows | 双击 **`win10或者win11不小心把这个插件删了双击这个.cmd`** |
| Unix | `bash unix不小心把这个插件删了双击这个.sh` |

```cmd
REM 先停掉 dsh web，然后在插件目录执行（一次即可）
win10或者win11不小心把这个插件删了双击这个.cmd
```

脚本（`fix-self-delete.mjs`）默认用 `~/.dsh` 和 `web` profile，会：从 `~/.dsh/profiles/<profile>/package.json` 的 `dependencies` 与 `dsh.profile.bundles` 移除该插件的三个包（`xianminglf-plugin-manager`/`dsh-xianminglf-host-plugin-manager`/`dsh-client-xianminglf-plugin-manager`）、删除对应的 `node_modules/<pkg>` 目录，并（若本机装有 `js-yaml`）清理用户层 `cordis.patch.yml` 里残留的该插件行。

如需指定其它 profile 或 DSH_HOME，或切换语言，才需要额外参数（默认不用）：

```cmd
node fix-self-delete.mjs --profile <name>   REM 其它 profile
node fix-self-delete.mjs --home <dir>        REM 自定义 DSH_HOME
node fix-self-delete.mjs --lang en           REM 英文输出
```



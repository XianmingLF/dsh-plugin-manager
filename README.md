> English: [README_en.md](README_en.md)

## 安装

```cmd
cd <harness目录>

# 方式一（推荐）：从 npm registry 安装，无需 git / 登录 / 密钥
pnpm dsh plugin --profile web add @xianminglf/plugin-manager

# 方式二：从 GitHub 安装（需要本机 git 可用）
pnpm dsh plugin --profile web add https://github.com/XianmingLF/xmlf-plugin-manager.git

# 方式三：本地目录安装（开发时）
pnpm dsh plugin --profile web add file:<本目录路径>

重启即可
pnpm dsh web
```

> 注意：pnpm 解析 git URL 依赖时默认走 SSH 协议（`git+ssh://git@github.com/...`），
> 未配置 GitHub SSH 密钥 / 凭据的机器会要求认证（公共仓库也一样）。
> 若遇到该问题，可执行以下任一方案：
> - 使用上面的方式一（npm registry，零配置）；
> - 或让 git 改用 HTTPS：
>   `git config --global url."https://github.com/".insteadOf "git+ssh://git@github.com/"`

## 卸载

```cmd
cd <harness目录>
pnpm dsh plugin --profile web remove @xianminglf/plugin-manager
```

## 说明

- 运行后在设置中会出现“插件管理”，可查看除官方以外当前已安装的自定义插件（含名称、版本、说明），并支持启用/停用与删除。
- 只支持以官方标准安装的插件。
- 插件支持真正的热更新：启用/停用通过 profile 用户层（`cordis.patch.yml`）的 `disabled` 行即时生效（HMR 热重组），插件始终保留在 profile 中。
- 本包是单包双面插件：同一入口既是 host 网关也是浏览器 UI（通过 `dsh.client` 声明发布到浏览器 roster），不依赖任何 `file:` 子包，已发布到 npm（`@xianminglf/plugin-manager`）。

## 自删除恢复（重要）

如果不小心把这个插件自己删除了（删除后 profile 里仍可能残留它的包引用），下次 `dsh web` 会报错，例如：

```
Failed to load plugins
failed to import loader entry ... (@xianminglf/plugin-manager): client-modules: bundle script /plugins/@xianminglf/plugin-manager/client.js?... failed to load
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

脚本（`fix-self-delete.mjs`）默认用 `~/.dsh` 和 `web` profile，会：从 `~/.dsh/profiles/<profile>/package.json` 的 `dependencies` 与 `dsh.profile.bundles` 移除本插件包（`@xianminglf/plugin-manager`）、删除对应的 `node_modules/<pkg>` 目录，并（若本机装有 `js-yaml`）清理用户层 `cordis.patch.yml` 里残留的该插件行。

如需指定其它 profile 或 DSH_HOME，或切换语言，才需要额外参数（默认不用）：

```cmd
node fix-self-delete.mjs --profile <name>   REM 其它 profile
node fix-self-delete.mjs --home <dir>        REM 自定义 DSH_HOME
node fix-self-delete.mjs --lang en           REM 英文输出
```

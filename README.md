## 安装

```cmd
步骤1 初始化配置 本目录
node link.mjs

步骤1 注册包体 harness目录
pnpm dsh plugin --profile web add link:<本目录的绝对路径>

步骤1 重启
pnpm dsh web
```

## 卸载 按顺序

```cmd
step 1. 移除包体 harness目录
pnpm dsh plugin --profile web remove xmlf666-plugin-manager

step 2. 移除配置 本目录
node unlink.mjs
```

## 说明

- 在运行后 可以在设置中可以看到一个选项,插件管理,进入后可查看除官方以外当前已安装的自定义插件,当前只支持以官方标准安装的插件。
- 当前只支持以官方标准安装的插件。
- 浏览器端通过同源 `/api` RPC 调用 host 网关，不依赖任何源码注入。

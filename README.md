## 安装

```cmd
pnpm dsh plugin --profile web add file:<本目录路径>

重启
cd <harnees目录>
pnpm dsh web
```

## 卸载

```cmd
pnpm dsh plugin --profile web remove xianminglf-plugin-manager
```

## 说明

- 运行后在设置中可以看到一个选项“插件管理”，进入后可查看除官方以外当前已安装的自定义插件，包括它的依赖。
- 只支持以官方标准安装的插件。


#!/usr/bin/env bash
# 一键修复（中文）。先停掉 dsh web，再运行本脚本。
cd "$(dirname "$0")"
node fix-self-delete.mjs --lang zh "$@"
echo
echo "已清理完成，现在可以重新启动 dsh web。"
printf "按回车键关闭窗口... "
read -r _

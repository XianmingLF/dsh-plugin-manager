#!/usr/bin/env node
/**
 * Recover from a broken self-delete of this plugin-manager plugin.
 *
 * If the plugin is deleted directly (or its files removed) while the `web`
 * profile still references it, the next `dsh web` fails to load the removed
 * client bundle (e.g. `bundle script /plugins/xianminglf-plugin-manager/client.js ... failed to load`).
 * Run this script to scrub every remaining reference to the plugin's package
 * from the profile so `dsh web` boots cleanly again.
 *
 * It removes, for the given profile:
 *   - the plugin package from `package.json` `dependencies` and `dsh.profile.bundles`
 *   - stale user-patch rows (`cordis.patch.yml`) that reference the package or the plugin's row ids
 *   - the matching `node_modules/<pkg>` directory
 *
 * Usage:
 *   node fix-self-delete.mjs                          # DSH_HOME / ~/.dsh, profile web, Chinese output
 *   node fix-self-delete.mjs --lang en                # English output
 *   node fix-self-delete.mjs --profile <name>         # another profile
 *   node fix-self-delete.mjs --home <dir>             # custom DSH_HOME
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const argv = process.argv.slice(2)
const langIndex = argv.indexOf('--lang')
const EN = langIndex >= 0 && argv[langIndex + 1] === 'en'
const head = EN ? '[fix]' : '[修复]'
/** Print one line in the selected language (zh, en). */
const say = (zh, en) => console.log(`${head} ${EN ? en : zh}`)

const homeIndex = argv.indexOf('--home')
const profileIndex = argv.indexOf('--profile')
const home = homeIndex >= 0
  ? resolve(argv[homeIndex + 1])
  : process.env.DSH_HOME && process.env.DSH_HOME.trim()
    ? resolve(process.env.DSH_HOME)
    : join(homedir(), '.dsh')
const profile = profileIndex >= 0 ? argv[profileIndex + 1] : 'web'

/** The plugin's own package (single dual-face package). */
const PKGS = [
  'xianminglf-plugin-manager',
]
/** The row id this plugin's bundle patch inserts. */
const ROW_IDS = ['plugin-manager']

const profileDir = join(home, 'profiles', profile)
const manifestPath = join(profileDir, 'package.json')
const userPatchPath = join(profileDir, 'cordis.patch.yml')

let changed = false

// 1) Scrub the profile manifest: dependencies + dsh.profile.bundles (JSON only).
if (existsSync(manifestPath)) {
  const raw = readFileSync(manifestPath, 'utf8')
  const manifest = JSON.parse(raw)
  const before = JSON.stringify(manifest)
  if (manifest.dependencies) for (const pkg of PKGS) delete manifest.dependencies[pkg]
  const bundles = manifest.dsh?.profile?.bundles
  if (Array.isArray(bundles)) manifest.dsh.profile.bundles = bundles.filter(b => !PKGS.includes(b))
  if (JSON.stringify(manifest) !== before) {
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
    say(`已从 ${manifestPath} 的 dependencies / dsh.profile.bundles 移除该插件的包`, `removed plugin packages from ${manifestPath} dependencies / dsh.profile.bundles`)
    changed = true
  } else {
    say(`${manifestPath} 中没有该插件的引用`, `${manifestPath} had no plugin references`)
  }
} else {
  say(`未找到 profile 清单：${manifestPath}`, `no profile manifest at ${manifestPath}`)
}

// 2) Scrub the user patch layer (cordis.patch.yml). Requires js-yaml; if it is
//    unavailable we skip safely rather than risk corrupting the file (the
//    manifest fix above already removes the broken bundles entry, which is what
//    stops the client-bundle load error).
if (existsSync(userPatchPath)) {
  let yaml
  try {
    yaml = (await import('js-yaml')).default
  } catch {
    say(`跳过用户层清理 ${userPatchPath}（未安装 js-yaml；不影响本次恢复）`, `skipped user-patch scrub at ${userPatchPath} (js-yaml not installed; not required for recovery)`)
    yaml = null
  }
  if (yaml !== null) {
    const parsed = yaml.load(readFileSync(userPatchPath, 'utf8'))
    const entries = (Array.isArray(parsed) ? parsed : []).filter((entry) => {
      if (entry === null || typeof entry !== 'object') return true
      let drop = typeof entry.name === 'string' && PKGS.includes(entry.name)
      if (!drop && Array.isArray(entry.insert)) {
        const beforeLen = entry.insert.length
        entry.insert = entry.insert.filter(row =>
          !(row && typeof row === 'object' && (
            (typeof row.name === 'string' && PKGS.includes(row.name))
            || (typeof row.id === 'string' && ROW_IDS.includes(row.id))
          )))
        drop = entry.insert.length !== beforeLen
      }
      if (!drop && typeof entry.id === 'string' && ROW_IDS.includes(entry.id)) drop = true
      return !drop
    }).filter(entry => entry !== null && typeof entry === 'object' && Object.keys(entry).length > 0)
    const next = yaml.dump(entries)
    if (next !== readFileSync(userPatchPath, 'utf8')) {
      writeFileSync(userPatchPath, next)
      say(`已清理用户层中的插件行：${userPatchPath}`, `scrubbed plugin rows from ${userPatchPath}`)
      changed = true
    } else {
      say(`用户层中没有该插件的行：${userPatchPath}`, `${userPatchPath} had no plugin rows`)
    }
  }
} else {
  say(`未找到用户层：${userPatchPath}`, `no user patch at ${userPatchPath}`)
}

// 3) Remove the plugin package directories from the profile's node_modules.
const nmRoot = join(profileDir, 'node_modules')
for (const pkg of PKGS) {
  const dir = join(nmRoot, pkg)
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true })
    say(`已删除 ${dir}`, `removed ${dir}`)
    changed = true
  }
}

if (changed) {
  say(`完成：已清理 ${profile} profile 中对已删除插件的引用，现在可以执行 'dsh --profile ${profile}' / 'dsh web' 启动。`, `done: scrubbed ${profile} profile references to the deleted plugin; start it with 'dsh --profile ${profile}' / 'dsh web'.`)
} else {
  say('无需修复：该 profile 已经是干净的。', 'nothing to fix: the profile was already clean.')
}

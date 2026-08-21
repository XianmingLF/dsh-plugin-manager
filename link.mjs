#!/usr/bin/env node
/**
 * Install this profile plugin into the target dsh profile's node_modules:
 * copies every subpackage AND this aggregate itself into
 * ~/.dsh/profiles/<profile>/node_modules as self-contained real directories,
 * then re-points the profile dependency at the node_modules copy
 * (file:./node_modules/<name>) instead of a checkout path. The profile then
 * loads the plugin entirely from its own dependency tree — deleting or moving
 * the checkout directory does not break `dsh web`.
 *
 * Usage:
 *   node link.mjs                     # default home (~/.dsh) and profile (web)
 *   node link.mjs --profile <name>    # a different profile
 *   node link.mjs --home <dir>        # a custom DSH_HOME
 */
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SUBPACKAGES = join(HERE, 'subpackages')
const manifest = JSON.parse(readFileSync(join(HERE, 'package.json'), 'utf8'))

const argv = process.argv.slice(2)
const homeIndex = argv.indexOf('--home')
const profileIndex = argv.indexOf('--profile')
const harnessHome = homeIndex >= 0
  ? resolve(argv[homeIndex + 1])
  : process.env.DSH_HOME && process.env.DSH_HOME.trim() ? resolve(process.env.DSH_HOME) : join(homedir(), '.dsh')
const profileName = profileIndex >= 0 ? argv[profileIndex + 1] : 'web'
const targetRoot = join(harnessHome, 'profiles', profileName, 'node_modules')

/** True when a path segment is `node_modules` (workspace link dirs must not be copied). */
const isNodeModulesPath = source => source.split(sep).includes('node_modules')

/** Resolve the profile-link path for one package name (`@scope/name` or `name`). */
function linkPathFor(name) {
  if (name.startsWith('@')) {
    const [scope, bare] = name.split('/')
    return join(targetRoot, scope, bare)
  }
  return join(targetRoot, name)
}

if (!existsSync(SUBPACKAGES)) {
  console.error(`[link] no subpackages/ directory next to this script: ${SUBPACKAGES}`)
  process.exit(1)
}

// 1. Copy every subpackage into the profile's node_modules.
for (const entry of readdirSync(SUBPACKAGES).sort()) {
  const pkgDir = join(SUBPACKAGES, entry)
  if (!lstatSync(pkgDir).isDirectory()) continue
  const pkgJson = join(pkgDir, 'package.json')
  if (!existsSync(pkgJson)) continue
  let name
  try { name = JSON.parse(readFileSync(pkgJson, 'utf8')).name } catch { continue }
  if (typeof name !== 'string' || name.length === 0) continue

  const linkPath = linkPathFor(name)
  if (existsSync(linkPath)) rmSync(linkPath, { recursive: true, force: true })
  mkdirSync(dirname(linkPath), { recursive: true })
  cpSync(pkgDir, linkPath, { recursive: true, force: true })
  console.log(`[link] ${name} -> ${linkPath}`)
}

// 2. Copy this aggregate itself into the profile's node_modules as a
//    self-contained copy (no dependency on the checkout directory).
const aggregateTarget = join(targetRoot, manifest.name)
if (existsSync(aggregateTarget)) rmSync(aggregateTarget, { recursive: true, force: true })
mkdirSync(targetRoot, { recursive: true })
cpSync(HERE, aggregateTarget, { recursive: true, force: true, filter: source => !isNodeModulesPath(source) })
console.log(`[link] ${manifest.name} -> ${aggregateTarget}`)

// 3. Re-point the profile dependency at the node_modules copy so a later
//    pnpm install resolves from the profile's own tree, never the checkout.
const profilePkgPath = join(harnessHome, 'profiles', profileName, 'package.json')
if (existsSync(profilePkgPath)) {
  const parsed = JSON.parse(readFileSync(profilePkgPath, 'utf8'))
  if (parsed.dependencies?.[manifest.name] !== undefined) {
    parsed.dependencies[manifest.name] = `file:./node_modules/${manifest.name}`
    writeFileSync(profilePkgPath, JSON.stringify(parsed, null, 2) + '\n')
    console.log(`[link] ${manifest.name} dependency -> file:./node_modules/${manifest.name}`)
  }
}
console.log('[link] done')

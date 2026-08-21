#!/usr/bin/env node
/**
 * Remove the plugin copies that link.mjs placed into the target dsh profile's
 * node_modules (~/.dsh/profiles/<profile>/node_modules): the aggregate copy
 * and every subpackage. Run this together with
 * `dsh plugin --profile <name> remove <aggregate>` for a clean uninstall:
 * the remove command drops the profile configuration, this script drops the
 * copied packages.
 *
 * Usage:
 *   node unlink.mjs                     # default home (~/.dsh) and profile (web)
 *   node unlink.mjs --profile <name>
 *   node unlink.mjs --home <dir>
 */
import { existsSync, lstatSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
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

/** Resolve the profile-link path for one package name (`@scope/name` or `name`). */
function linkPathFor(name) {
  if (name.startsWith('@')) {
    const [scope, bare] = name.split('/')
    return join(targetRoot, scope, bare)
  }
  return join(targetRoot, name)
}

// 1. Remove the aggregate copy in the profile's node_modules.
const aggregateTarget = linkPathFor(manifest.name)
if (existsSync(aggregateTarget)) {
  rmSync(aggregateTarget, { recursive: true, force: true })
  console.log(`[unlink] removed ${manifest.name} from ${aggregateTarget}`)
} else {
  console.log(`[unlink] ${manifest.name} not present`)
}

if (!existsSync(SUBPACKAGES)) {
  console.error(`[unlink] no subpackages/ directory next to this script: ${SUBPACKAGES}`)
  process.exit(1)
}

for (const entry of readdirSync(SUBPACKAGES).sort()) {
  const pkgDir = join(SUBPACKAGES, entry)
  if (!lstatSync(pkgDir).isDirectory()) continue
  const pkgJson = join(pkgDir, 'package.json')
  if (!existsSync(pkgJson)) continue
  let name
  try { name = JSON.parse(readFileSync(pkgJson, 'utf8')).name } catch { continue }
  if (typeof name !== 'string' || name.length === 0) continue

  const linkPath = linkPathFor(name)
  if (existsSync(linkPath)) {
    rmSync(linkPath, { recursive: true, force: true })
    console.log(`[unlink] removed ${name} from ${linkPath}`)
  } else {
    console.log(`[unlink] ${name} not present`)
  }
}
console.log('[unlink] done')

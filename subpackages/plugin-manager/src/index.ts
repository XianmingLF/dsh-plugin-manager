/**
 * Plugin manager: catalog, inspect, and remove plugins under the managed
 * plugin root, plus the deployment flavor the browser gates test-only
 * surfaces on. Exe export lives in its own package (`@deepseek-ai/dsh-host-exporter`).
 * @module dsh-xianminglf-host-plugin-manager
 */

import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import { readdir, readFile, rm } from 'node:fs/promises'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, resolve, sep } from 'node:path'
import * as yaml from 'js-yaml'
import type { Context } from '@deepseek-ai/cordis'
import { resolveDshHome } from '@deepseek-ai/dsh-home-paths'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type {
  DeploymentFlavor,
  DeploymentInfo,
  ManagedPluginInfo,
  PluginManagerSnapshot,
  PluginSkillInfo,
  ProfilePluginInfo,
  ProfilePluginSnapshot,
  RemovePluginRequest,
  RemovePluginResult,
  RemoveProfilePluginRequest,
  RemoveProfilePluginResult,
  SetProfilePluginEnabledRequest,
  SetProfilePluginEnabledResult,
} from './types.ts'

/** Validated plugin-manager configuration. */
export interface Config {
  /** Managed plugin root holding one directory per installed plugin. Defaults to `$DSH_HOME/plugin`. */
  readonly root?: string
  /** Profile whose manifest `dependencies` are scanned for third-party plugins. Defaults to `web`. */
  readonly profileName?: string
}

/** Official first-party scope, excluded from the profile plugin catalog. */
const OFFICIAL_SCOPE = '@deepseek-ai'

/** The profile-manifest slice this gateway reconciles after a bundle removal. */
interface ProfileManifest {
  dependencies?: Record<string, string>
  dsh?: { profile?: { bundles?: string[] } }
}

/** Managed-plugin subdirectory name convention: the plugin's `main` folder. */
const MAIN_DIR_PATTERN = /-main$/i
/** Deepest directory level the skill scan descends into inside one plugin. */
const MAX_SKILL_SCAN_DEPTH = 10
/** Directory names never descended into during the skill scan. */
const SKIP_SCAN_DIRS = new Set(['node_modules', '.git', 'dist', 'build'])

/**
 * Resolve the active deployment flavor. Only an explicit `DSH_DEPLOYMENT=test`
 * marks the test harness; everything else is treated as a packaged exe.
 * @returns the deployment flavor.
 */
function deploymentFlavor(): DeploymentFlavor {
  return process.env.DSH_DEPLOYMENT === 'test' ? 'test' : 'exe'
}

/**
 * Remote service exposing plugin management.
 */
export class PluginManagerGateway extends TypertRemoteService {
  static inject = []
  private readonly root: string
  private readonly profileName: string

  /**
   * @param ctx - Host context.
   * @param config - Deployment paths; every field has an environment-derived default.
   */
  constructor(ctx: Context, config: Config = {}) {
    super(ctx, 'pluginManager')
    const home = resolveDshHome()
    this.root = resolve(config.root ?? process.env.DSH_PLUGIN_MANAGER_ROOT ?? join(home, 'plugin'))
    this.profileName = config.profileName ?? process.env.DSH_PLUGIN_MANAGER_PROFILE ?? 'web'
  }

  /**
   * Report the deployment flavor the browser gates test-only surfaces on.
   * @returns static deployment facts.
   */
  @Remote('deployment')
  deployment(): DeploymentInfo {
    return { flavor: deploymentFlavor() }
  }

  /**
   * Catalog every installed plugin directory under the managed plugin root.
   * @returns the plugin catalog with display names, main folders, and skills.
   */
  @Remote('list')
  async list(): Promise<PluginManagerSnapshot> {
    const plugins: ManagedPluginInfo[] = []
    let entries
    try {
      entries = await readdir(this.root, { withFileTypes: true })
    } catch {
      return { plugins }
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === '.system') continue
      const pluginDir = join(this.root, entry.name)
      plugins.push(await this.inspectPlugin(entry.name, pluginDir))
    }
    plugins.sort((a, b) => a.pluginName.localeCompare(b.pluginName))
    return { plugins }
  }

  /**
   * Catalog third-party plugins registered in the web profile manifest's
   * `dependencies` ($DSH_HOME/profiles/<profile>/package.json). Official
   * `@deepseek-ai/*` packages are excluded. Each dependency is resolved by its
   * specifier: a `link:`/`file:`/absolute-path specifier points at the package
   * directory directly (relative paths resolve against the profile directory),
   * otherwise the package name resolves through Node's node_modules chain.
   * Dependencies whose manifest cannot be resolved are skipped.
   * @returns the profile name and the third-party plugin catalog.
   */
  @Remote('profileList')
  async profileList(): Promise<ProfilePluginSnapshot> {
    const home = resolveDshHome()
    const profileDir = join(home, 'profiles', this.profileName)
    const manifestPath = join(profileDir, 'package.json')
    const dependencies = await this.readProfileDependencies(manifestPath)
    const userPatchDisabled = this.readUserPatchDisabledIds(join(profileDir, 'cordis.patch.yml'))
    const plugins: ProfilePluginInfo[] = []
    for (const [packageName, spec] of Object.entries(dependencies)) {
      if (packageName.startsWith(OFFICIAL_SCOPE)) continue
      const dir = this.resolvePackageDir(profileDir, packageName, spec)
      if (dir === undefined) continue
      const manifest = await this.readPackageManifest(join(dir, 'package.json'))
      if (manifest === undefined || manifest.name === undefined) continue
      plugins.push({
        packageName: manifest.name,
        displayName: manifest.displayName ?? manifest.name,
        description: manifest.description ?? '',
        spec,
        dependencies: Object.entries(manifest.dependencies ?? {})
          .map(([name, depSpec]) => ({ name, spec: depSpec })),
        enabled: !this.isPluginDisabled(dir, userPatchDisabled),
      })
    }
    plugins.sort((a, b) => a.packageName.localeCompare(b.packageName))
    return { profile: this.profileName, plugins }
  }

  /**
   * Delete one installed plugin plus its managed siblings
   * (config/data/tmp/yml directories of the same name, when present).
   * Named `removePlugin` (not `remove`) because the client Remote namespace
   * service already owns a `remove` member for unmounting mounted methods.
   * @param request - the plugin directory name to delete.
   * @returns deletion outcome; `removed: false` carries a failure reason.
   */
  @Remote('removePlugin')
  async removePlugin(request: RemovePluginRequest): Promise<RemovePluginResult> {
    const pluginDir = this.resolvePluginDir(request.pluginName)
    if (pluginDir === undefined) {
      return { removed: false, message: `插件名称无效: ${request.pluginName}` }
    }
    const failures: string[] = []
    for (const dir of [pluginDir, ...this.siblingDirs(request.pluginName)]) {
      try {
        await rm(dir, { recursive: true, force: true })
      } catch (error) {
        failures.push(`${basename(dir)}: ${String(error)}`)
      }
    }
    if (failures.length > 0) {
      return { removed: false, message: `删除失败: ${failures.join('; ')}` }
    }
    return { removed: true }
  }

  /**
   * Remove one third-party profile plugin: drop it from the profile's
   * `dependencies` via `pnpm remove` and, when it declared `dsh.bundle`, from
   * its `dsh.profile.bundles` layer stack. Equivalent to running
   * `dsh plugin --profile <profile> remove <package>`; the running `dsh` keeps
   * the plugin mounted until the next boot.
   * @param request - the profile dependency package name to remove.
   * @returns removal outcome; `removed: false` carries a failure reason.
   */
  @Remote('removeProfilePlugin')
  removeProfilePlugin(request: RemoveProfilePluginRequest): RemoveProfilePluginResult {
    const name = request.packageName
    if (typeof name !== 'string' || name.length === 0) {
      return { removed: false, message: `插件名称无效: ${String(name)}` }
    }
    const profileDir = join(resolveDshHome(), 'profiles', this.profileName)
    const manifestPath = join(profileDir, 'package.json')
    let manifest: ProfileManifest
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ProfileManifest
    } catch {
      return { removed: false, message: `profile manifest 不可读: ${manifestPath}` }
    }
    if (manifest.dependencies?.[name] === undefined) {
      return { removed: false, message: `${name} 不是 ${this.profileName} profile 的依赖` }
    }
    const result = spawnSync('pnpm', ['remove', name], {
      cwd: profileDir,
      stdio: 'ignore',
      shell: process.platform === 'win32',
    })
    if (result.error !== undefined || result.status !== 0) {
      return { removed: false, message: `pnpm remove 失败: ${result.error?.message ?? `exit ${String(result.status)}`}` }
    }
    // pnpm re-wrote the manifest with the dependency removed; re-read and drop
    // the package from the bundle layer list (mirrors `dsh plugin remove`).
    try {
      const after = JSON.parse(readFileSync(manifestPath, 'utf8')) as ProfileManifest
      if (after.dsh?.profile?.bundles?.includes(name)) {
        after.dsh = { ...after.dsh, profile: { ...after.dsh.profile, bundles: after.dsh.profile.bundles.filter(b => b !== name) } }
        writeFileSync(manifestPath, JSON.stringify(after, null, 2) + '\n')
      }
    } catch {
      // pnpm's manifest is authoritative; a failed bundle reconcile is non-fatal.
    }
    return { removed: true }
  }

  /**
   * Toggle one profile plugin's active state by adding or removing it from the
   * profile's `dsh.profile.bundles` layer stack. The package stays installed
   * (in `dependencies`/node_modules); only its participation in the composed
   * tree changes, which takes effect on the next `dsh` boot.
   * @param request - the package name and the desired active state.
   * @returns the toggle outcome; `changed: false` carries a failure reason or
   * means the plugin was already in the requested state.
   */
  @Remote('setProfilePluginEnabled')
  setProfilePluginEnabled(request: SetProfilePluginEnabledRequest): SetProfilePluginEnabledResult {
    const name = request.packageName
    if (typeof name !== 'string' || name.length === 0) {
      return { changed: false, message: `插件名称无效: ${String(name)}` }
    }
    const profileDir = join(resolveDshHome(), 'profiles', this.profileName)
    const manifestPath = join(profileDir, 'package.json')
    let manifest: ProfileManifest
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ProfileManifest
    } catch {
      return { changed: false, message: `profile manifest 不可读: ${manifestPath}` }
    }
    if (manifest.dependencies?.[name] === undefined) {
      return { changed: false, message: `${name} 不是 ${this.profileName} profile 的依赖` }
    }
    const dir = this.resolvePackageDir(profileDir, name, manifest.dependencies[name] ?? '')
    if (dir === undefined) {
      return { changed: false, message: `${name} 无法解析插件目录` }
    }
    const rowIds = new Set(this.readBundleRowIds(dir))
    if (rowIds.size === 0) {
      return { changed: false, message: `${name} 未声明可管理的 bundle 行` }
    }
    // The plugin stays in bundles (so its bundle patch rows are always composed);
    // enable/disable is toggled live by disabling its rows in the user patch layer,
    // which the harness's HMR re-composes on save.
    const bundles = manifest.dsh?.profile?.bundles ?? []
    if (!bundles.includes(name)) {
      manifest.dsh = { ...manifest.dsh, profile: { ...manifest.dsh?.profile, bundles: [...bundles, name] } }
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
    }
    const userPatchPath = join(profileDir, 'cordis.patch.yml')
    const rows = this.readUserPatchRows(userPatchPath)
    let changed = false
    if (request.enabled) {
      const next = rows.filter(row => !(typeof row === 'object' && row !== null && rowIds.has(row.id as string) && row.disabled === true))
      if (next.length !== rows.length) { writeFileSync(userPatchPath, yaml.dump(next), 'utf8'); changed = true }
    } else {
      const current = new Set(rows
        .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null && rowIds.has(row.id as string))
        .map(row => row.id as string))
      const next = [...rows]
      for (const id of rowIds) {
        if (!current.has(id)) { next.push({ id, disabled: true }); changed = true }
      }
      if (changed) writeFileSync(userPatchPath, yaml.dump(next), 'utf8')
    }
    return changed ? { changed: true } : { changed: false, message: '状态未变化' }
  }

  /** Read the ids of rows a plugin's bundle patch inserts. */
  private readBundleRowIds(pluginDir: string): string[] {
    try {
      const manifest = JSON.parse(readFileSync(join(pluginDir, 'package.json'), 'utf8')) as {
        dsh?: { bundle?: { patch?: string } }
      }
      const rel = manifest.dsh?.bundle?.patch
      if (rel === undefined) return []
      const patch = yaml.load(readFileSync(join(pluginDir, rel), 'utf8')) as Array<Record<string, unknown>>
      const ids: string[] = []
      for (const entry of patch) {
        const insert = entry?.insert
        if (!Array.isArray(insert)) continue
        for (const row of insert) {
          if (row !== null && typeof row === 'object' && typeof (row as Record<string, unknown>).id === 'string') {
            ids.push((row as Record<string, unknown>).id as string)
          }
        }
      }
      return ids
    } catch {
      return []
    }
  }

  /** Read the profile's user patch layer (`cordis.patch.yml`) as parsed entries. */
  private readUserPatchRows(patchPath: string): Array<Record<string, unknown>> {
    try {
      return yaml.load(readFileSync(patchPath, 'utf8')) as Array<Record<string, unknown>>
    } catch {
      return []
    }
  }

  /** Inspect one plugin directory into its catalog entry. */
  private async inspectPlugin(pluginName: string, pluginDir: string): Promise<ManagedPluginInfo> {
    const displayName = await this.readDisplayName(pluginDir, pluginName)
    const skills: PluginSkillInfo[] = []
    await collectSkills(pluginDir, 0, skills)
    let mainDir: string | null = null
    try {
      const entries = await readdir(pluginDir, { withFileTypes: true })
      mainDir = entries.find(e => e.isDirectory() && MAIN_DIR_PATTERN.test(e.name))?.name ?? null
    } catch {
      // A vanished plugin directory is reported once at the catalog level.
    }
    return { pluginName, displayName, mainDir, skills }
  }

  /** Read `name.txt` inside the plugin directory, falling back to the plugin name. */
  private async readDisplayName(pluginDir: string, fallback: string): Promise<string> {
    try {
      const raw = (await readFile(join(pluginDir, 'name.txt'), 'utf8')).trim()
      return raw.length > 0 ? raw : fallback
    } catch {
      return fallback
    }
  }

  /** Resolve a plugin directory name strictly inside the managed root. */
  private resolvePluginDir(pluginName: string): string | undefined {
    if (typeof pluginName !== 'string' || pluginName.length === 0) return undefined
    if (pluginName === '.' || pluginName === '..' || pluginName.includes('/') || pluginName.includes('\\')) {
      return undefined
    }
    const candidate = join(this.root, pluginName)
    /* v8 ignore next -- every name reaching this line resolves strictly inside the root; the guard is defense in depth */
    if (!candidate.startsWith(this.root + sep) || candidate === this.root) return undefined
    return candidate
  }

  /** Sibling managed directories (config/data/tmp/yml) belonging to one plugin. */
  private siblingDirs(pluginName: string): string[] {
    const home = dirname(this.root)
    return ['plugin-config', 'plugin-data', 'plugin-tmp', 'plugin-yml']
      .map(name => join(home, name, pluginName))
  }

  /** Read the `dependencies` section of a profile manifest, or an empty object. */
  private async readProfileDependencies(manifestPath: string): Promise<Record<string, string>> {
    try {
      const parsed = JSON.parse(await readFile(manifestPath, 'utf8')) as { dependencies?: Record<string, string> }
      return parsed.dependencies ?? {}
    } catch {
      return {}
    }
  }

  /** Read the set of row ids disabled in the profile's user patch layer. */
  private readUserPatchDisabledIds(patchPath: string): Set<string> {
    const disabled = new Set<string>()
    for (const row of this.readUserPatchRows(patchPath)) {
      if (typeof row === 'object' && row !== null && row.disabled === true && typeof row.id === 'string') {
        disabled.add(row.id)
      }
    }
    return disabled
  }

  /** Whether any of a plugin's bundle rows is disabled in the user patch layer. */
  private isPluginDisabled(pluginDir: string, disabledIds: Set<string>): boolean {
    return this.readBundleRowIds(pluginDir).some(id => disabledIds.has(id))
  }

  /**
   * Resolve a dependency's package directory from the profile directory.
   * A `link:`/`file:`/absolute-path specifier points at the package directory
   * directly (relative paths resolve against the profile directory); any other
   * specifier resolves the package name through Node's node_modules chain.
   * @returns the package directory, or `undefined` when the manifest is absent.
   */
  private resolvePackageDir(profileDir: string, packageName: string, spec: string): string | undefined {
    const pathSpec = this.pathFromSpec(spec)
    if (pathSpec !== undefined) {
      const candidate = isAbsolute(pathSpec) ? pathSpec : resolve(profileDir, pathSpec)
      if (existsSync(join(candidate, 'package.json'))) return candidate
    }
    for (const searchPath of createRequire(join(profileDir, 'package.json')).resolve.paths(packageName) ?? []) {
      const candidate = join(searchPath, packageName)
      if (existsSync(join(candidate, 'package.json'))) return candidate
    }
    return undefined
  }

  /**
   * Convert a dependency specifier into a directory path when it carries one.
   * `link:`/`file:` prefixes are stripped; a bare `@scope/name` or version
   * specifier yields `undefined` (resolved through node_modules instead).
   */
  private pathFromSpec(spec: string): string | undefined {
    const stripped = spec.startsWith('link:') || spec.startsWith('file:')
      ? spec.slice(spec.indexOf(':') + 1)
      : spec
    if (stripped.length === 0) return undefined
    if (isAbsolute(stripped)) return stripped
    if (stripped.startsWith('./') || stripped.startsWith('.\\') || stripped.startsWith('../') || stripped.startsWith('..\\')) {
      return stripped
    }
    return undefined
  }

  /** Read one package manifest's display fields and dependencies, or `undefined`. */
  private async readPackageManifest(
    manifestPath: string,
  ): Promise<{
    name?: string
    displayName?: string
    description?: string
    dependencies?: Record<string, string>
  } | undefined> {
    try {
      const parsed = JSON.parse(await readFile(manifestPath, 'utf8')) as {
        name?: string
        displayName?: string
        description?: string
        dependencies?: Record<string, string>
      }
      const name = typeof parsed.name === 'string' ? parsed.name : undefined
      const displayName = typeof parsed.displayName === 'string' ? parsed.displayName : undefined
      const description = typeof parsed.description === 'string' ? parsed.description : undefined
      const dependencies = parsed.dependencies !== undefined && typeof parsed.dependencies === 'object'
        ? parsed.dependencies
        : undefined
      return {
        ...(name !== undefined ? { name } : {}),
        ...(displayName !== undefined ? { displayName } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(dependencies !== undefined ? { dependencies } : {}),
      }
    } catch {
      return undefined
    }
  }
}

/** Recursively collect `SKILL.md` summaries under one plugin directory. */
async function collectSkills(dir: string, depth: number, out: PluginSkillInfo[]): Promise<void> {
  if (depth > MAX_SKILL_SCAN_DEPTH) return
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_SCAN_DIRS.has(entry.name)) continue
      await collectSkills(join(dir, entry.name), depth + 1, out)
    } else if (entry.isFile() && entry.name.toLowerCase() === 'skill.md') {
      const raw = await readFile(join(dir, entry.name), 'utf8').catch(() => '')
      const frontmatter = parseSkillFrontmatter(raw)
      out.push({
        name: frontmatter.name ?? basename(dir),
        description: frontmatter.description ?? '',
      })
    }
  }
}

/** Extract `name` and `description` from a skill file's YAML frontmatter block. */
function parseSkillFrontmatter(raw: string): { name?: string; description?: string } {
  const lines = raw.split(/\r?\n/)
  /* v8 ignore next -- split always yields at least one line, so the nullish fallback never trips */
  if ((lines[0] ?? '').trim() !== '---') return {}
  const fields: Record<string, string> = {}
  for (const rawLine of lines.slice(1)) {
    const line = rawLine.trim()
    if (line === '---') break
    const separator = line.indexOf(':')
    if (separator < 0) continue
    const key = line.slice(0, separator).trim()
    if (key !== 'name' && key !== 'description') continue
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
    if (value.length > 0) fields[key] = value
  }
  return fields
}

export default PluginManagerGateway

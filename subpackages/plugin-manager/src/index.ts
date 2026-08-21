/**
 * Test-version plugin manager: catalog, inspect, and remove plugins under the
 * managed plugin root, plus the deployment flavor the browser gates test-only
 * surfaces on. Exe export lives in its own package (`@deepseek-ai/dsh-host-exporter`).
 * @module @deepseek-ai/dsh-host-plugin-manager
 */

import { readdir, readFile, rm } from 'node:fs/promises'
import { basename, dirname, join, resolve, sep } from 'node:path'
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
 * Remote service exposing test-version plugin management.
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
      const plugin = await this.inspectPlugin(entry.name, pluginDir)
      if (plugin !== undefined) plugins.push(plugin)
    }
    plugins.sort((a, b) => a.pluginName.localeCompare(b.pluginName))
    return { plugins }
  }

  /**
   * Catalog third-party plugins installed in the profile's local node_modules
   * ($DSH_HOME/profiles/<profile>/node_modules). Every package directory
   * there (top-level and `@scope/name` entries) is a user-installed plugin:
   * entries whose `package.json` reads successfully are listed, official
   * `@deepseek-ai/*` packages are excluded, entries without a readable
   * manifest are skipped.
   * @returns the profile name and the third-party plugin catalog.
   */
  @Remote('profileList')
  async profileList(): Promise<ProfilePluginSnapshot> {
    const home = resolveDshHome()
    const nodeModules = join(home, 'profiles', this.profileName, 'node_modules')
    const plugins: ProfilePluginInfo[] = []
    const seen = new Set<string>()
    const addPackage = async (pkgDir: string): Promise<void> => {
      const manifest = await this.readPackageManifest(join(pkgDir, 'package.json'))
      if (manifest === undefined || manifest.name === undefined) return
      if (manifest.name.startsWith(OFFICIAL_SCOPE)) return
      if (seen.has(manifest.name)) return
      seen.add(manifest.name)
      plugins.push({
        packageName: manifest.name,
        displayName: manifest.displayName ?? manifest.name,
        description: manifest.description ?? '',
        spec: '',
        dependencies: Object.entries(manifest.dependencies ?? {}).map(([name, spec]) => ({ name, spec })),
      })
    }

    let entries
    try {
      entries = await readdir(nodeModules, { withFileTypes: true })
    } catch {
      return { profile: this.profileName, plugins }
    }
    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue
      if (entry.name === '.bin' || entry.name === '.pnpm') continue
      if (entry.name.startsWith('@')) {
        let scoped
        try {
          scoped = await readdir(join(nodeModules, entry.name), { withFileTypes: true })
        } catch {
          continue
        }
        for (const sub of scoped) {
          if (sub.isDirectory() || sub.isSymbolicLink()) await addPackage(join(nodeModules, entry.name, sub.name))
        }
      } else {
        await addPackage(join(nodeModules, entry.name))
      }
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

  /** Inspect one plugin directory into its catalog entry. */
  private async inspectPlugin(pluginName: string, pluginDir: string): Promise<ManagedPluginInfo | undefined> {
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
    if (!candidate.startsWith(this.root + sep) || candidate === this.root) return undefined
    return candidate
  }

  /** Sibling managed directories (config/data/tmp/yml) belonging to one plugin. */
  private siblingDirs(pluginName: string): string[] {
    const home = dirname(this.root)
    return ['plugin-config', 'plugin-data', 'plugin-tmp', 'plugin-yml']
      .map(name => join(home, name, pluginName))
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
      const displayName = typeof parsed.displayName === 'string' ? parsed.displayName : name
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
  if ((lines[0] ?? '').trim() !== '---') return {}
  const fields: Record<string, string> = {}
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index]!
    if (line.trim() === '---') break
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

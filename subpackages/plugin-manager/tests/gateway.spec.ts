import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { remoteMethods } from '@deepseek-ai/dsh-typert-protocol'
import PluginManagerGateway from '../src/index.ts'

/** Readdir/read/rm failures are injected per test through these path filters. */
let mockFailingReaddirPath: string | undefined
let mockFailingReadPath: string | undefined
let mockFailingRmPath: string | undefined

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...actual,
    readdir: vi.fn(async (...args: Parameters<typeof actual.readdir>) => {
      if (mockFailingReaddirPath !== undefined && args[0] === mockFailingReaddirPath) {
        throw new Error('directory vanished')
      }
      return actual.readdir(...args)
    }),
    readFile: vi.fn(async (...args: Parameters<typeof actual.readFile>) => {
      if (mockFailingReadPath !== undefined && args[0] === mockFailingReadPath) {
        throw new Error('unreadable')
      }
      return actual.readFile(...args)
    }),
    rm: vi.fn(async (...args: Parameters<typeof actual.rm>) => {
      if (mockFailingRmPath !== undefined && args[0] === mockFailingRmPath) {
        throw new Error('locked')
      }
      return actual.rm(...args)
    }),
  }
})

import { readdir, rm } from 'node:fs/promises'

let home: string

beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), 'dsh-plugin-manager-'))
  process.env.DSH_HOME = home
  mockFailingReaddirPath = undefined
  mockFailingReadPath = undefined
  mockFailingRmPath = undefined
})

afterEach(() => {
  vi.clearAllMocks()
  rmSync(home, { recursive: true, force: true })
  delete process.env.DSH_HOME
  delete process.env.DSH_PLUGIN_MANAGER_ROOT
  delete process.env.DSH_PLUGIN_MANAGER_PROFILE
  delete process.env.DSH_DEPLOYMENT
})

/** Boot a gateway in an isolated context with a temp DSH_HOME. */
async function harness(config: ConstructorParameters<typeof PluginManagerGateway>[1] = {}): Promise<{
  ctx: Context
  gateway: PluginManagerGateway
}> {
  const ctx = new Context()
  await ctx.plugin(PluginManagerGateway, config)
  return { ctx, gateway: ctx.get('pluginManager') as PluginManagerGateway }
}

/** Create a plugin directory tree with the given relative files. */
function makePlugin(root: string, name: string, files: Record<string, string>): string {
  const dir = join(root, name)
  mkdirSync(dir, { recursive: true })
  for (const [relative, content] of Object.entries(files)) {
    const file = join(dir, relative)
    mkdirSync(join(file, '..'), { recursive: true })
    writeFileSync(file, content, 'utf8')
  }
  return dir
}

const SKILL_FRONTMATTER = '---\nname: "Read Card"\ndescription: \'Shows file contents\'\n---\ncontent\n'

describe('PluginManagerGateway', () => {
  it('publishes four direct methods under the pluginManager namespace', async () => {
    const { gateway } = await harness()
    expect(gateway.typertRemote).toMatchObject({ serviceKey: 'pluginManager', namespace: 'pluginManager' })
    expect(remoteMethods(gateway)).toEqual([
      { method: 'deployment', invocation: { kind: 'direct' } },
      { method: 'list', invocation: { kind: 'direct' } },
      { method: 'profileList', invocation: { kind: 'direct' } },
      { method: 'removePlugin', invocation: { kind: 'direct' } },
    ])
  })

  it('reports the deployment flavor from the environment', async () => {
    const { gateway } = await harness()
    expect(gateway.deployment()).toEqual({ flavor: 'exe' })
    process.env.DSH_DEPLOYMENT = 'test'
    expect(gateway.deployment()).toEqual({ flavor: 'test' })
    process.env.DSH_DEPLOYMENT = 'production'
    expect(gateway.deployment()).toEqual({ flavor: 'exe' })
  })

  it('returns an empty catalog when the managed root is absent', async () => {
    const { gateway } = await harness()
    expect(await gateway.list()).toEqual({ plugins: [] })
  })

  it('catalogs plugins with display names, main folders, and skills', async () => {
    const root = join(home, 'plugin')
    makePlugin(root, 'alpha', {
      'name.txt': 'Alpha 显示名\n',
      'alpha-main/skill.md': SKILL_FRONTMATTER,
    })
    makePlugin(root, 'beta', {})
    makePlugin(root, 'empty-name', { 'name.txt': '\n' })
    makePlugin(root, 'gamma', { 'SKILL.md': 'plain text without frontmatter\n' })
    makePlugin(root, '.system', {})
    writeFileSync(join(root, 'loose.txt'), 'not a directory', 'utf8')

    const { gateway } = await harness()
    const snapshot = await gateway.list()
    expect(snapshot.plugins).toEqual([
      {
        pluginName: 'alpha',
        displayName: 'Alpha 显示名',
        mainDir: 'alpha-main',
        skills: [{ name: 'Read Card', description: 'Shows file contents' }],
      },
      {
        pluginName: 'beta',
        displayName: 'beta',
        mainDir: null,
        skills: [],
      },
      {
        pluginName: 'empty-name',
        displayName: 'empty-name',
        mainDir: null,
        skills: [],
      },
      {
        pluginName: 'gamma',
        displayName: 'gamma',
        mainDir: null,
        skills: [{ name: 'gamma', description: '' }],
      },
    ])
  })

  it('falls back when a skill file cannot be read', async () => {
    const root = join(home, 'plugin')
    const skillPath = join(root, 'locked', 'SKILL.md')
    makePlugin(root, 'locked', { 'SKILL.md': SKILL_FRONTMATTER })
    mockFailingReadPath = skillPath
    const { gateway } = await harness()
    const snapshot = await gateway.list()
    expect(snapshot.plugins).toEqual([{
      pluginName: 'locked',
      displayName: 'locked',
      mainDir: null,
      skills: [{ name: 'locked', description: '' }],
    }])
  })

  it('skips skill-scan noise directories and stops at the depth bound', async () => {
    const root = join(home, 'plugin')
    makePlugin(root, 'noise', {
      'node_modules/pkg/SKILL.md': SKILL_FRONTMATTER,
      '.git/SKILL.md': SKILL_FRONTMATTER,
      'dist/SKILL.md': SKILL_FRONTMATTER,
      'build/SKILL.md': SKILL_FRONTMATTER,
      'real/SKILL.md': SKILL_FRONTMATTER,
    })
    let deep = join(root, 'deep')
    for (let level = 1; level <= 11; level += 1) {
      deep = join(deep, `d${level}`)
    }
    mkdirSync(deep, { recursive: true })
    writeFileSync(join(deep, 'SKILL.md'), SKILL_FRONTMATTER, 'utf8')

    const { gateway } = await harness()
    const snapshot = await gateway.list()
    const noise = snapshot.plugins.find(plugin => plugin.pluginName === 'noise')
    expect(noise?.skills).toEqual([{ name: 'Read Card', description: 'Shows file contents' }])
    const deepPlugin = snapshot.plugins.find(plugin => plugin.pluginName === 'deep')
    expect(deepPlugin?.skills).toEqual([])
  })

  it('tolerates a vanished plugin directory during the scan', async () => {
    const root = join(home, 'plugin')
    makePlugin(root, 'broken', {})
    mockFailingReaddirPath = join(root, 'broken')
    const { gateway } = await harness()
    const snapshot = await gateway.list()
    expect(snapshot.plugins).toEqual([{
      pluginName: 'broken',
      displayName: 'broken',
      mainDir: null,
      skills: [],
    }])
  })

  it('parses frontmatter edge cases into skill summaries', async () => {
    const root = join(home, 'plugin')
    makePlugin(root, 'edge', {
      'plain/SKILL.md': 'no frontmatter here\n',
      'quoted/SKILL.md': '---\nname: "Quoted Name"\ndescription: \'Desc\'\n---\nbody\n',
      'unquoted/SKILL.md': '---\nname: Unquoted Name\ndescription: Desc\n---\nbody\n',
      'broken/SKILL.md': '---\nno separator line\ndescription: ""\nother: x\n---\nname: ignored\n',
    })
    const { gateway } = await harness()
    const snapshot = await gateway.list()
    const edge = snapshot.plugins.find(plugin => plugin.pluginName === 'edge')
    expect(edge?.skills).toHaveLength(4)
    expect(edge?.skills).toEqual(expect.arrayContaining([
      { name: 'plain', description: '' },
      { name: 'Quoted Name', description: 'Desc' },
      { name: 'Unquoted Name', description: 'Desc' },
      { name: 'broken', description: '' },
    ]))
  })

  it('reads the managed root and profile name from config and environment', async () => {
    const root = join(home, 'custom-root')
    makePlugin(root, 'zeta', {})
    const { gateway } = await harness({ root, profileName: 'custom' })
    expect((await gateway.list()).plugins.map(plugin => plugin.pluginName)).toEqual(['zeta'])
    expect((await gateway.profileList()).profile).toBe('custom')

    process.env.DSH_PLUGIN_MANAGER_ROOT = join(home, 'env-root')
    process.env.DSH_PLUGIN_MANAGER_PROFILE = 'env'
    makePlugin(join(home, 'env-root'), 'eta', {})
    const envGateway = (await harness()).gateway
    expect((await envGateway.list()).plugins.map(plugin => plugin.pluginName)).toEqual(['eta'])
    expect((await envGateway.profileList()).profile).toBe('env')
  })

  it('catalogs third-party profile plugins and skips official ones', async () => {
    const profileDir = join(home, 'profiles', 'web')
    mkdirSync(profileDir, { recursive: true })
    writeFileSync(join(profileDir, 'package.json'), JSON.stringify({
      dependencies: {
        '@deepseek-ai/dsh-core': 'workspace:^',
        'third-party': 'file:../third-party',
        'linked-pkg': 'link:./linked',
        'bare-pkg': '^1.0.0',
        'missing-pkg': 'file:./nope',
        'corrupt-pkg': 'file:../corrupt',
        'nameless-pkg': 'file:../nameless',
        'empty-spec': 'link:',
        'fs': '^0.0.0',
      },
    }), 'utf8')
    makePlugin(join(home, 'profiles'), 'third-party', { 'package.json': JSON.stringify({
      name: 'third-party',
      displayName: '第三方插件',
      description: 'Does things',
      dependencies: { 'dep-a': '^1.0.0' },
    }) })
    makePlugin(profileDir, 'linked', { 'package.json': JSON.stringify({ name: 'linked-pkg' }) })
    mkdirSync(join(profileDir, 'node_modules', 'bare-pkg'), { recursive: true })
    writeFileSync(join(profileDir, 'node_modules', 'bare-pkg', 'package.json'), JSON.stringify({
      name: 'bare-pkg',
      description: 'Installed through node_modules',
    }), 'utf8')
    makePlugin(join(home, 'profiles'), 'corrupt', { 'package.json': '{broken json' })
    makePlugin(join(home, 'profiles'), 'nameless', { 'package.json': JSON.stringify({ version: '1.0.0' }) })

    const { gateway } = await harness()
    const snapshot = await gateway.profileList()
    expect(snapshot.profile).toBe('web')
    expect(snapshot.plugins.map(plugin => plugin.packageName)).toEqual(['bare-pkg', 'linked-pkg', 'third-party'])
    const thirdParty = snapshot.plugins.find(plugin => plugin.packageName === 'third-party')
    expect(thirdParty).toMatchObject({
      displayName: '第三方插件',
      description: 'Does things',
      spec: 'file:../third-party',
      dependencies: [{ name: 'dep-a', spec: '^1.0.0' }],
    })
  })

  it('resolves absolute and Windows-relative path specifiers', async () => {
    const profileDir = join(home, 'profiles', 'web')
    mkdirSync(profileDir, { recursive: true })
    const abs = join(home, 'abs-pkg')
    makePlugin(home, 'abs-pkg', { 'package.json': JSON.stringify({ name: 'abs-pkg' }) })
    makePlugin(join(home, 'profiles'), 'rel-pkg', { 'package.json': JSON.stringify({ name: 'rel-pkg' }) })
    writeFileSync(join(profileDir, 'package.json'), JSON.stringify({
      dependencies: {
        'abs-pkg': abs,
        'rel-pkg': '..\\rel-pkg',
      },
    }), 'utf8')
    const { gateway } = await harness()
    const snapshot = await gateway.profileList()
    expect(snapshot.plugins.map(plugin => plugin.packageName)).toEqual(['abs-pkg', 'rel-pkg'])
  })

  it('falls back through the node_modules chain when the first search path misses', async () => {
    const profileDir = join(home, 'profiles', 'web')
    mkdirSync(profileDir, { recursive: true })
    writeFileSync(join(profileDir, 'package.json'), JSON.stringify({
      dependencies: { 'hoisted-pkg': '^1.0.0' },
    }), 'utf8')
    mkdirSync(join(home, 'node_modules', 'hoisted-pkg'), { recursive: true })
    writeFileSync(join(home, 'node_modules', 'hoisted-pkg', 'package.json'), JSON.stringify({
      name: 'hoisted-pkg',
    }), 'utf8')
    const { gateway } = await harness()
    const snapshot = await gateway.profileList()
    expect(snapshot.plugins.map(plugin => plugin.packageName)).toEqual(['hoisted-pkg'])
  })

  it('returns an empty profile catalog when the profile manifest is absent or dependency-free', async () => {
    const { gateway } = await harness()
    expect(await gateway.profileList()).toEqual({ profile: 'web', plugins: [] })

    const profileDir = join(home, 'profiles', 'web')
    mkdirSync(profileDir, { recursive: true })
    writeFileSync(join(profileDir, 'package.json'), JSON.stringify({}), 'utf8')
    expect(await gateway.profileList()).toEqual({ profile: 'web', plugins: [] })
  })

  it('rejects plugin names outside the managed root', async () => {
    const { gateway } = await harness()
    for (const pluginName of ['', '.', '..', 'a/b', 'a\\b']) {
      expect(await gateway.removePlugin({ pluginName })).toEqual({
        removed: false,
        message: `插件名称无效: ${pluginName}`,
      })
    }
  })

  it('removes a plugin and its managed siblings', async () => {
    const root = join(home, 'plugin')
    makePlugin(root, 'MyPlugin', { 'name.txt': 'My Plugin\n' })
    for (const sibling of ['plugin-config', 'plugin-data', 'plugin-tmp', 'plugin-yml']) {
      mkdirSync(join(home, sibling, 'MyPlugin'), { recursive: true })
    }
    const { gateway } = await harness()
    expect(await gateway.removePlugin({ pluginName: 'MyPlugin' })).toEqual({ removed: true })
    expect(await gateway.list()).toEqual({ plugins: [] })
    for (const sibling of ['plugin-config', 'plugin-data', 'plugin-tmp', 'plugin-yml']) {
      expect(await readdir(join(home, sibling))).toEqual([])
    }
  })

  it('reports a partial removal failure with the failing directory', async () => {
    const root = join(home, 'plugin')
    makePlugin(root, 'stuck', {})
    mockFailingRmPath = join(home, 'plugin-config', 'stuck')
    mkdirSync(join(home, 'plugin-config'), { recursive: true })
    const { gateway } = await harness()
    const result = await gateway.removePlugin({ pluginName: 'stuck' })
    expect(result.removed).toBe(false)
    expect(result.message).toContain('stuck')
    expect(result.message).toContain('locked')
  })

  it('registers rm through the real filesystem when nothing fails', async () => {
    const root = join(home, 'plugin')
    makePlugin(root, 'ok', {})
    const { gateway } = await harness()
    expect(await gateway.removePlugin({ pluginName: 'ok' })).toEqual({ removed: true })
    expect(vi.mocked(rm)).toHaveBeenCalled()
  })
})

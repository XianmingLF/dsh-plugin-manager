/**
 * Plugin manager: catalog, inspect, and remove plugins under the managed
 * plugin root, plus the deployment flavor the browser gates test-only
 * surfaces on. Exe export lives in its own package (`@deepseek-ai/dsh-host-exporter`).
 * @module dsh-xianminglf-host-plugin-manager
 */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { readdir, readFile, rm } from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve, sep } from 'node:path';
import * as yaml from 'js-yaml';
import { resolveDshHome } from '@deepseek-ai/dsh-home-paths';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
/** Official first-party scope, excluded from the profile plugin catalog. */
const OFFICIAL_SCOPE = '@deepseek-ai';
/** Managed-plugin subdirectory name convention: the plugin's `main` folder. */
const MAIN_DIR_PATTERN = /-main$/i;
/** Deepest directory level the skill scan descends into inside one plugin. */
const MAX_SKILL_SCAN_DEPTH = 10;
/** Directory names never descended into during the skill scan. */
const SKIP_SCAN_DIRS = new Set(['node_modules', '.git', 'dist', 'build']);
/**
 * Resolve the active deployment flavor. Only an explicit `DSH_DEPLOYMENT=test`
 * marks the test harness; everything else is treated as a packaged exe.
 * @returns the deployment flavor.
 */
function deploymentFlavor() {
    return process.env.DSH_DEPLOYMENT === 'test' ? 'test' : 'exe';
}
/**
 * Remote service exposing plugin management.
 */
let PluginManagerGateway = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _deployment_decorators;
    let _list_decorators;
    let _profileList_decorators;
    let _removePlugin_decorators;
    let _removeProfilePlugin_decorators;
    let _setProfilePluginEnabled_decorators;
    return class PluginManagerGateway extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _deployment_decorators = [Remote('deployment')];
            _list_decorators = [Remote('list')];
            _profileList_decorators = [Remote('profileList')];
            _removePlugin_decorators = [Remote('removePlugin')];
            _removeProfilePlugin_decorators = [Remote('removeProfilePlugin')];
            _setProfilePluginEnabled_decorators = [Remote('setProfilePluginEnabled')];
            __esDecorate(this, null, _deployment_decorators, { kind: "method", name: "deployment", static: false, private: false, access: { has: obj => "deployment" in obj, get: obj => obj.deployment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: obj => "list" in obj, get: obj => obj.list }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _profileList_decorators, { kind: "method", name: "profileList", static: false, private: false, access: { has: obj => "profileList" in obj, get: obj => obj.profileList }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _removePlugin_decorators, { kind: "method", name: "removePlugin", static: false, private: false, access: { has: obj => "removePlugin" in obj, get: obj => obj.removePlugin }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _removeProfilePlugin_decorators, { kind: "method", name: "removeProfilePlugin", static: false, private: false, access: { has: obj => "removeProfilePlugin" in obj, get: obj => obj.removeProfilePlugin }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setProfilePluginEnabled_decorators, { kind: "method", name: "setProfilePluginEnabled", static: false, private: false, access: { has: obj => "setProfilePluginEnabled" in obj, get: obj => obj.setProfilePluginEnabled }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = [];
        root = __runInitializers(this, _instanceExtraInitializers);
        profileName;
        /**
         * @param ctx - Host context.
         * @param config - Deployment paths; every field has an environment-derived default.
         */
        constructor(ctx, config = {}) {
            super(ctx, 'pluginManager');
            const home = resolveDshHome();
            this.root = resolve(config.root ?? process.env.DSH_PLUGIN_MANAGER_ROOT ?? join(home, 'plugin'));
            this.profileName = config.profileName ?? process.env.DSH_PLUGIN_MANAGER_PROFILE ?? 'web';
        }
        /**
         * Report the deployment flavor the browser gates test-only surfaces on.
         * @returns static deployment facts.
         */
        deployment() {
            return { flavor: deploymentFlavor() };
        }
        /**
         * Catalog every installed plugin directory under the managed plugin root.
         * @returns the plugin catalog with display names, main folders, and skills.
         */
        async list() {
            const plugins = [];
            let entries;
            try {
                entries = await readdir(this.root, { withFileTypes: true });
            }
            catch {
                return { plugins };
            }
            for (const entry of entries) {
                if (!entry.isDirectory() || entry.name === '.system')
                    continue;
                const pluginDir = join(this.root, entry.name);
                plugins.push(await this.inspectPlugin(entry.name, pluginDir));
            }
            plugins.sort((a, b) => a.pluginName.localeCompare(b.pluginName));
            return { plugins };
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
        async profileList() {
            const home = resolveDshHome();
            const profileDir = join(home, 'profiles', this.profileName);
            const manifestPath = join(profileDir, 'package.json');
            const dependencies = await this.readProfileDependencies(manifestPath);
            const userPatchDisabled = this.readUserPatchDisabledIds(join(profileDir, 'cordis.patch.yml'));
            const plugins = [];
            for (const [packageName, spec] of Object.entries(dependencies)) {
                if (packageName.startsWith(OFFICIAL_SCOPE))
                    continue;
                const dir = this.resolvePackageDir(profileDir, packageName, spec);
                if (dir === undefined)
                    continue;
                const manifest = await this.readPackageManifest(join(dir, 'package.json'));
                if (manifest === undefined || manifest.name === undefined)
                    continue;
                plugins.push({
                    packageName: manifest.name,
                    displayName: manifest.displayName ?? manifest.name,
                    description: manifest.description ?? '',
                    spec,
                    version: manifest.version ?? '',
                    enabled: !this.isPluginDisabled(dir, userPatchDisabled),
                });
            }
            plugins.sort((a, b) => a.packageName.localeCompare(b.packageName));
            return { profile: this.profileName, plugins };
        }
        /**
         * Delete one installed plugin plus its managed siblings
         * (config/data/tmp/yml directories of the same name, when present).
         * Named `removePlugin` (not `remove`) because the client Remote namespace
         * service already owns a `remove` member for unmounting mounted methods.
         * @param request - the plugin directory name to delete.
         * @returns deletion outcome; `removed: false` carries a failure reason.
         */
        async removePlugin(request) {
            const pluginDir = this.resolvePluginDir(request.pluginName);
            if (pluginDir === undefined) {
                return { removed: false, message: `插件名称无效: ${request.pluginName}` };
            }
            const failures = [];
            for (const dir of [pluginDir, ...this.siblingDirs(request.pluginName)]) {
                try {
                    await rm(dir, { recursive: true, force: true });
                }
                catch (error) {
                    failures.push(`${basename(dir)}: ${String(error)}`);
                }
            }
            if (failures.length > 0) {
                return { removed: false, message: `删除失败: ${failures.join('; ')}` };
            }
            return { removed: true };
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
        removeProfilePlugin(request) {
            const name = request.packageName;
            if (typeof name !== 'string' || name.length === 0) {
                return { removed: false, message: `插件名称无效: ${String(name)}` };
            }
            const profileDir = join(resolveDshHome(), 'profiles', this.profileName);
            const manifestPath = join(profileDir, 'package.json');
            let manifest;
            try {
                manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
            }
            catch {
                return { removed: false, message: `profile manifest 不可读: ${manifestPath}` };
            }
            if (manifest.dependencies?.[name] === undefined) {
                return { removed: false, message: `${name} 不是 ${this.profileName} profile 的依赖` };
            }
            const result = spawnSync('pnpm', ['remove', name], {
                cwd: profileDir,
                stdio: 'ignore',
                shell: process.platform === 'win32',
            });
            if (result.error !== undefined || result.status !== 0) {
                return { removed: false, message: `pnpm remove 失败: ${result.error?.message ?? `exit ${String(result.status)}`}` };
            }
            // pnpm re-wrote the manifest with the dependency removed; re-read and drop
            // the package from the bundle layer list (mirrors `dsh plugin remove`).
            try {
                const after = JSON.parse(readFileSync(manifestPath, 'utf8'));
                if (after.dsh?.profile?.bundles?.includes(name)) {
                    after.dsh = { ...after.dsh, profile: { ...after.dsh.profile, bundles: after.dsh.profile.bundles.filter(b => b !== name) } };
                    writeFileSync(manifestPath, JSON.stringify(after, null, 2) + '\n');
                }
            }
            catch {
                // pnpm's manifest is authoritative; a failed bundle reconcile is non-fatal.
            }
            return { removed: true };
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
        setProfilePluginEnabled(request) {
            const name = request.packageName;
            if (typeof name !== 'string' || name.length === 0) {
                return { changed: false, message: `插件名称无效: ${String(name)}` };
            }
            const profileDir = join(resolveDshHome(), 'profiles', this.profileName);
            const manifestPath = join(profileDir, 'package.json');
            let manifest;
            try {
                manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
            }
            catch {
                return { changed: false, message: `profile manifest 不可读: ${manifestPath}` };
            }
            if (manifest.dependencies?.[name] === undefined) {
                return { changed: false, message: `${name} 不是 ${this.profileName} profile 的依赖` };
            }
            const dir = this.resolvePackageDir(profileDir, name, manifest.dependencies[name] ?? '');
            if (dir === undefined) {
                return { changed: false, message: `${name} 无法解析插件目录` };
            }
            const rowIds = new Set(this.readBundleRowIds(dir));
            if (rowIds.size === 0) {
                return { changed: false, message: `${name} 未声明可管理的 bundle 行` };
            }
            // The plugin stays in bundles (so its bundle patch rows are always composed);
            // enable/disable is toggled live by disabling its rows in the user patch layer,
            // which the harness's HMR re-composes on save.
            const bundles = manifest.dsh?.profile?.bundles ?? [];
            if (!bundles.includes(name)) {
                manifest.dsh = { ...manifest.dsh, profile: { ...manifest.dsh?.profile, bundles: [...bundles, name] } };
                writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
            }
            const userPatchPath = join(profileDir, 'cordis.patch.yml');
            const rows = this.readUserPatchRows(userPatchPath);
            let changed = false;
            if (request.enabled) {
                const next = rows.filter(row => !(typeof row === 'object' && row !== null && rowIds.has(row.id) && row.disabled === true));
                if (next.length !== rows.length) {
                    writeFileSync(userPatchPath, yaml.dump(next), 'utf8');
                    changed = true;
                }
            }
            else {
                const current = new Set(rows
                    .filter((row) => typeof row === 'object' && row !== null && rowIds.has(row.id))
                    .map(row => row.id));
                const next = [...rows];
                for (const id of rowIds) {
                    if (!current.has(id)) {
                        next.push({ id, disabled: true });
                        changed = true;
                    }
                }
                if (changed)
                    writeFileSync(userPatchPath, yaml.dump(next), 'utf8');
            }
            return changed ? { changed: true } : { changed: false, message: '状态未变化' };
        }
        /** Read the ids of rows a plugin's bundle patch inserts. */
        readBundleRowIds(pluginDir) {
            try {
                const manifest = JSON.parse(readFileSync(join(pluginDir, 'package.json'), 'utf8'));
                const rel = manifest.dsh?.bundle?.patch;
                if (rel === undefined)
                    return [];
                const patch = yaml.load(readFileSync(join(pluginDir, rel), 'utf8'));
                const ids = [];
                for (const entry of patch) {
                    const insert = entry?.insert;
                    if (!Array.isArray(insert))
                        continue;
                    for (const row of insert) {
                        if (row !== null && typeof row === 'object' && typeof row.id === 'string') {
                            ids.push(row.id);
                        }
                    }
                }
                return ids;
            }
            catch {
                return [];
            }
        }
        /** Read the profile's user patch layer (`cordis.patch.yml`) as parsed entries. */
        readUserPatchRows(patchPath) {
            try {
                return yaml.load(readFileSync(patchPath, 'utf8'));
            }
            catch {
                return [];
            }
        }
        /** Inspect one plugin directory into its catalog entry. */
        async inspectPlugin(pluginName, pluginDir) {
            const displayName = await this.readDisplayName(pluginDir, pluginName);
            const skills = [];
            await collectSkills(pluginDir, 0, skills);
            let mainDir = null;
            try {
                const entries = await readdir(pluginDir, { withFileTypes: true });
                mainDir = entries.find(e => e.isDirectory() && MAIN_DIR_PATTERN.test(e.name))?.name ?? null;
            }
            catch {
                // A vanished plugin directory is reported once at the catalog level.
            }
            return { pluginName, displayName, mainDir, skills };
        }
        /** Read `name.txt` inside the plugin directory, falling back to the plugin name. */
        async readDisplayName(pluginDir, fallback) {
            try {
                const raw = (await readFile(join(pluginDir, 'name.txt'), 'utf8')).trim();
                return raw.length > 0 ? raw : fallback;
            }
            catch {
                return fallback;
            }
        }
        /** Resolve a plugin directory name strictly inside the managed root. */
        resolvePluginDir(pluginName) {
            if (typeof pluginName !== 'string' || pluginName.length === 0)
                return undefined;
            if (pluginName === '.' || pluginName === '..' || pluginName.includes('/') || pluginName.includes('\\')) {
                return undefined;
            }
            const candidate = join(this.root, pluginName);
            /* v8 ignore next -- every name reaching this line resolves strictly inside the root; the guard is defense in depth */
            if (!candidate.startsWith(this.root + sep) || candidate === this.root)
                return undefined;
            return candidate;
        }
        /** Sibling managed directories (config/data/tmp/yml) belonging to one plugin. */
        siblingDirs(pluginName) {
            const home = dirname(this.root);
            return ['plugin-config', 'plugin-data', 'plugin-tmp', 'plugin-yml']
                .map(name => join(home, name, pluginName));
        }
        /** Read the `dependencies` section of a profile manifest, or an empty object. */
        async readProfileDependencies(manifestPath) {
            try {
                const parsed = JSON.parse(await readFile(manifestPath, 'utf8'));
                return parsed.dependencies ?? {};
            }
            catch {
                return {};
            }
        }
        /** Read the set of row ids disabled in the profile's user patch layer. */
        readUserPatchDisabledIds(patchPath) {
            const disabled = new Set();
            for (const row of this.readUserPatchRows(patchPath)) {
                if (typeof row === 'object' && row !== null && row.disabled === true && typeof row.id === 'string') {
                    disabled.add(row.id);
                }
            }
            return disabled;
        }
        /** Whether any of a plugin's bundle rows is disabled in the user patch layer. */
        isPluginDisabled(pluginDir, disabledIds) {
            return this.readBundleRowIds(pluginDir).some(id => disabledIds.has(id));
        }
        /**
         * Resolve a dependency's package directory from the profile directory.
         * A `link:`/`file:`/absolute-path specifier points at the package directory
         * directly (relative paths resolve against the profile directory); any other
         * specifier resolves the package name through Node's node_modules chain.
         * @returns the package directory, or `undefined` when the manifest is absent.
         */
        resolvePackageDir(profileDir, packageName, spec) {
            const pathSpec = this.pathFromSpec(spec);
            if (pathSpec !== undefined) {
                const candidate = isAbsolute(pathSpec) ? pathSpec : resolve(profileDir, pathSpec);
                if (existsSync(join(candidate, 'package.json')))
                    return candidate;
            }
            for (const searchPath of createRequire(join(profileDir, 'package.json')).resolve.paths(packageName) ?? []) {
                const candidate = join(searchPath, packageName);
                if (existsSync(join(candidate, 'package.json')))
                    return candidate;
            }
            return undefined;
        }
        /**
         * Convert a dependency specifier into a directory path when it carries one.
         * `link:`/`file:` prefixes are stripped; a bare `@scope/name` or version
         * specifier yields `undefined` (resolved through node_modules instead).
         */
        pathFromSpec(spec) {
            const stripped = spec.startsWith('link:') || spec.startsWith('file:')
                ? spec.slice(spec.indexOf(':') + 1)
                : spec;
            if (stripped.length === 0)
                return undefined;
            if (isAbsolute(stripped))
                return stripped;
            if (stripped.startsWith('./') || stripped.startsWith('.\\') || stripped.startsWith('../') || stripped.startsWith('..\\')) {
                return stripped;
            }
            return undefined;
        }
        /** Read one package manifest's display fields and dependencies, or `undefined`. */
        async readPackageManifest(manifestPath) {
            try {
                const parsed = JSON.parse(await readFile(manifestPath, 'utf8'));
                const name = typeof parsed.name === 'string' ? parsed.name : undefined;
                const displayName = typeof parsed.displayName === 'string' ? parsed.displayName : undefined;
                const description = typeof parsed.description === 'string' ? parsed.description : undefined;
                const version = typeof parsed.version === 'string' ? parsed.version : undefined;
                return {
                    ...(name !== undefined ? { name } : {}),
                    ...(displayName !== undefined ? { displayName } : {}),
                    ...(description !== undefined ? { description } : {}),
                    ...(version !== undefined ? { version } : {}),
                };
            }
            catch {
                return undefined;
            }
        }
    };
})();
export { PluginManagerGateway };
/** Recursively collect `SKILL.md` summaries under one plugin directory. */
async function collectSkills(dir, depth, out) {
    if (depth > MAX_SKILL_SCAN_DEPTH)
        return;
    let entries;
    try {
        entries = await readdir(dir, { withFileTypes: true });
    }
    catch {
        return;
    }
    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (SKIP_SCAN_DIRS.has(entry.name))
                continue;
            await collectSkills(join(dir, entry.name), depth + 1, out);
        }
        else if (entry.isFile() && entry.name.toLowerCase() === 'skill.md') {
            const raw = await readFile(join(dir, entry.name), 'utf8').catch(() => '');
            const frontmatter = parseSkillFrontmatter(raw);
            out.push({
                name: frontmatter.name ?? basename(dir),
                description: frontmatter.description ?? '',
            });
        }
    }
}
/** Extract `name` and `description` from a skill file's YAML frontmatter block. */
function parseSkillFrontmatter(raw) {
    const lines = raw.split(/\r?\n/);
    /* v8 ignore next -- split always yields at least one line, so the nullish fallback never trips */
    if ((lines[0] ?? '').trim() !== '---')
        return {};
    const fields = {};
    for (const rawLine of lines.slice(1)) {
        const line = rawLine.trim();
        if (line === '---')
            break;
        const separator = line.indexOf(':');
        if (separator < 0)
            continue;
        const key = line.slice(0, separator).trim();
        if (key !== 'name' && key !== 'description')
            continue;
        const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
        if (value.length > 0)
            fields[key] = value;
    }
    return fields;
}
export default PluginManagerGateway;
//# sourceMappingURL=index.js.map
import { readFile, readdir, rm } from "node:fs/promises";
import { basename, dirname, join, resolve, sep } from "node:path";
import { resolveDshHome } from "@deepseek-ai/dsh-home-paths";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
//#region lib/types/index.js
/**
* Test-version plugin manager: catalog, inspect, and remove plugins under the
* managed plugin root, plus the deployment flavor the browser gates test-only
* surfaces on. Exe export lives in its own package (`@deepseek-ai/dsh-host-exporter`).
* @module @deepseek-ai/dsh-host-plugin-manager
*/
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/** Official first-party scope, excluded from the profile plugin catalog. */
const OFFICIAL_SCOPE = "@deepseek-ai";
/** Managed-plugin subdirectory name convention: the plugin's `main` folder. */
const MAIN_DIR_PATTERN = /-main$/i;
/** Deepest directory level the skill scan descends into inside one plugin. */
const MAX_SKILL_SCAN_DEPTH = 10;
/** Directory names never descended into during the skill scan. */
const SKIP_SCAN_DIRS = new Set([
	"node_modules",
	".git",
	"dist",
	"build"
]);
/**
* Resolve the active deployment flavor. Only an explicit `DSH_DEPLOYMENT=test`
* marks the test harness; everything else is treated as a packaged exe.
* @returns the deployment flavor.
*/
function deploymentFlavor() {
	return process.env.DSH_DEPLOYMENT === "test" ? "test" : "exe";
}
/**
* Remote service exposing test-version plugin management.
*/
let PluginManagerGateway = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _deployment_decorators;
	let _list_decorators;
	let _profileList_decorators;
	let _removePlugin_decorators;
	return class PluginManagerGateway extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_deployment_decorators = [Remote("deployment")];
			_list_decorators = [Remote("list")];
			_profileList_decorators = [Remote("profileList")];
			_removePlugin_decorators = [Remote("removePlugin")];
			__esDecorate(this, null, _deployment_decorators, {
				kind: "method",
				name: "deployment",
				static: false,
				private: false,
				access: {
					has: (obj) => "deployment" in obj,
					get: (obj) => obj.deployment
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _list_decorators, {
				kind: "method",
				name: "list",
				static: false,
				private: false,
				access: {
					has: (obj) => "list" in obj,
					get: (obj) => obj.list
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _profileList_decorators, {
				kind: "method",
				name: "profileList",
				static: false,
				private: false,
				access: {
					has: (obj) => "profileList" in obj,
					get: (obj) => obj.profileList
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _removePlugin_decorators, {
				kind: "method",
				name: "removePlugin",
				static: false,
				private: false,
				access: {
					has: (obj) => "removePlugin" in obj,
					get: (obj) => obj.removePlugin
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = [];
		root = __runInitializers(this, _instanceExtraInitializers);
		profileName;
		/**
		* @param ctx - Host context.
		* @param config - Deployment paths; every field has an environment-derived default.
		*/
		constructor(ctx, config = {}) {
			super(ctx, "pluginManager");
			const home = resolveDshHome();
			this.root = resolve(config.root ?? process.env.DSH_PLUGIN_MANAGER_ROOT ?? join(home, "plugin"));
			this.profileName = config.profileName ?? process.env.DSH_PLUGIN_MANAGER_PROFILE ?? "web";
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
			} catch {
				return { plugins };
			}
			for (const entry of entries) {
				if (!entry.isDirectory() || entry.name === ".system") continue;
				const pluginDir = join(this.root, entry.name);
				const plugin = await this.inspectPlugin(entry.name, pluginDir);
				if (plugin !== void 0) plugins.push(plugin);
			}
			plugins.sort((a, b) => a.pluginName.localeCompare(b.pluginName));
			return { plugins };
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
		async profileList() {
			const nodeModules = join(resolveDshHome(), "profiles", this.profileName, "node_modules");
			const plugins = [];
			const seen = /* @__PURE__ */ new Set();
			const addPackage = async (pkgDir) => {
				const manifest = await this.readPackageManifest(join(pkgDir, "package.json"));
				if (manifest === void 0 || manifest.name === void 0) return;
				if (manifest.name.startsWith(OFFICIAL_SCOPE)) return;
				if (seen.has(manifest.name)) return;
				seen.add(manifest.name);
				plugins.push({
					packageName: manifest.name,
					displayName: manifest.displayName ?? manifest.name,
					description: manifest.description ?? "",
					spec: "",
					dependencies: Object.entries(manifest.dependencies ?? {}).map(([name, spec]) => ({
						name,
						spec
					}))
				});
			};
			let entries;
			try {
				entries = await readdir(nodeModules, { withFileTypes: true });
			} catch {
				return {
					profile: this.profileName,
					plugins
				};
			}
			for (const entry of entries) {
				if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
				if (entry.name === ".bin" || entry.name === ".pnpm") continue;
				if (entry.name.startsWith("@")) {
					let scoped;
					try {
						scoped = await readdir(join(nodeModules, entry.name), { withFileTypes: true });
					} catch {
						continue;
					}
					for (const sub of scoped) if (sub.isDirectory() || sub.isSymbolicLink()) await addPackage(join(nodeModules, entry.name, sub.name));
				} else await addPackage(join(nodeModules, entry.name));
			}
			plugins.sort((a, b) => a.packageName.localeCompare(b.packageName));
			return {
				profile: this.profileName,
				plugins
			};
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
			if (pluginDir === void 0) return {
				removed: false,
				message: `插件名称无效: ${request.pluginName}`
			};
			const failures = [];
			for (const dir of [pluginDir, ...this.siblingDirs(request.pluginName)]) try {
				await rm(dir, {
					recursive: true,
					force: true
				});
			} catch (error) {
				failures.push(`${basename(dir)}: ${String(error)}`);
			}
			if (failures.length > 0) return {
				removed: false,
				message: `删除失败: ${failures.join("; ")}`
			};
			return { removed: true };
		}
		/** Inspect one plugin directory into its catalog entry. */
		async inspectPlugin(pluginName, pluginDir) {
			const displayName = await this.readDisplayName(pluginDir, pluginName);
			const skills = [];
			await collectSkills(pluginDir, 0, skills);
			let mainDir = null;
			try {
				mainDir = (await readdir(pluginDir, { withFileTypes: true })).find((e) => e.isDirectory() && MAIN_DIR_PATTERN.test(e.name))?.name ?? null;
			} catch {}
			return {
				pluginName,
				displayName,
				mainDir,
				skills
			};
		}
		/** Read `name.txt` inside the plugin directory, falling back to the plugin name. */
		async readDisplayName(pluginDir, fallback) {
			try {
				const raw = (await readFile(join(pluginDir, "name.txt"), "utf8")).trim();
				return raw.length > 0 ? raw : fallback;
			} catch {
				return fallback;
			}
		}
		/** Resolve a plugin directory name strictly inside the managed root. */
		resolvePluginDir(pluginName) {
			if (typeof pluginName !== "string" || pluginName.length === 0) return void 0;
			if (pluginName === "." || pluginName === ".." || pluginName.includes("/") || pluginName.includes("\\")) return;
			const candidate = join(this.root, pluginName);
			if (!candidate.startsWith(this.root + sep) || candidate === this.root) return void 0;
			return candidate;
		}
		/** Sibling managed directories (config/data/tmp/yml) belonging to one plugin. */
		siblingDirs(pluginName) {
			const home = dirname(this.root);
			return [
				"plugin-config",
				"plugin-data",
				"plugin-tmp",
				"plugin-yml"
			].map((name) => join(home, name, pluginName));
		}
		/** Read one package manifest's display fields and dependencies, or `undefined`. */
		async readPackageManifest(manifestPath) {
			try {
				const parsed = JSON.parse(await readFile(manifestPath, "utf8"));
				const name = typeof parsed.name === "string" ? parsed.name : void 0;
				const displayName = typeof parsed.displayName === "string" ? parsed.displayName : name;
				const description = typeof parsed.description === "string" ? parsed.description : void 0;
				const dependencies = parsed.dependencies !== void 0 && typeof parsed.dependencies === "object" ? parsed.dependencies : void 0;
				return {
					...name !== void 0 ? { name } : {},
					...displayName !== void 0 ? { displayName } : {},
					...description !== void 0 ? { description } : {},
					...dependencies !== void 0 ? { dependencies } : {}
				};
			} catch {
				return;
			}
		}
	};
})();
/** Recursively collect `SKILL.md` summaries under one plugin directory. */
async function collectSkills(dir, depth, out) {
	if (depth > MAX_SKILL_SCAN_DEPTH) return;
	let entries;
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) if (entry.isDirectory()) {
		if (SKIP_SCAN_DIRS.has(entry.name)) continue;
		await collectSkills(join(dir, entry.name), depth + 1, out);
	} else if (entry.isFile() && entry.name.toLowerCase() === "skill.md") {
		const frontmatter = parseSkillFrontmatter(await readFile(join(dir, entry.name), "utf8").catch(() => ""));
		out.push({
			name: frontmatter.name ?? basename(dir),
			description: frontmatter.description ?? ""
		});
	}
}
/** Extract `name` and `description` from a skill file's YAML frontmatter block. */
function parseSkillFrontmatter(raw) {
	const lines = raw.split(/\r?\n/);
	if ((lines[0] ?? "").trim() !== "---") return {};
	const fields = {};
	for (let index = 1; index < lines.length; index += 1) {
		const line = lines[index];
		if (line.trim() === "---") break;
		const separator = line.indexOf(":");
		if (separator < 0) continue;
		const key = line.slice(0, separator).trim();
		if (key !== "name" && key !== "description") continue;
		const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
		if (value.length > 0) fields[key] = value;
	}
	return fields;
}
//#endregion
export { PluginManagerGateway, PluginManagerGateway as default };

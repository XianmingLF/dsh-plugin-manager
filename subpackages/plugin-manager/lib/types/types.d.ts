/** Plugin-management payloads. @module @deepseek-ai/dsh-host-plugin-manager */
/** Deployment flavor reported by the plugin manager: test harness vs packaged exe. */
export type DeploymentFlavor = 'test' | 'exe';
/** Static deployment facts the browser gates test-only surfaces on. */
export interface DeploymentInfo {
    /** The active deployment flavor, derived from `DSH_DEPLOYMENT`. */
    readonly flavor: DeploymentFlavor;
}
/** One skill discovered inside a managed plugin directory. */
export interface PluginSkillInfo {
    /** Skill name from `SKILL.md` frontmatter, or the containing directory name. */
    readonly name: string;
    /** Skill description from `SKILL.md` frontmatter, when present. */
    readonly description: string;
}
/** One installed plugin directory under the managed plugin root. */
export interface ManagedPluginInfo {
    /** Plugin directory name; the parent of the plugin's `*-main` folder. */
    readonly pluginName: string;
    /** Display name: `name.txt` content when present, otherwise `pluginName`. */
    readonly displayName: string;
    /** The `*-main` subdirectory name, when the plugin carries one. */
    readonly mainDir: string | null;
    /** Skill summaries discovered under the plugin directory. */
    readonly skills: readonly PluginSkillInfo[];
}
/** Complete plugin catalog returned by the plugin manager Remote. */
export interface PluginManagerSnapshot {
    readonly plugins: readonly ManagedPluginInfo[];
}
/** One third-party plugin registered in the web profile's `dependencies`. */
export interface ProfilePluginInfo {
    /** Package name from the profile `dependencies` (official `@deepseek-ai/*` excluded). */
    readonly packageName: string;
    /** Display name from the package manifest, falling back to the package name. */
    readonly displayName: string;
    /** One-line description from the package manifest, when present. */
    readonly description: string;
    /** The dependency specifier stored in the profile manifest. */
    readonly spec: string;
    /** Dependencies declared by the plugin's own package manifest. */
    readonly dependencies: readonly ProfileDependencyInfo[];
}
/** One dependency declared by a profile plugin's package manifest. */
export interface ProfileDependencyInfo {
    /** Dependency package name. */
    readonly name: string;
    /** Dependency specifier (version range, `workspace:*`, path, ...). */
    readonly spec: string;
}
/** Profile plugin catalog returned by the plugin manager Remote. */
export interface ProfilePluginSnapshot {
    /** The profile name scanned (e.g. `web`). */
    readonly profile: string;
    /** Third-party plugins declared in the profile manifest's `dependencies`. */
    readonly plugins: readonly ProfilePluginInfo[];
}
/** Request naming one installed plugin to delete. */
export interface RemovePluginRequest {
    readonly pluginName: string;
}
/** Outcome of a plugin deletion. */
export interface RemovePluginResult {
    readonly removed: boolean;
    /** Human-readable failure reason when `removed` is false. */
    readonly message?: string;
}
/** Request naming one third-party profile plugin to remove. */
export interface RemoveProfilePluginRequest {
    /** The profile dependency package name (e.g. `xmlf666-plugin-manager`). */
    readonly packageName: string;
}
/** Outcome of a profile-bundle removal. */
export interface RemoveProfilePluginResult {
    readonly removed: boolean;
    /** Human-readable failure reason when `removed` is false. */
    readonly message?: string;
}
//# sourceMappingURL=types.d.ts.map
/**
 * Plugin manager: catalog, inspect, and remove plugins under the managed
 * plugin root, plus the deployment flavor the browser gates test-only
 * surfaces on. Exe export lives in its own package (`@deepseek-ai/dsh-host-exporter`).
 * @module dsh-xianminglf-host-plugin-manager
 */
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { DeploymentInfo, PluginManagerSnapshot, ProfilePluginSnapshot, RemovePluginRequest, RemovePluginResult, RemoveProfilePluginRequest, RemoveProfilePluginResult, SetProfilePluginEnabledRequest, SetProfilePluginEnabledResult } from './types.ts';
/** Validated plugin-manager configuration. */
export interface Config {
    /** Managed plugin root holding one directory per installed plugin. Defaults to `$DSH_HOME/plugin`. */
    readonly root?: string;
    /** Profile whose manifest `dependencies` are scanned for third-party plugins. Defaults to `web`. */
    readonly profileName?: string;
}
/**
 * Remote service exposing plugin management.
 */
export declare class PluginManagerGateway extends TypertRemoteService {
    static inject: never[];
    private readonly root;
    private readonly profileName;
    /**
     * @param ctx - Host context.
     * @param config - Deployment paths; every field has an environment-derived default.
     */
    constructor(ctx: Context, config?: Config);
    /**
     * Report the deployment flavor the browser gates test-only surfaces on.
     * @returns static deployment facts.
     */
    deployment(): DeploymentInfo;
    /**
     * Catalog every installed plugin directory under the managed plugin root.
     * @returns the plugin catalog with display names, main folders, and skills.
     */
    list(): Promise<PluginManagerSnapshot>;
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
    profileList(): Promise<ProfilePluginSnapshot>;
    /**
     * Delete one installed plugin plus its managed siblings
     * (config/data/tmp/yml directories of the same name, when present).
     * Named `removePlugin` (not `remove`) because the client Remote namespace
     * service already owns a `remove` member for unmounting mounted methods.
     * @param request - the plugin directory name to delete.
     * @returns deletion outcome; `removed: false` carries a failure reason.
     */
    removePlugin(request: RemovePluginRequest): Promise<RemovePluginResult>;
    /**
     * Remove one third-party profile plugin: drop it from the profile's
     * `dependencies` via `pnpm remove` and, when it declared `dsh.bundle`, from
     * its `dsh.profile.bundles` layer stack. Equivalent to running
     * `dsh plugin --profile <profile> remove <package>`; the running `dsh` keeps
     * the plugin mounted until the next boot.
     * @param request - the profile dependency package name to remove.
     * @returns removal outcome; `removed: false` carries a failure reason.
     */
    removeProfilePlugin(request: RemoveProfilePluginRequest): RemoveProfilePluginResult;
    /**
     * Toggle one profile plugin's active state by adding or removing it from the
     * profile's `dsh.profile.bundles` layer stack. The package stays installed
     * (in `dependencies`/node_modules); only its participation in the composed
     * tree changes, which takes effect on the next `dsh` boot.
     * @param request - the package name and the desired active state.
     * @returns the toggle outcome; `changed: false` carries a failure reason or
     * means the plugin was already in the requested state.
     */
    setProfilePluginEnabled(request: SetProfilePluginEnabledRequest): SetProfilePluginEnabledResult;
    /** Read the ids of rows a plugin's bundle patch inserts. */
    private readBundleRowIds;
    /** Read the profile's user patch layer (`cordis.patch.yml`) as parsed entries. */
    private readUserPatchRows;
    /** Inspect one plugin directory into its catalog entry. */
    private inspectPlugin;
    /** Read `name.txt` inside the plugin directory, falling back to the plugin name. */
    private readDisplayName;
    /** Resolve a plugin directory name strictly inside the managed root. */
    private resolvePluginDir;
    /** Sibling managed directories (config/data/tmp/yml) belonging to one plugin. */
    private siblingDirs;
    /** Read the `dependencies` section of a profile manifest, or an empty object. */
    private readProfileDependencies;
    /** Read the set of row ids disabled in the profile's user patch layer. */
    private readUserPatchDisabledIds;
    /** Whether any of a plugin's bundle rows is disabled in the user patch layer. */
    private isPluginDisabled;
    /**
     * Resolve a dependency's package directory from the profile directory.
     * A `link:`/`file:`/absolute-path specifier points at the package directory
     * directly (relative paths resolve against the profile directory); any other
     * specifier resolves the package name through Node's node_modules chain.
     * @returns the package directory, or `undefined` when the manifest is absent.
     */
    private resolvePackageDir;
    /**
     * Convert a dependency specifier into a directory path when it carries one.
     * `link:`/`file:` prefixes are stripped; a bare `@scope/name` or version
     * specifier yields `undefined` (resolved through node_modules instead).
     */
    private pathFromSpec;
    /** Read one package manifest's display fields and dependencies, or `undefined`. */
    private readPackageManifest;
}
export default PluginManagerGateway;
//# sourceMappingURL=index.d.ts.map
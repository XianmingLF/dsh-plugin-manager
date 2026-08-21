/**
 * Test-version plugin manager: catalog, inspect, and remove plugins under the
 * managed plugin root, plus the deployment flavor the browser gates test-only
 * surfaces on. Exe export lives in its own package (`@deepseek-ai/dsh-host-exporter`).
 * @module @deepseek-ai/dsh-host-plugin-manager
 */
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { DeploymentInfo, PluginManagerSnapshot, ProfilePluginSnapshot, RemovePluginRequest, RemovePluginResult } from './types.ts';
/** Validated plugin-manager configuration. */
export interface Config {
    /** Managed plugin root holding one directory per installed plugin. Defaults to `$DSH_HOME/plugin`. */
    readonly root?: string;
    /** Profile whose manifest `dependencies` are scanned for third-party plugins. Defaults to `web`. */
    readonly profileName?: string;
}
/**
 * Remote service exposing test-version plugin management.
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
     * Catalog third-party plugins installed in the profile's local node_modules
     * ($DSH_HOME/profiles/<profile>/node_modules). Every package directory
     * there (top-level and `@scope/name` entries) is a user-installed plugin:
     * entries whose `package.json` reads successfully are listed, official
     * `@deepseek-ai/*` packages are excluded, entries without a readable
     * manifest are skipped.
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
    /** Inspect one plugin directory into its catalog entry. */
    private inspectPlugin;
    /** Read `name.txt` inside the plugin directory, falling back to the plugin name. */
    private readDisplayName;
    /** Resolve a plugin directory name strictly inside the managed root. */
    private resolvePluginDir;
    /** Sibling managed directories (config/data/tmp/yml) belonging to one plugin. */
    private siblingDirs;
    /** Read one package manifest's display fields and dependencies, or `undefined`. */
    private readPackageManifest;
}
export default PluginManagerGateway;
//# sourceMappingURL=index.d.ts.map
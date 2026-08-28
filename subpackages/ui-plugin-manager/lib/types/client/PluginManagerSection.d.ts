import { type ReactNode } from 'react';
import type { PluginManagerSnapshot, RemovePluginResult } from '@deepseek-ai/dsh-api-remotes/client';
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { PluginManagerLocaleKey } from './locales.ts';
/** Result of removing one third-party profile plugin via the host Remote. */
export interface RemoveProfilePluginResult {
    readonly removed: boolean;
    readonly message?: string;
}
/** One third-party profile plugin, with its active state in the profile composition. */
export interface ProfilePluginInfo {
    readonly packageName: string;
    readonly displayName: string;
    readonly description: string;
    readonly spec: string;
    readonly version: string;
    /** Whether the plugin is in the profile's `dsh.profile.bundles` (active). */
    readonly enabled: boolean;
}
/** Profile plugin catalog returned by the host Remote. */
export interface ProfilePluginSnapshot {
    readonly profile: string;
    readonly plugins: readonly ProfilePluginInfo[];
}
/** Outcome of toggling one profile plugin's active state. */
export interface SetPluginEnabledResult {
    readonly changed: boolean;
    readonly message?: string;
}
/** Registration-side injected face used by the section. */
export interface PluginManagerSectionInjected {
    /** Bound translator for this package's dictionary. */
    t: (key: PluginManagerLocaleKey) => string;
    /** Read the current managed-plugin catalog. */
    list: () => Promise<PluginManagerSnapshot>;
    /** Read the third-party plugins registered in the web profile manifest. */
    profileList: () => Promise<ProfilePluginSnapshot>;
    /** Delete one installed plugin by its directory name. */
    remove: (pluginName: string) => Promise<RemovePluginResult>;
    /** Remove one third-party profile-bundle plugin (equivalent to `dsh plugin remove`). */
    removeProfile: (packageName: string) => Promise<RemoveProfilePluginResult>;
    /** Enable or disable one profile plugin (toggle its `dsh.profile.bundles` membership). */
    setEnabled: (packageName: string, enabled: boolean) => Promise<SetPluginEnabledResult>;
}
/** Full component props assembled by the Settings slot renderer. */
export type PluginManagerSectionProps = PropsRuntime<'settings.section'> & InjectFace<PluginManagerSectionInjected>;
/**
 * Render the plugin manager: a three-column catalog
 * (名称 / 插件名称 / 详细) with inline skill details and a bottom-center
 * delete button in the detail panel that opens a confirm dialog. Exe export
 * lives in its own "导出为exe" Settings section.
 * @param props - composed slot props (inject face in contract above).
 * @returns the plugin-manager section tree.
 */
export declare function PluginManagerSection({ t, list, profileList, remove, removeProfile, setEnabled }: PluginManagerSectionProps): ReactNode;
//# sourceMappingURL=PluginManagerSection.d.ts.map
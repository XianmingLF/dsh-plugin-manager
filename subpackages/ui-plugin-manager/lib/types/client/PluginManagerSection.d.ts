import { type ReactNode } from 'react';
import type { PluginManagerSnapshot, ProfilePluginSnapshot, RemovePluginResult } from '@deepseek-ai/dsh-api-remotes/client';
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { PluginManagerLocaleKey } from './locales.ts';
/** Result of removing one third-party profile plugin via the host Remote. */
export interface RemoveProfilePluginResult {
    readonly removed: boolean;
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
export declare function PluginManagerSection({ t, list, profileList, remove, removeProfile }: PluginManagerSectionProps): ReactNode;
//# sourceMappingURL=PluginManagerSection.d.ts.map
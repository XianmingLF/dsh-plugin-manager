import { type ReactNode } from 'react';
import type { PluginManagerSnapshot, ProfilePluginSnapshot, RemovePluginResult } from '@deepseek-ai/dsh-api-remotes/client';
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { PluginManagerLocaleKey } from './locales.ts';
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
}
/** Full component props assembled by the Settings slot renderer. */
export type PluginManagerSectionProps = PropsRuntime<'settings.section'> & InjectFace<PluginManagerSectionInjected>;
/**
 * Render the test-version plugin manager: a four-column catalog
 * (名称 / 插件名称 / 详细 / 删除) with inline skill details and delete
 * confirmation. Exe export lives in its own "导出为exe" Settings section.
 * @param props - composed slot props (inject face in contract above).
 * @returns the plugin-manager section tree.
 */
export declare function PluginManagerSection({ t, list, profileList, remove }: PluginManagerSectionProps): ReactNode;
//# sourceMappingURL=PluginManagerSection.d.ts.map
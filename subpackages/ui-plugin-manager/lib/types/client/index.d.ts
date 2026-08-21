/**
 * Plugin management, browser half. Registers the "插件管理" Settings section:
 * a four-column plugin catalog over the managed plugin root. The section is a
 * general plugin surface available in every harness installation (not gated on
 * the test deployment flavor). The Host gateway is reached through the plain
 * same-origin `/api` RPC envelope, so the plugin also works when mounted as a
 * profile plugin (no api-remotes assembly dependency).
 * Export discipline: packages/client/AGENTS.md.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type PluginManagerLocaleKey } from './locales.ts';
export type { PluginManagerSectionInjected, PluginManagerSectionProps, } from './PluginManagerSection.tsx';
export type { PluginManagerLocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Plugin-manager copy. */
        'settings.pluginManager': PluginManagerLocaleKey;
    }
}
/** Dictionary namespace owned by this plugin. */
export declare const NS = "settings.pluginManager";
/** Services required by the Settings registration. */
export declare const inject: string[];
/**
 * Register the plugin-management Settings section. The section is a general
 * plugin surface: it mounts whenever the Host plugin-manager gateway is
 * present.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map
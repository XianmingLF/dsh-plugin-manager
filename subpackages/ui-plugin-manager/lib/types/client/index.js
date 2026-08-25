/**
 * Plugin management, browser half. Registers the "插件管理" Settings section:
 * a four-column plugin catalog over the managed plugin root. The section is a
 * general plugin surface available in every harness installation (not gated on
 * the test deployment flavor). The Host gateway is reached through the plain
 * same-origin `/api` RPC envelope, so the plugin also works when mounted as a
 * profile plugin (no api-remotes assembly dependency).
 * Export discipline: packages/client/AGENTS.md.
 */
import { PluginManagerSection, } from "./PluginManagerSection.js";
import { en, zh } from "./locales.js";
import { rpcCall } from "./rpc.js";
/** Dictionary namespace owned by this plugin. */
export const NS = 'settings.pluginManager';
/** Services required by the Settings registration. */
export const inject = ['slots', 'locale'];
/**
 * Register the plugin-management Settings section. The section is a general
 * plugin surface: it mounts whenever the Host plugin-manager gateway is
 * present.
 * @param ctx - client root context.
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-plugin-manager: dictionaries');
    const t = ctx.locale.bind(NS);
    const sectionInjected = () => ({
        t,
        list: () => rpcCall('pluginManager/list', {}),
        profileList: () => rpcCall('pluginManager/profileList', {}),
        remove: pluginName => rpcCall('pluginManager/removePlugin', { request: { pluginName } }),
        removeProfile: packageName => rpcCall('pluginManager/removeProfilePlugin', { request: { packageName } }),
    });
    ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'plugin-manager',
        order: 30,
        label: () => t('nav'),
        inject: sectionInjected,
    }, PluginManagerSection));
}
//# sourceMappingURL=index.js.map
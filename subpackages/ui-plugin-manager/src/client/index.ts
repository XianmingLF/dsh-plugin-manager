/**
 * Plugin management, browser half. Registers the "插件管理" Settings section:
 * a four-column plugin catalog over the managed plugin root. The section is a
 * general plugin surface available in every harness installation (not gated on
 * the test deployment flavor). The Host gateway is reached through the plain
 * same-origin `/api` RPC envelope, so the plugin also works when mounted as a
 * profile plugin (no api-remotes assembly dependency).
 * Export discipline: packages/client/AGENTS.md.
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the shell's SlotMap merge (the 'settings.section' entry).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {
  PluginManagerSnapshot,
  ProfilePluginSnapshot,
  RemovePluginResult,
} from '@deepseek-ai/dsh-api-remotes/client'
import {
  PluginManagerSection,
  type PluginManagerSectionInjected,
} from './PluginManagerSection.tsx'
import { en, zh, type PluginManagerLocaleKey } from './locales.ts'
import { rpcCall } from './rpc.ts'

export type {
  PluginManagerSectionInjected,
  PluginManagerSectionProps,
} from './PluginManagerSection.tsx'
export type { PluginManagerLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Plugin-manager copy. */
    'settings.pluginManager': PluginManagerLocaleKey
  }
}

/** Dictionary namespace owned by this plugin. */
export const NS = 'settings.pluginManager'

/** Services required by the Settings registration. */
export const inject = ['slots', 'locale']

/**
 * Register the plugin-management Settings section. The section is a general
 * plugin surface: it mounts whenever the Host plugin-manager gateway is
 * present.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-plugin-manager: dictionaries')

  const t = ctx.locale.bind(NS) as PluginManagerSectionInjected['t']
  const sectionInjected = (): PluginManagerSectionInjected => ({
    t,
    list: () => rpcCall<PluginManagerSnapshot>('pluginManager/list', {}),
    profileList: () => rpcCall<ProfilePluginSnapshot>('pluginManager/profileList', {}),
    remove: pluginName => rpcCall<RemovePluginResult>('pluginManager/removePlugin', { request: { pluginName } }),
  })

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'plugin-manager',
    order: 30,
    label: () => t('nav'),
    inject: sectionInjected,
  }, PluginManagerSection))
}

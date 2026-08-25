/** Package-owned invariant companion. @module @deepseek-ai/dsh-client-ui-plugin-manager/invariant */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-plugin-manager'

/** Cordis companion plugin name. */
export const name = 'client-ui-plugin-manager-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: the plugin-manager registers a general Settings
 * section whose RPC calls resolve only when the Host plugin-manager gateway
 * is mounted.
 */
const install: InvariantInstaller = () => {}

/** Register this package's invariant companion. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */

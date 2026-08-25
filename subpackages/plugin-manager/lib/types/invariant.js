/** Package-owned invariant companion. @module dsh-xianminglf-host-plugin-manager/invariant */
const PACKAGE_NAME = 'dsh-xianminglf-host-plugin-manager';
/** Cordis companion plugin name. */
export const name = 'host-plugin-manager-invariant';
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants'];
/**
 * No runtime invariant: every catalog entry is projected from host directory
 * state and the deploy lifecycle is owned by detached child-process status.
 */
const install = () => { };
/** Register this package's invariant companion. */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
/* jscpd:ignore-end */
//# sourceMappingURL=invariant.js.map
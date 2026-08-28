//#region lib/types/invariant.js
/** Package-owned invariant companion. @module xianminglf-plugin-manager/invariant */
const PACKAGE_NAME = "xianminglf-plugin-manager";
/** Cordis companion plugin name. */
const name = "host-plugin-manager-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: every catalog entry is projected from host directory
* state and the deploy lifecycle is owned by detached child-process status.
*/
const install = () => {};
/** Register this package's invariant companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };

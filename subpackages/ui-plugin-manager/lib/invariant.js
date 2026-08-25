//#region lib/types/invariant.js
/** Package-owned invariant companion. @module @deepseek-ai/dsh-client-ui-plugin-manager/invariant */
const PACKAGE_NAME = "@deepseek-ai/dsh-client-ui-plugin-manager";
/** Cordis companion plugin name. */
const name = "client-ui-plugin-manager-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: the plugin-manager registers a general Settings
* section whose RPC calls resolve only when the Host plugin-manager gateway
* is mounted.
*/
const install = () => {};
/** Register this package's invariant companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };

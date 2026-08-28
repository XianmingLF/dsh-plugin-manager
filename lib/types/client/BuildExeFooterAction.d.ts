import { type ReactNode } from 'react';
import type { BuildExeHandle, BuildExeStatus } from '@deepseek-ai/dsh-api-remotes/client';
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { PluginManagerLocaleKey } from './locales.ts';
/** Registration-side injected face used by the sidebar foot action. */
export interface BuildExeFooterActionInjected {
    /** Bound translator for this package's dictionary. */
    t: (key: PluginManagerLocaleKey) => string;
    /** Start the build-exe deploy; resolves with the job handle. */
    startBuild: () => Promise<BuildExeHandle>;
    /** Poll one build-exe job's lifecycle state. */
    pollStatus: (jobId: string) => Promise<BuildExeStatus>;
}
/** Full component props assembled by the sidebar slot renderer. */
export type BuildExeFooterActionProps = PropsRuntime<'sidebar.footer.action'> & InjectFace<BuildExeFooterActionInjected>;
/**
 * Render the test-version "构建exe" sidebar foot action: confirm, start the
 * deploy, and poll its status until it settles.
 * @param props - composed slot props (inject face in contract above).
 * @returns the build-exe action tree.
 */
export declare function BuildExeFooterAction({ wide, t, startBuild, pollStatus }: BuildExeFooterActionProps): ReactNode;
//# sourceMappingURL=BuildExeFooterAction.d.ts.map
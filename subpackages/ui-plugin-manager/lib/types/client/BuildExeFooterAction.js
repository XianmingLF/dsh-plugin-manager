import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { IconDownloadOutline16, IconLoadingOutline16, } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './BuildExeFooterAction.module.css';
/** Poll interval while a deploy is running. */
const POLL_INTERVAL_MS = 2000;
/** Substitute one `{message}` placeholder in a translated message. */
function format(message, detail) {
    return message.replace('{message}', detail);
}
/**
 * Render the test-version "构建exe" sidebar foot action: confirm, start the
 * deploy, and poll its status until it settles.
 * @param props - composed slot props (inject face in contract above).
 * @returns the build-exe action tree.
 */
export function BuildExeFooterAction({ wide, t, startBuild, pollStatus }) {
    const [phase, setPhase] = useState('idle');
    const [jobId, setJobId] = useState(null);
    const [message, setMessage] = useState('');
    useEffect(() => {
        if (phase !== 'running' || jobId === null)
            return;
        let cancelled = false;
        const timer = window.setInterval(() => {
            void pollStatus(jobId).then((status) => {
                if (cancelled)
                    return;
                setMessage(status.message);
                if (status.state === 'done')
                    setPhase('done');
                else if (status.state === 'error')
                    setPhase('error');
            }, () => { });
        }, POLL_INTERVAL_MS);
        return () => { cancelled = true; window.clearInterval(timer); };
    }, [phase, jobId, pollStatus]);
    const start = async () => {
        setPhase('running');
        setMessage(t('buildStarting'));
        try {
            const handle = await startBuild();
            setJobId(handle.jobId);
            setMessage(t('buildRunning'));
        }
        catch (error) {
            setPhase('error');
            setMessage(format(t('buildFailed'), error instanceof Error ? error.message : String(error)));
        }
    };
    return (_jsxs("div", { className: css.wrap, children: [phase === 'idle' || phase === 'confirm' ? (_jsxs("button", { type: "button", className: css.action, title: t('buildAction'), "aria-expanded": phase === 'confirm', onClick: () => { setPhase(current => current === 'confirm' ? 'idle' : 'confirm'); }, children: [_jsx(IconDownloadOutline16, { size: wide ? 14 : 18, "aria-hidden": "true" }), wide ? _jsx("span", { className: css.label, children: t('buildAction') }) : null] })) : null, phase === 'confirm' ? (_jsxs("div", { className: css.popover, role: "alertdialog", "aria-label": t('buildConfirm'), children: [_jsx("p", { className: css.popoverText, children: t('buildConfirm') }), _jsxs("div", { className: css.popoverActions, children: [_jsx("button", { type: "button", className: css.primary, onClick: () => { void start(); }, children: t('buildStart') }), _jsx("button", { type: "button", onClick: () => { setPhase('idle'); }, children: t('cancel') })] })] })) : null, phase === 'running' ? (_jsxs("div", { className: css.popover, "data-state": "running", role: "status", children: [_jsx(IconLoadingOutline16, { className: css.spinner, size: 14, "aria-hidden": "true" }), _jsx("span", { className: css.popoverText, children: message })] })) : null, phase === 'done' || phase === 'error' ? (_jsxs("div", { className: css.popover, "data-state": phase, role: "status", children: [_jsx("span", { className: css.popoverText, children: message }), _jsx("button", { type: "button", className: css.primary, onClick: () => { setPhase('idle'); setJobId(null); }, children: t('close') })] })) : null] }));
}
//# sourceMappingURL=BuildExeFooterAction.js.map
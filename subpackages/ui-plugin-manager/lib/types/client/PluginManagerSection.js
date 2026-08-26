import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from 'react';
import { IconTrashOutline16, } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './PluginManagerSection.module.css';
/** Substitute `{name}`/`{message}`/`{profile}` placeholders in a translated message. */
function format(message, values) {
    /* v8 ignore next -- every call site passes the placeholders its message declares */
    return message.replace(/\{(name|message|profile)\}/g, (_, key) => values[key] ?? '');
}
/**
 * Render the plugin manager: a three-column catalog
 * (名称 / 插件名称 / 详细) with inline skill details and a bottom-center
 * delete button in the detail panel that opens a confirm dialog. Exe export
 * lives in its own "导出为exe" Settings section.
 * @param props - composed slot props (inject face in contract above).
 * @returns the plugin-manager section tree.
 */
export function PluginManagerSection({ t, list, profileList, remove, removeProfile, setEnabled }) {
    const [request, setRequest] = useState(0);
    const [state, setState] = useState({ status: 'loading' });
    const [profileExpanded, setProfileExpanded] = useState(null);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [toggling, setToggling] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [notice, setNotice] = useState(null);
    useEffect(() => {
        let current = true;
        void Promise.all([list(), profileList()]).then(([snapshot, profileSnapshot]) => {
            if (current) {
                setState({ status: 'ready', snapshot, profile: profileSnapshot });
            }
        }, () => { if (current)
            setState({ status: 'error' }); });
        return () => { current = false; };
    }, [list, profileList, request]);
    const reload = () => {
        setState({ status: 'loading' });
        setRequest(value => value + 1);
    };
    const confirmRemove = async (target) => {
        const { kind, name } = target;
        setDeleting(name);
        setActionError(null);
        try {
            const result = kind === 'managed' ? await remove(name) : await removeProfile(name);
            if (!result.removed) {
                setActionError(format(t('deleteFailed'), { message: result.message ?? name }));
                setConfirmTarget(null);
                return;
            }
            setConfirmTarget(null);
            reload();
        }
        catch (error) {
            setActionError(format(t('deleteFailed'), { message: error instanceof Error ? error.message : String(error) }));
            setConfirmTarget(null);
        }
        finally {
            setDeleting(null);
        }
    };
    const toggleEnabled = async (packageName, enabled) => {
        setToggling(packageName);
        setActionError(null);
        setNotice(null);
        try {
            const result = await setEnabled(packageName, enabled);
            if (!result.changed) {
                setActionError(format(t('enableFailed'), { message: result.message ?? packageName }));
                return;
            }
            setNotice(format(t('toggleApplied'), { name: packageName }));
            reload();
        }
        catch (error) {
            setActionError(format(t('enableFailed'), { message: error instanceof Error ? error.message : String(error) }));
        }
        finally {
            setToggling(null);
        }
    };
    const plugins = state.status === 'ready' ? state.snapshot.plugins : [];
    /** Resolve the confirm-dialog display name from either catalog. */
    const displayNameOf = (target) => {
        if (target.kind === 'managed') {
            return plugins.find(plugin => plugin.pluginName === target.name)?.displayName ?? target.name;
        }
        const profilePlugins = state.status === 'ready' ? state.profile.plugins : [];
        return profilePlugins.find(plugin => plugin.packageName === target.name)?.displayName ?? target.name;
    };
    return (_jsxs("div", { className: css.section, "aria-busy": state.status === 'loading', children: [state.status === 'loading' ? _jsx("p", { className: css.status, children: t('loading') }) : null, state.status === 'error' ? (_jsxs("div", { className: css.failure, children: [_jsx("p", { role: "alert", children: t('error') }), _jsx("button", { type: "button", onClick: reload, children: t('retry') })] })) : null, actionError !== null ? _jsx("p", { className: css.failure, role: "alert", children: actionError }) : null, notice !== null ? _jsx("p", { className: css.notice, role: "status", children: notice }) : null, state.status === 'ready' ? (_jsx("div", { className: css.catalog, children: _jsxs("div", { className: css.catalog, children: [_jsxs("div", { className: css.catalogHeading, children: [_jsx("h3", { children: t('catalog') }), _jsx("span", { "data-plugin-count": state.profile.plugins.length, children: state.profile.plugins.length })] }), state.profile.plugins.length === 0 ? _jsx("p", { className: css.status, children: t('profileEmpty') }) : null, state.profile.plugins.length > 0 ? (_jsxs("div", { className: css.table, role: "table", "aria-label": t('catalog'), children: [_jsxs("div", { className: `${css.rowHeader} ${css.rowHeader3}`, role: "row", children: [_jsx("span", { role: "columnheader", children: t('columnName') }), _jsx("span", { role: "columnheader", children: t('columnPlugin') }), _jsx("span", { role: "columnheader", children: t('columnSpec') }), _jsx("span", { role: "columnheader", children: t('columnAction') })] }), state.profile.plugins.map((plugin) => {
                                    const open = profileExpanded === plugin.packageName;
                                    const busy = deleting === plugin.packageName;
                                    return (_jsxs(Fragment, { children: [_jsxs("div", { className: `${css.row} ${css.row3} ${css.rowClickable}`, role: "row", "data-open": open ? 'true' : undefined, onClick: () => { setProfileExpanded(open ? null : plugin.packageName); }, children: [_jsx("span", { className: css.cellName, role: "cell", title: plugin.packageName, children: plugin.displayName }), _jsx("span", { className: css.cellPlugin, role: "cell", children: plugin.packageName }), _jsx("span", { className: css.cellSpec, role: "cell", title: plugin.spec, children: plugin.description.length > 0 ? plugin.description : plugin.spec }), _jsx("span", { className: css.cellAction, role: "cell", children: _jsx("button", { type: "button", className: css.toggleButton, "data-enabled": plugin.enabled ? 'true' : undefined, disabled: toggling === plugin.packageName, onClick: (event) => { event.stopPropagation(); void toggleEnabled(plugin.packageName, !plugin.enabled); }, children: plugin.enabled ? t('disable') : t('enable') }) })] }), open ? (_jsxs("div", { className: css.details, role: "row", children: [_jsx("span", { className: css.detailsTitle, role: "cell", children: t('columnName') }), _jsx("span", { className: css.detailsValue, role: "cell", children: plugin.displayName }), _jsx("span", { className: css.detailsTitle, role: "cell", children: t('columnPlugin') }), _jsx("span", { className: css.detailsValue, role: "cell", children: plugin.packageName }), _jsx("span", { className: css.detailsTitle, role: "cell", children: t('columnSpec') }), _jsx("span", { className: css.detailsValue, role: "cell", children: plugin.description.length > 0 ? plugin.description : plugin.spec }), _jsx("span", { className: css.detailsTitle, role: "cell", children: t('dependencies') }), plugin.dependencies.length === 0 ? (_jsx("span", { className: css.detailsEmpty, role: "cell", children: t('noDependencies') })) : (_jsx("ul", { className: css.depList, role: "cell", children: plugin.dependencies.map(dep => (_jsxs("li", { children: [_jsx("strong", { children: dep.name }), dep.spec.length > 0 ? _jsx("span", { children: dep.spec }) : null] }, dep.name))) })), _jsx("div", { className: css.detailsDelete, role: "cell", children: _jsxs("button", { type: "button", className: css.detailsDeleteButton, disabled: busy, onClick: () => { setConfirmTarget({ kind: 'profile', name: plugin.packageName }); }, children: [_jsx(IconTrashOutline16, { size: 14, "aria-hidden": "true" }), t('delete')] }) })] })) : null] }, plugin.packageName));
                                })] })) : null] }) })) : null, confirmTarget !== null ? (_jsx("div", { className: css.modalBackdrop, role: "presentation", children: _jsxs("div", { className: css.modal, role: "dialog", "aria-modal": "true", "aria-labelledby": "plugin-manager-delete-title", children: [_jsx("p", { className: css.modalTitle, id: "plugin-manager-delete-title", children: t('warning') }), _jsx("p", { className: css.modalText, children: format(t('confirmDelete'), { name: displayNameOf(confirmTarget) }) }), _jsxs("div", { className: css.modalActions, children: [_jsx("button", { type: "button", className: css.modalCancel, disabled: deleting !== null, onClick: () => { setConfirmTarget(null); }, children: t('cancel') }), _jsx("button", { type: "button", className: css.modalConfirm, disabled: deleting !== null, onClick: () => { void confirmRemove(confirmTarget); }, children: t('confirm') })] })] }) })) : null] }));
}
//# sourceMappingURL=PluginManagerSection.js.map
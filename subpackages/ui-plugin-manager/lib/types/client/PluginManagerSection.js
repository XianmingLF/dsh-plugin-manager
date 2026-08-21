import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from 'react';
import { IconChevronDownOutline14, IconTrashOutline16, } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './PluginManagerSection.module.css';
/** Substitute `{name}`/`{message}`/`{profile}` placeholders in a translated message. */
function format(message, values) {
    return message.replace(/\{(name|message|profile)\}/g, (_, key) => values[key] ?? '');
}
/**
 * Render the test-version plugin manager: a four-column catalog
 * (名称 / 插件名称 / 详细 / 删除) with inline skill details and delete
 * confirmation. Exe export lives in its own "导出为exe" Settings section.
 * @param props - composed slot props (inject face in contract above).
 * @returns the plugin-manager section tree.
 */
export function PluginManagerSection({ t, list, profileList, remove }) {
    const [request, setRequest] = useState(0);
    const [state, setState] = useState({ status: 'loading' });
    const [profile, setProfile] = useState(null);
    const [profileExpanded, setProfileExpanded] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [confirming, setConfirming] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [actionError, setActionError] = useState(null);
    useEffect(() => {
        let current = true;
        void Promise.all([list(), profileList()]).then(([snapshot, profileSnapshot]) => {
            if (current) {
                setState({ status: 'ready', snapshot });
                setProfile(profileSnapshot);
            }
        }, () => { if (current)
            setState({ status: 'error' }); });
        return () => { current = false; };
    }, [list, profileList, request]);
    const reload = () => {
        setState({ status: 'loading' });
        setRequest(value => value + 1);
    };
    const confirmRemove = async (pluginName) => {
        setDeleting(pluginName);
        setActionError(null);
        try {
            const result = await remove(pluginName);
            if (!result.removed) {
                setActionError(format(t('deleteFailed'), { message: result.message ?? pluginName }));
                setConfirming(null);
                return;
            }
            setConfirming(null);
            reload();
        }
        catch (error) {
            setActionError(format(t('deleteFailed'), { message: error instanceof Error ? error.message : String(error) }));
            setConfirming(null);
        }
        finally {
            setDeleting(null);
        }
    };
    const plugins = state.status === 'ready' ? state.snapshot.plugins : [];
    return (_jsxs("div", { className: css.section, "aria-busy": state.status === 'loading', children: [state.status === 'loading' ? _jsx("p", { className: css.status, children: t('loading') }) : null, state.status === 'error' ? (_jsxs("div", { className: css.failure, children: [_jsx("p", { role: "alert", children: t('error') }), _jsx("button", { type: "button", onClick: reload, children: t('retry') })] })) : null, actionError !== null ? _jsx("p", { className: css.failure, role: "alert", children: actionError }) : null, state.status === 'ready' ? (_jsxs("div", { className: css.catalog, children: [_jsxs("div", { className: css.catalogHeading, children: [_jsx("h3", { children: t('catalog') }), _jsx("span", { "data-plugin-count": plugins.length, children: plugins.length })] }), plugins.length === 0 ? _jsx("p", { className: css.status, children: t('empty') }) : null, plugins.length > 0 ? (_jsxs("div", { className: css.table, role: "table", "aria-label": t('catalog'), children: [_jsxs("div", { className: css.rowHeader, role: "row", children: [_jsx("span", { role: "columnheader", children: t('columnName') }), _jsx("span", { role: "columnheader", children: t('columnPlugin') }), _jsx("span", { role: "columnheader", children: t('columnDetail') }), _jsx("span", { role: "columnheader", children: t('columnDelete') })] }), plugins.map((plugin) => {
                                const open = expanded === plugin.pluginName;
                                const confirmOpen = confirming === plugin.pluginName;
                                const busy = deleting === plugin.pluginName;
                                return (_jsxs(Fragment, { children: [_jsxs("div", { className: css.row, role: "row", "data-open": open ? 'true' : undefined, children: [_jsx("span", { className: css.cellName, role: "cell", title: plugin.pluginName, children: plugin.displayName }), _jsx("span", { className: css.cellPlugin, role: "cell", children: plugin.pluginName }), _jsx("span", { className: css.cellAction, role: "cell", children: _jsxs("button", { type: "button", className: css.detailButton, "aria-expanded": open, onClick: () => { setExpanded(open ? null : plugin.pluginName); }, children: [t('detail'), _jsx(IconChevronDownOutline14, { className: css.chevron, size: 12, "aria-hidden": "true" })] }) }), _jsx("span", { className: css.cellAction, role: "cell", children: _jsxs("button", { type: "button", className: css.deleteButton, disabled: busy, onClick: () => { setConfirming(plugin.pluginName); }, children: [_jsx(IconTrashOutline16, { size: 14, "aria-hidden": "true" }), t('delete')] }) })] }), open ? (_jsxs("div", { className: css.details, role: "row", children: [_jsx("span", { className: css.detailsTitle, role: "cell", children: t('skills') }), plugin.skills.length === 0 ? (_jsx("span", { className: css.detailsEmpty, role: "cell", children: t('noSkills') })) : (_jsx("ul", { className: css.skillList, role: "cell", children: plugin.skills.map(skill => (_jsxs("li", { children: [_jsx("strong", { children: skill.name }), skill.description.length > 0 ? _jsx("span", { children: skill.description }) : null] }, skill.name))) }))] })) : null, confirmOpen ? (_jsxs("div", { className: css.confirm, role: "row", children: [_jsx("span", { className: css.confirmText, role: "cell", children: format(t('confirmDelete'), { name: plugin.displayName }) }), _jsxs("span", { className: css.confirmActions, role: "cell", children: [_jsx("button", { type: "button", className: css.confirmPrimary, disabled: busy, onClick: () => { void confirmRemove(plugin.pluginName); }, children: t('confirm') }), _jsx("button", { type: "button", disabled: busy, onClick: () => { setConfirming(null); }, children: t('cancel') })] })] })) : null] }, plugin.pluginName));
                            })] })) : null, profile !== null ? (_jsxs("div", { className: css.catalog, children: [_jsxs("div", { className: css.catalogHeading, children: [_jsx("h3", { children: format(t('profileCatalog'), { profile: profile.profile }) }), _jsx("span", { "data-plugin-count": profile.plugins.length, children: profile.plugins.length })] }), profile.plugins.length === 0 ? _jsx("p", { className: css.status, children: t('profileEmpty') }) : null, profile.plugins.length > 0 ? (_jsxs("div", { className: css.table, role: "table", "aria-label": t('profileCatalog'), children: [_jsxs("div", { className: `${css.rowHeader} ${css.rowHeader3}`, role: "row", children: [_jsx("span", { role: "columnheader", children: t('columnName') }), _jsx("span", { role: "columnheader", children: t('columnPlugin') }), _jsx("span", { role: "columnheader", children: t('columnSpec') }), _jsx("span", { role: "columnheader", children: t('columnDetail') })] }), profile.plugins.map(plugin => {
                                        const open = profileExpanded === plugin.packageName;
                                        return (_jsxs(Fragment, { children: [_jsxs("div", { className: `${css.row} ${css.row3}`, role: "row", "data-open": open ? 'true' : undefined, children: [_jsx("span", { className: css.cellName, role: "cell", title: plugin.packageName, children: plugin.displayName }), _jsx("span", { className: css.cellPlugin, role: "cell", children: plugin.packageName }), _jsx("span", { className: css.cellSpec, role: "cell", title: plugin.spec, children: plugin.description.length > 0 ? plugin.description : plugin.spec }), _jsx("span", { className: css.cellAction, role: "cell", children: _jsxs("button", { type: "button", className: css.detailButton, "aria-expanded": open, onClick: () => { setProfileExpanded(open ? null : plugin.packageName); }, children: [t('detail'), _jsx(IconChevronDownOutline14, { className: css.chevron, size: 12, "aria-hidden": "true" })] }) })] }), open ? (_jsxs("div", { className: css.details, role: "row", children: [_jsx("span", { className: css.detailsTitle, role: "cell", children: t('columnName') }), _jsx("span", { className: css.detailsValue, role: "cell", children: plugin.displayName }), _jsx("span", { className: css.detailsTitle, role: "cell", children: t('columnPlugin') }), _jsx("span", { className: css.detailsValue, role: "cell", children: plugin.packageName }), _jsx("span", { className: css.detailsTitle, role: "cell", children: t('columnSpec') }), _jsx("span", { className: css.detailsValue, role: "cell", children: plugin.description.length > 0 ? plugin.description : plugin.spec }), _jsx("span", { className: css.detailsTitle, role: "cell", children: t('dependencies') }), plugin.dependencies.length === 0 ? (_jsx("span", { className: css.detailsEmpty, role: "cell", children: t('noDependencies') })) : (_jsx("ul", { className: css.depList, role: "cell", children: plugin.dependencies.map(dep => (_jsxs("li", { children: [_jsx("strong", { children: dep.name }), dep.spec.length > 0 ? _jsx("span", { children: dep.spec }) : null] }, dep.name))) }))] })) : null] }, plugin.packageName));
                                    })] })) : null] })) : null] })) : null] }));
}
//# sourceMappingURL=PluginManagerSection.js.map
window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-plugin-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region \0dsh-css:D:\AI\deepSeekGUI\deepseek-harness\packages\client\ui-plugin-manager\src\client\PluginManagerSection.module.css.mjs
		const css = ".rBWlpq_section{width:100%;color:var(--dsw-alias-label-primary);flex-direction:column;gap:14px;display:flex}.rBWlpq_catalogHeading h3,.rBWlpq_status,.rBWlpq_failure{margin:0}.rBWlpq_status,.rBWlpq_failure{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}.rBWlpq_failure{color:var(--dsw-alias-state-error-primary)}.rBWlpq_failure button{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;background:0 0;border-radius:6px;padding:4px 10px}.rBWlpq_catalog{flex-direction:column;gap:12px;display:flex}.rBWlpq_catalogHeading{align-items:baseline;gap:7px;padding:0 2px;display:flex}.rBWlpq_catalogHeading h3{font-size:13px;font-weight:600;line-height:20px}.rBWlpq_catalogHeading span{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;font-size:12px;line-height:18px}.rBWlpq_table{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;flex-direction:column;display:flex;overflow:hidden}.rBWlpq_rowHeader,.rBWlpq_row{grid-template-columns:minmax(96px,1.2fr) minmax(96px,1fr) 96px 96px;align-items:center;gap:10px;padding:8px 14px;display:grid}.rBWlpq_rowHeader3,.rBWlpq_row3{grid-template-columns:minmax(96px,1.2fr) minmax(140px,1fr) minmax(160px,2fr) 96px}.rBWlpq_rowHeader{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:600;line-height:17px}.rBWlpq_row{border-top:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);min-height:48px}.rBWlpq_row[data-open=true]{box-shadow:var(--dsw-shadow-lv1)}.rBWlpq_cellName,.rBWlpq_cellPlugin,.rBWlpq_cellSpec{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:13px;line-height:20px;overflow:hidden}.rBWlpq_cellName{font-weight:600}.rBWlpq_cellPlugin,.rBWlpq_cellSpec{color:var(--dsw-alias-label-secondary)}.rBWlpq_cellAction{justify-content:flex-end;display:flex}.rBWlpq_detailButton,.rBWlpq_deleteButton{border:1px solid var(--dsw-alias-border-l2);min-height:28px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border-radius:6px;align-items:center;gap:5px;padding:2px 10px;font-size:12px;line-height:18px;display:inline-flex}.rBWlpq_detailButton:hover,.rBWlpq_deleteButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.rBWlpq_deleteButton{color:var(--dsw-alias-state-error-primary)}.rBWlpq_deleteButton:disabled{opacity:.55;cursor:default}.rBWlpq_chevron{color:var(--dsw-alias-label-tertiary);flex:none}.rBWlpq_row[data-open=true] .rBWlpq_chevron{transform:rotate(180deg)}.rBWlpq_details{border-top:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);grid-template-columns:minmax(96px,1.2fr) minmax(96px,1fr) 96px 96px;gap:10px;padding:10px 14px 12px;display:grid}.rBWlpq_detailsTitle{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}.rBWlpq_detailsValue{color:var(--dsw-alias-label-primary);word-break:break-all;grid-column:2/-1;font-size:12px;line-height:18px}.rBWlpq_detailsEmpty{color:var(--dsw-alias-label-tertiary);grid-column:2/-1;font-size:12px;line-height:18px}.rBWlpq_skillList{flex-direction:column;grid-column:2/-1;gap:6px;margin:0;padding:0;list-style:none;display:flex}.rBWlpq_skillList li{flex-direction:column;gap:1px;display:flex}.rBWlpq_skillList strong{font-size:12px;font-weight:600;line-height:18px}.rBWlpq_skillList span{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.rBWlpq_depList{flex-direction:column;grid-column:2/-1;gap:6px;margin:0;padding:0;list-style:none;display:flex}.rBWlpq_depList li{flex-direction:column;gap:1px;display:flex}.rBWlpq_depList strong{font-size:12px;font-weight:600;line-height:18px}.rBWlpq_depList span{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.rBWlpq_confirm{border-top:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 7%, var(--dsw-alias-bg-layer-3));justify-content:space-between;align-items:center;gap:10px;padding:8px 14px;display:flex}.rBWlpq_confirmText{color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px}.rBWlpq_confirmActions{flex:none;align-items:center;gap:8px;display:inline-flex}.rBWlpq_confirmActions button{border:1px solid var(--dsw-alias-border-l2);min-height:26px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border-radius:6px;padding:1px 10px;font-size:12px;line-height:18px}.rBWlpq_confirmActions button:disabled{opacity:.55;cursor:default}.rBWlpq_confirmActions .rBWlpq_confirmPrimary{border-color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-inverse,var(--dsw-alias-label-primary))}@media (prefers-reduced-motion:no-preference){.rBWlpq_chevron{transition:transform .14s var(--ds-ease-in-out)}}";
		const tagId = "@deepseek-ai/dsh-client-ui-plugin-manager/PluginManagerSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-plugin-manager";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var PluginManagerSection_module_css_default = {
			"status": "rBWlpq_status",
			"depList": "rBWlpq_depList",
			"confirmActions": "rBWlpq_confirmActions",
			"confirmPrimary": "rBWlpq_confirmPrimary",
			"table": "rBWlpq_table",
			"catalog": "rBWlpq_catalog",
			"section": "rBWlpq_section",
			"detailButton": "rBWlpq_detailButton",
			"chevron": "rBWlpq_chevron",
			"confirm": "rBWlpq_confirm",
			"rowHeader3": "rBWlpq_rowHeader3",
			"confirmText": "rBWlpq_confirmText",
			"detailsValue": "rBWlpq_detailsValue",
			"skillList": "rBWlpq_skillList",
			"rowHeader": "rBWlpq_rowHeader",
			"catalogHeading": "rBWlpq_catalogHeading",
			"cellName": "rBWlpq_cellName",
			"failure": "rBWlpq_failure",
			"row3": "rBWlpq_row3",
			"cellPlugin": "rBWlpq_cellPlugin",
			"cellSpec": "rBWlpq_cellSpec",
			"cellAction": "rBWlpq_cellAction",
			"row": "rBWlpq_row",
			"deleteButton": "rBWlpq_deleteButton",
			"detailsTitle": "rBWlpq_detailsTitle",
			"detailsEmpty": "rBWlpq_detailsEmpty",
			"details": "rBWlpq_details"
		};
		//#endregion
		//#region lib/types/client/PluginManagerSection.js
		/** Substitute `{name}`/`{message}`/`{profile}` placeholders in a translated message. */
		function format(message, values) {
			return message.replace(/\{(name|message|profile)\}/g, (_, key) => values[key] ?? "");
		}
		/**
		* Render the test-version plugin manager: a four-column catalog
		* (名称 / 插件名称 / 详细 / 删除) with inline skill details and delete
		* confirmation. Exe export lives in its own "导出为exe" Settings section.
		* @param props - composed slot props (inject face in contract above).
		* @returns the plugin-manager section tree.
		*/
		function PluginManagerSection({ t, list, profileList, remove }) {
			const [request, setRequest] = (0, react.useState)(0);
			const [state, setState] = (0, react.useState)({ status: "loading" });
			const [profile, setProfile] = (0, react.useState)(null);
			const [profileExpanded, setProfileExpanded] = (0, react.useState)(null);
			const [expanded, setExpanded] = (0, react.useState)(null);
			const [confirming, setConfirming] = (0, react.useState)(null);
			const [deleting, setDeleting] = (0, react.useState)(null);
			const [actionError, setActionError] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				let current = true;
				Promise.all([list(), profileList()]).then(([snapshot, profileSnapshot]) => {
					if (current) {
						setState({
							status: "ready",
							snapshot
						});
						setProfile(profileSnapshot);
					}
				}, () => {
					if (current) setState({ status: "error" });
				});
				return () => {
					current = false;
				};
			}, [
				list,
				profileList,
				request
			]);
			const reload = () => {
				setState({ status: "loading" });
				setRequest((value) => value + 1);
			};
			const confirmRemove = async (pluginName) => {
				setDeleting(pluginName);
				setActionError(null);
				try {
					const result = await remove(pluginName);
					if (!result.removed) {
						setActionError(format(t("deleteFailed"), { message: result.message ?? pluginName }));
						setConfirming(null);
						return;
					}
					setConfirming(null);
					reload();
				} catch (error) {
					setActionError(format(t("deleteFailed"), { message: error instanceof Error ? error.message : String(error) }));
					setConfirming(null);
				} finally {
					setDeleting(null);
				}
			};
			const plugins = state.status === "ready" ? state.snapshot.plugins : [];
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerSection_module_css_default.section,
				"aria-busy": state.status === "loading",
				children: [
					state.status === "loading" ? (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerSection_module_css_default.status,
						children: t("loading")
					}) : null,
					state.status === "error" ? (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerSection_module_css_default.failure,
						children: [(0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							children: t("error")
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: reload,
							children: t("retry")
						})]
					}) : null,
					actionError !== null ? (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerSection_module_css_default.failure,
						role: "alert",
						children: actionError
					}) : null,
					state.status === "ready" ? (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerSection_module_css_default.catalog,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerSection_module_css_default.catalogHeading,
								children: [(0, react_jsx_runtime.jsx)("h3", { children: t("catalog") }), (0, react_jsx_runtime.jsx)("span", {
									"data-plugin-count": plugins.length,
									children: plugins.length
								})]
							}),
							plugins.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerSection_module_css_default.status,
								children: t("empty")
							}) : null,
							plugins.length > 0 ? (0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerSection_module_css_default.table,
								role: "table",
								"aria-label": t("catalog"),
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: PluginManagerSection_module_css_default.rowHeader,
									role: "row",
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											role: "columnheader",
											children: t("columnName")
										}),
										(0, react_jsx_runtime.jsx)("span", {
											role: "columnheader",
											children: t("columnPlugin")
										}),
										(0, react_jsx_runtime.jsx)("span", {
											role: "columnheader",
											children: t("columnDetail")
										}),
										(0, react_jsx_runtime.jsx)("span", {
											role: "columnheader",
											children: t("columnDelete")
										})
									]
								}), plugins.map((plugin) => {
									const open = expanded === plugin.pluginName;
									const confirmOpen = confirming === plugin.pluginName;
									const busy = deleting === plugin.pluginName;
									return (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [
										(0, react_jsx_runtime.jsxs)("div", {
											className: PluginManagerSection_module_css_default.row,
											role: "row",
											"data-open": open ? "true" : void 0,
											children: [
												(0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.cellName,
													role: "cell",
													title: plugin.pluginName,
													children: plugin.displayName
												}),
												(0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.cellPlugin,
													role: "cell",
													children: plugin.pluginName
												}),
												(0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.cellAction,
													role: "cell",
													children: (0, react_jsx_runtime.jsxs)("button", {
														type: "button",
														className: PluginManagerSection_module_css_default.detailButton,
														"aria-expanded": open,
														onClick: () => {
															setExpanded(open ? null : plugin.pluginName);
														},
														children: [t("detail"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, {
															className: PluginManagerSection_module_css_default.chevron,
															size: 12,
															"aria-hidden": "true"
														})]
													})
												}),
												(0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.cellAction,
													role: "cell",
													children: (0, react_jsx_runtime.jsxs)("button", {
														type: "button",
														className: PluginManagerSection_module_css_default.deleteButton,
														disabled: busy,
														onClick: () => {
															setConfirming(plugin.pluginName);
														},
														children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutline16, {
															size: 14,
															"aria-hidden": "true"
														}), t("delete")]
													})
												})
											]
										}),
										open ? (0, react_jsx_runtime.jsxs)("div", {
											className: PluginManagerSection_module_css_default.details,
											role: "row",
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: PluginManagerSection_module_css_default.detailsTitle,
												role: "cell",
												children: t("skills")
											}), plugin.skills.length === 0 ? (0, react_jsx_runtime.jsx)("span", {
												className: PluginManagerSection_module_css_default.detailsEmpty,
												role: "cell",
												children: t("noSkills")
											}) : (0, react_jsx_runtime.jsx)("ul", {
												className: PluginManagerSection_module_css_default.skillList,
												role: "cell",
												children: plugin.skills.map((skill) => (0, react_jsx_runtime.jsxs)("li", { children: [(0, react_jsx_runtime.jsx)("strong", { children: skill.name }), skill.description.length > 0 ? (0, react_jsx_runtime.jsx)("span", { children: skill.description }) : null] }, skill.name))
											})]
										}) : null,
										confirmOpen ? (0, react_jsx_runtime.jsxs)("div", {
											className: PluginManagerSection_module_css_default.confirm,
											role: "row",
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: PluginManagerSection_module_css_default.confirmText,
												role: "cell",
												children: format(t("confirmDelete"), { name: plugin.displayName })
											}), (0, react_jsx_runtime.jsxs)("span", {
												className: PluginManagerSection_module_css_default.confirmActions,
												role: "cell",
												children: [(0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: PluginManagerSection_module_css_default.confirmPrimary,
													disabled: busy,
													onClick: () => {
														confirmRemove(plugin.pluginName);
													},
													children: t("confirm")
												}), (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													disabled: busy,
													onClick: () => {
														setConfirming(null);
													},
													children: t("cancel")
												})]
											})]
										}) : null
									] }, plugin.pluginName);
								})]
							}) : null,
							profile !== null ? (0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerSection_module_css_default.catalog,
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: PluginManagerSection_module_css_default.catalogHeading,
										children: [(0, react_jsx_runtime.jsx)("h3", { children: format(t("profileCatalog"), { profile: profile.profile }) }), (0, react_jsx_runtime.jsx)("span", {
											"data-plugin-count": profile.plugins.length,
											children: profile.plugins.length
										})]
									}),
									profile.plugins.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerSection_module_css_default.status,
										children: t("profileEmpty")
									}) : null,
									profile.plugins.length > 0 ? (0, react_jsx_runtime.jsxs)("div", {
										className: PluginManagerSection_module_css_default.table,
										role: "table",
										"aria-label": t("profileCatalog"),
										children: [(0, react_jsx_runtime.jsxs)("div", {
											className: `${PluginManagerSection_module_css_default.rowHeader} ${PluginManagerSection_module_css_default.rowHeader3}`,
											role: "row",
											children: [
												(0, react_jsx_runtime.jsx)("span", {
													role: "columnheader",
													children: t("columnName")
												}),
												(0, react_jsx_runtime.jsx)("span", {
													role: "columnheader",
													children: t("columnPlugin")
												}),
												(0, react_jsx_runtime.jsx)("span", {
													role: "columnheader",
													children: t("columnSpec")
												}),
												(0, react_jsx_runtime.jsx)("span", {
													role: "columnheader",
													children: t("columnDetail")
												})
											]
										}), profile.plugins.map((plugin) => {
											const open = profileExpanded === plugin.packageName;
											return (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [(0, react_jsx_runtime.jsxs)("div", {
												className: `${PluginManagerSection_module_css_default.row} ${PluginManagerSection_module_css_default.row3}`,
												role: "row",
												"data-open": open ? "true" : void 0,
												children: [
													(0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerSection_module_css_default.cellName,
														role: "cell",
														title: plugin.packageName,
														children: plugin.displayName
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerSection_module_css_default.cellPlugin,
														role: "cell",
														children: plugin.packageName
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerSection_module_css_default.cellSpec,
														role: "cell",
														title: plugin.spec,
														children: plugin.description.length > 0 ? plugin.description : plugin.spec
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerSection_module_css_default.cellAction,
														role: "cell",
														children: (0, react_jsx_runtime.jsxs)("button", {
															type: "button",
															className: PluginManagerSection_module_css_default.detailButton,
															"aria-expanded": open,
															onClick: () => {
																setProfileExpanded(open ? null : plugin.packageName);
															},
															children: [t("detail"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, {
																className: PluginManagerSection_module_css_default.chevron,
																size: 12,
																"aria-hidden": "true"
															})]
														})
													})
												]
											}), open ? (0, react_jsx_runtime.jsxs)("div", {
												className: PluginManagerSection_module_css_default.details,
												role: "row",
												children: [
													(0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerSection_module_css_default.detailsTitle,
														role: "cell",
														children: t("columnName")
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerSection_module_css_default.detailsValue,
														role: "cell",
														children: plugin.displayName
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerSection_module_css_default.detailsTitle,
														role: "cell",
														children: t("columnPlugin")
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerSection_module_css_default.detailsValue,
														role: "cell",
														children: plugin.packageName
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerSection_module_css_default.detailsTitle,
														role: "cell",
														children: t("columnSpec")
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerSection_module_css_default.detailsValue,
														role: "cell",
														children: plugin.description.length > 0 ? plugin.description : plugin.spec
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerSection_module_css_default.detailsTitle,
														role: "cell",
														children: t("dependencies")
													}),
													plugin.dependencies.length === 0 ? (0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerSection_module_css_default.detailsEmpty,
														role: "cell",
														children: t("noDependencies")
													}) : (0, react_jsx_runtime.jsx)("ul", {
														className: PluginManagerSection_module_css_default.depList,
														role: "cell",
														children: plugin.dependencies.map((dep) => (0, react_jsx_runtime.jsxs)("li", { children: [(0, react_jsx_runtime.jsx)("strong", { children: dep.name }), dep.spec.length > 0 ? (0, react_jsx_runtime.jsx)("span", { children: dep.spec }) : null] }, dep.name))
													})
												]
											}) : null] }, plugin.packageName);
										})]
									}) : null
								]
							}) : null
						]
					}) : null
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Copy dictionaries for the plugin-manager Settings section. */
		/** Simplified Chinese dictionary and key source of truth. */
		const zh = {
			nav: "插件管理",
			loading: "正在读取插件…",
			error: "暂时无法读取插件。",
			retry: "重试",
			catalog: "插件列表",
			empty: "暂无插件。",
			columnName: "名称",
			columnPlugin: "插件名称",
			columnDetail: "详细",
			columnDelete: "删除",
			columnSpec: "说明",
			profileCatalog: "{profile} profile 插件",
			profileEmpty: "profile 中暂无第三方插件。",
			dependencies: "依赖",
			noDependencies: "该插件没有依赖。",
			detail: "详细",
			delete: "删除",
			noSkills: "该插件暂无 skill。",
			skills: "skill 列表",
			confirmDelete: "确认删除「{name}」插件？",
			confirm: "确认",
			cancel: "取消",
			deleteFailed: "删除失败：{message}"
		};
		/** English dictionary checked against the Chinese key set. */
		const en = {
			nav: "Plugins",
			loading: "Reading plugins…",
			error: "Plugins are temporarily unavailable.",
			retry: "Retry",
			catalog: "Plugin list",
			empty: "No plugins are available.",
			columnName: "Name",
			columnPlugin: "Plugin name",
			columnDetail: "Details",
			columnDelete: "Delete",
			columnSpec: "Description",
			profileCatalog: "{profile} profile plugins",
			profileEmpty: "No third-party plugins in the profile.",
			dependencies: "Dependencies",
			noDependencies: "This plugin has no dependencies.",
			detail: "Details",
			delete: "Delete",
			noSkills: "This plugin has no skills.",
			skills: "Skills",
			confirmDelete: "Delete the \"{name}\" plugin?",
			confirm: "Confirm",
			cancel: "Cancel",
			deleteFailed: "Delete failed: {message}"
		};
		//#endregion
		//#region lib/types/client/rpc.js
		/**
		* Browser RPC helper for the host typert gateway. The web client talks to
		* host Remotes through the same-origin `/api/<namespace>/<method>` envelope
		* the official connection layer uses, without depending on the api-remotes
		* assembly (which a profile-installed plugin cannot reach).
		*/
		/**
		* POST one typert remote call to the same-origin gateway and resolve its value.
		* @param method - `namespace/method` wire name.
		* @param args - plain-object arguments keyed by parameter name.
		* @returns the typed value; throws on transport, envelope, or gateway errors.
		*/
		async function rpcCall(method, args) {
			const rpcId = globalThis.crypto.randomUUID();
			const response = await globalThis.fetch(`/api/${method}`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					type: "client-request",
					rpcId,
					method,
					payload: { args }
				})
			});
			if (!response.ok) throw new Error(`transport failure for /api/${method}: HTTP ${response.status}`);
			const full = await response.json();
			if (full.rpcId !== rpcId) throw new Error(`rpcId mismatch for ${method}: sent ${rpcId}, got ${full.rpcId}`);
			if (!full.result.ok || full.result.value === void 0) {
				const detail = full.result.error !== void 0 ? `${full.result.error.code}: ${full.result.error.message}` : "empty result";
				throw new Error(`${method} failed: ${detail}`);
			}
			return full.result.value;
		}
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Plugin management, browser half. Registers the "插件管理" Settings section:
		* a four-column plugin catalog over the managed plugin root. The section is a
		* general plugin surface available in every harness installation (not gated on
		* the test deployment flavor). The Host gateway is reached through the plain
		* same-origin `/api` RPC envelope, so the plugin also works when mounted as a
		* profile plugin (no api-remotes assembly dependency).
		* Export discipline: packages/client/AGENTS.md.
		*/
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.pluginManager";
		/** Services required by the Settings registration. */
		const inject = ["slots", "locale"];
		/**
		* Register the plugin-management Settings section. The section is a general
		* plugin surface: it mounts whenever the Host plugin-manager gateway is
		* present.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-plugin-manager: dictionaries");
			const t = ctx.locale.bind(NS);
			const sectionInjected = () => ({
				t,
				list: () => rpcCall("pluginManager/list", {}),
				profileList: () => rpcCall("pluginManager/profileList", {}),
				remove: (pluginName) => rpcCall("pluginManager/removePlugin", { request: { pluginName } })
			});
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "plugin-manager",
				order: 30,
				label: () => t("nav"),
				inject: sectionInjected
			}, PluginManagerSection));
		}
		//#endregion
		exports.NS = NS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
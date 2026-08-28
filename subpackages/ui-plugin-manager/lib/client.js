window.__ModuleLoader__.load({
	id: "dsh-client-xianminglf-plugin-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:D:\AI\deepSeekGUI\deepseek-harness\packages\client\ui-plugin-manager\src\client\PluginManagerSection.module.css.mjs
		const css = ".rBWlpq_section{width:100%;color:var(--dsw-alias-label-primary);flex-direction:column;gap:14px;display:flex}.rBWlpq_catalogHeading h3,.rBWlpq_status,.rBWlpq_failure{margin:0}.rBWlpq_status,.rBWlpq_failure{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}.rBWlpq_failure{color:var(--dsw-alias-state-error-primary)}.rBWlpq_notice{color:var(--dsw-alias-state-success-primary);font-size:13px;line-height:20px}.rBWlpq_failure button{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;background:0 0;border-radius:6px;padding:4px 10px}.rBWlpq_catalog{flex-direction:column;gap:12px;display:flex}.rBWlpq_catalogHeading{align-items:baseline;gap:7px;padding:0 2px;display:flex}.rBWlpq_catalogHeading h3{font-size:13px;font-weight:600;line-height:20px}.rBWlpq_catalogHeading span{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;font-size:12px;line-height:18px}.rBWlpq_table{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;flex-direction:column;display:flex;overflow:hidden}.rBWlpq_rowHeader,.rBWlpq_row{grid-template-columns:minmax(96px,1.2fr) minmax(96px,1fr) 96px;align-items:center;gap:10px;padding:8px 14px;display:grid}.rBWlpq_rowHeader3,.rBWlpq_row3{grid-template-columns:minmax(96px,1.2fr) minmax(140px,1fr) minmax(160px,2fr) 120px}.rBWlpq_rowHeader{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:600;line-height:17px}.rBWlpq_row{border-top:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);min-height:48px}.rBWlpq_row[data-open=true]{box-shadow:var(--dsw-shadow-lv1)}.rBWlpq_cellName,.rBWlpq_cellPlugin,.rBWlpq_cellSpec{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:13px;line-height:20px;overflow:hidden}.rBWlpq_cellName{font-weight:600}.rBWlpq_cellPlugin,.rBWlpq_cellSpec{color:var(--dsw-alias-label-secondary)}.rBWlpq_cellAction{justify-content:flex-start;display:flex}.rBWlpq_rowClickable{cursor:pointer}.rBWlpq_rowClickable:hover{background:var(--dsw-alias-interactive-bg-hover)}.rBWlpq_toggleSwitch{border:1px solid var(--dsw-alias-state-error-primary);background:var(--dsw-alias-state-error-primary);cursor:pointer;width:44px;height:24px;transition:background .14s var(--ds-ease-in-out), border-color .14s var(--ds-ease-in-out);border-radius:999px;flex:none;padding:0;position:relative}.rBWlpq_toggleSwitch[data-enabled=true]{border-color:var(--dsw-alias-state-success-primary);background:var(--dsw-alias-state-success-primary)}.rBWlpq_toggleSwitch:hover:not(:disabled){filter:brightness(.95)}.rBWlpq_toggleSwitch:disabled{opacity:.55;cursor:default}.rBWlpq_toggleKnob{width:18px;height:18px;transition:transform .14s var(--ds-ease-in-out);background:#fff;border-radius:50%;position:absolute;top:2px;left:2px}.rBWlpq_toggleSwitch[data-enabled=true] .rBWlpq_toggleKnob{transform:translate(20px)}.rBWlpq_detailButton,.rBWlpq_deleteButton{border:1px solid var(--dsw-alias-border-l2);min-height:28px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border-radius:6px;align-items:center;gap:5px;padding:2px 10px;font-size:12px;line-height:18px;display:inline-flex}.rBWlpq_detailButton:hover,.rBWlpq_deleteButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.rBWlpq_deleteButton{color:var(--dsw-alias-state-error-primary)}.rBWlpq_deleteButton:disabled{opacity:.55;cursor:default}.rBWlpq_chevron{color:var(--dsw-alias-label-tertiary);flex:none}.rBWlpq_row[data-open=true] .rBWlpq_chevron{transform:rotate(180deg)}.rBWlpq_details{border-top:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);grid-template-columns:minmax(96px,1.2fr) 1fr;gap:10px;padding:10px 14px 12px;display:grid}.rBWlpq_detailsTitle{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}.rBWlpq_detailsValue{color:var(--dsw-alias-label-primary);word-break:break-all;grid-column:2/-1;font-size:12px;line-height:18px}.rBWlpq_detailsEmpty{color:var(--dsw-alias-label-tertiary);grid-column:2/-1;font-size:12px;line-height:18px}.rBWlpq_skillList{flex-direction:column;grid-column:2/-1;gap:6px;margin:0;padding:0;list-style:none;display:flex}.rBWlpq_skillList li{flex-direction:column;gap:1px;display:flex}.rBWlpq_skillList strong{font-size:12px;font-weight:600;line-height:18px}.rBWlpq_skillList span{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.rBWlpq_depList{flex-direction:column;grid-column:2/-1;gap:6px;margin:0;padding:0;list-style:none;display:flex}.rBWlpq_depList li{flex-direction:column;gap:1px;display:flex}.rBWlpq_depList strong{font-size:12px;font-weight:600;line-height:18px}.rBWlpq_depList span{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.rBWlpq_detailsDelete{grid-column:1/-1;justify-content:center;margin-top:6px;display:flex}.rBWlpq_detailsDeleteButton{border:1px solid var(--dsw-alias-state-error-primary);background:var(--dsw-alias-state-error-primary);color:#fff;min-height:28px;font:inherit;cursor:pointer;border-radius:6px;align-items:center;gap:5px;padding:2px 14px;font-size:12px;line-height:18px;display:inline-flex}.rBWlpq_detailsDeleteButton:hover:not(:disabled){filter:brightness(.92)}.rBWlpq_detailsDeleteButton:disabled{opacity:.55;cursor:default}.rBWlpq_modalBackdrop{z-index:1000;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur);justify-content:center;align-items:center;padding:24px;display:flex;position:fixed;inset:0}.rBWlpq_modal{border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-alias-bg-layer-2);width:min(380px,100%);box-shadow:var(--dsw-shadow-lv3);border-radius:20px;flex-direction:column;gap:14px;padding:22px 24px 24px;display:flex}.rBWlpq_modalTitle{color:var(--dsw-alias-label-primary);margin:0;font-size:15px;font-weight:600;line-height:22px}.rBWlpq_modalText{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:20px}.rBWlpq_modalActions{justify-content:flex-end;gap:10px;margin-top:6px;display:flex}.rBWlpq_modalActions button{min-width:80px;min-height:32px;font:inherit;cursor:pointer;border-radius:6px;padding:4px 14px;font-size:13px;line-height:19px}.rBWlpq_modalActions button:disabled{opacity:.55;cursor:default}.rBWlpq_modalCancel{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary)}.rBWlpq_modalCancel:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.rBWlpq_modalConfirm{border:1px solid var(--dsw-alias-state-error-primary);background:var(--dsw-alias-state-error-primary);color:#fff}.rBWlpq_modalConfirm:hover:not(:disabled){filter:brightness(.92)}@media (prefers-reduced-motion:no-preference){.rBWlpq_chevron{transition:transform .14s var(--ds-ease-in-out)}}";
		const tagId = "dsh-client-xianminglf-plugin-manager/PluginManagerSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-client-xianminglf-plugin-manager";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var PluginManagerSection_module_css_default = {
			"catalog": "rBWlpq_catalog",
			"catalogHeading": "rBWlpq_catalogHeading",
			"cellAction": "rBWlpq_cellAction",
			"cellName": "rBWlpq_cellName",
			"cellPlugin": "rBWlpq_cellPlugin",
			"cellSpec": "rBWlpq_cellSpec",
			"chevron": "rBWlpq_chevron",
			"deleteButton": "rBWlpq_deleteButton",
			"depList": "rBWlpq_depList",
			"detailButton": "rBWlpq_detailButton",
			"details": "rBWlpq_details",
			"detailsDelete": "rBWlpq_detailsDelete",
			"detailsDeleteButton": "rBWlpq_detailsDeleteButton",
			"detailsEmpty": "rBWlpq_detailsEmpty",
			"detailsTitle": "rBWlpq_detailsTitle",
			"detailsValue": "rBWlpq_detailsValue",
			"failure": "rBWlpq_failure",
			"modal": "rBWlpq_modal",
			"modalActions": "rBWlpq_modalActions",
			"modalBackdrop": "rBWlpq_modalBackdrop",
			"modalCancel": "rBWlpq_modalCancel",
			"modalConfirm": "rBWlpq_modalConfirm",
			"modalText": "rBWlpq_modalText",
			"modalTitle": "rBWlpq_modalTitle",
			"notice": "rBWlpq_notice",
			"row": "rBWlpq_row",
			"row3": "rBWlpq_row3",
			"rowClickable": "rBWlpq_rowClickable",
			"rowHeader": "rBWlpq_rowHeader",
			"rowHeader3": "rBWlpq_rowHeader3",
			"section": "rBWlpq_section",
			"skillList": "rBWlpq_skillList",
			"status": "rBWlpq_status",
			"table": "rBWlpq_table",
			"toggleKnob": "rBWlpq_toggleKnob",
			"toggleSwitch": "rBWlpq_toggleSwitch"
		};
		//#endregion
		//#region src/client/PluginManagerSection.tsx
		/** Substitute `{name}`/`{message}`/`{profile}` placeholders in a translated message. */
		function format(message, values) {
			/* v8 ignore next -- every call site passes the placeholders its message declares */
			return message.replace(/\{(name|message|profile)\}/g, (_, key) => values[key] ?? "");
		}
		/**
		* Render the plugin manager: a three-column catalog
		* (名称 / 插件名称 / 详细) with inline skill details and a bottom-center
		* delete button in the detail panel that opens a confirm dialog. Exe export
		* lives in its own "导出为exe" Settings section.
		* @param props - composed slot props (inject face in contract above).
		* @returns the plugin-manager section tree.
		*/
		function PluginManagerSection({ t, list, profileList, remove, removeProfile, setEnabled }) {
			const [request, setRequest] = (0, react.useState)(0);
			const [state, setState] = (0, react.useState)({ status: "loading" });
			const [profileExpanded, setProfileExpanded] = (0, react.useState)(null);
			const [confirmTarget, setConfirmTarget] = (0, react.useState)(null);
			const [deleting, setDeleting] = (0, react.useState)(null);
			const [toggling, setToggling] = (0, react.useState)(null);
			const [actionError, setActionError] = (0, react.useState)(null);
			const [notice, setNotice] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				let current = true;
				Promise.all([list(), profileList()]).then(([snapshot, profileSnapshot]) => {
					if (current) setState({
						status: "ready",
						snapshot,
						profile: profileSnapshot
					});
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
			const confirmRemove = async (target) => {
				const { kind, name } = target;
				setDeleting(name);
				setActionError(null);
				try {
					const result = kind === "managed" ? await remove(name) : await removeProfile(name);
					if (!result.removed) {
						setActionError(format(t("deleteFailed"), { message: result.message ?? name }));
						setConfirmTarget(null);
						return;
					}
					setConfirmTarget(null);
					reload();
				} catch (error) {
					setActionError(format(t("deleteFailed"), { message: error instanceof Error ? error.message : String(error) }));
					setConfirmTarget(null);
				} finally {
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
						setActionError(format(t("enableFailed"), { message: result.message ?? packageName }));
						return;
					}
					setNotice(format(t("toggleApplied"), { name: packageName }));
					reload();
				} catch (error) {
					setActionError(format(t("enableFailed"), { message: error instanceof Error ? error.message : String(error) }));
				} finally {
					setToggling(null);
				}
			};
			const plugins = state.status === "ready" ? state.snapshot.plugins : [];
			/** Resolve the confirm-dialog display name from either catalog. */
			const displayNameOf = (target) => {
				if (target.kind === "managed") return plugins.find((plugin) => plugin.pluginName === target.name)?.displayName ?? target.name;
				return (state.status === "ready" ? state.profile.plugins : []).find((plugin) => plugin.packageName === target.name)?.displayName ?? target.name;
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerSection_module_css_default.section,
				"aria-busy": state.status === "loading",
				children: [
					state.status === "loading" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerSection_module_css_default.status,
						children: t("loading")
					}) : null,
					state.status === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerSection_module_css_default.failure,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							children: t("error")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: reload,
							children: t("retry")
						})]
					}) : null,
					actionError !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerSection_module_css_default.failure,
						role: "alert",
						children: actionError
					}) : null,
					notice !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerSection_module_css_default.notice,
						role: "status",
						children: notice
					}) : null,
					state.status === "ready" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: PluginManagerSection_module_css_default.catalog,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerSection_module_css_default.catalog,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: PluginManagerSection_module_css_default.catalogHeading,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("catalog") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										"data-plugin-count": state.profile.plugins.length,
										children: state.profile.plugins.length
									})]
								}),
								state.profile.plugins.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: PluginManagerSection_module_css_default.status,
									children: t("profileEmpty")
								}) : null,
								state.profile.plugins.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: PluginManagerSection_module_css_default.table,
									role: "table",
									"aria-label": t("catalog"),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: `${PluginManagerSection_module_css_default.rowHeader} ${PluginManagerSection_module_css_default.rowHeader3}`,
										role: "row",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												role: "columnheader",
												children: t("columnName")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												role: "columnheader",
												children: t("columnPlugin")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												role: "columnheader",
												children: t("columnSpec")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												role: "columnheader",
												children: t("columnAction")
											})
										]
									}), state.profile.plugins.map((plugin) => {
										const open = profileExpanded === plugin.packageName;
										const busy = deleting === plugin.packageName;
										return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: `${PluginManagerSection_module_css_default.row} ${PluginManagerSection_module_css_default.row3} ${PluginManagerSection_module_css_default.rowClickable}`,
											role: "row",
											"data-open": open ? "true" : void 0,
											onClick: () => {
												setProfileExpanded(open ? null : plugin.packageName);
											},
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.cellName,
													role: "cell",
													title: plugin.packageName,
													children: plugin.displayName
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.cellPlugin,
													role: "cell",
													children: plugin.packageName
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.cellSpec,
													role: "cell",
													title: plugin.spec,
													children: plugin.description.length > 0 ? plugin.description : plugin.spec
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.cellAction,
													role: "cell",
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: PluginManagerSection_module_css_default.toggleSwitch,
														"data-enabled": plugin.enabled ? "true" : void 0,
														disabled: toggling === plugin.packageName,
														role: "switch",
														"aria-checked": plugin.enabled,
														"aria-label": plugin.enabled ? t("disable") : t("enable"),
														title: plugin.enabled ? t("disable") : t("enable"),
														onClick: (event) => {
															event.stopPropagation();
															toggleEnabled(plugin.packageName, !plugin.enabled);
														},
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: PluginManagerSection_module_css_default.toggleKnob })
													})
												})
											]
										}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: PluginManagerSection_module_css_default.details,
											role: "row",
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.detailsTitle,
													role: "cell",
													children: t("columnName")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.detailsValue,
													role: "cell",
													children: plugin.displayName
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.detailsTitle,
													role: "cell",
													children: t("columnPlugin")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.detailsValue,
													role: "cell",
													children: plugin.packageName
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.detailsTitle,
													role: "cell",
													children: t("columnSpec")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.detailsValue,
													role: "cell",
													children: plugin.description.length > 0 ? plugin.description : plugin.spec
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.detailsTitle,
													role: "cell",
													children: t("version")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerSection_module_css_default.detailsValue,
													role: "cell",
													children: plugin.version.length > 0 ? plugin.version : "-"
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
													className: PluginManagerSection_module_css_default.detailsDelete,
													role: "cell",
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
														type: "button",
														className: PluginManagerSection_module_css_default.detailsDeleteButton,
														disabled: busy,
														onClick: () => {
															setConfirmTarget({
																kind: "profile",
																name: plugin.packageName
															});
														},
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutline16, {
															size: 14,
															"aria-hidden": "true"
														}), t("delete")]
													})
												})
											]
										}) : null] }, plugin.packageName);
									})]
								}) : null
							]
						})
					}) : null,
					confirmTarget !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: PluginManagerSection_module_css_default.modalBackdrop,
						role: "presentation",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerSection_module_css_default.modal,
							role: "dialog",
							"aria-modal": "true",
							"aria-labelledby": "plugin-manager-delete-title",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: PluginManagerSection_module_css_default.modalTitle,
									id: "plugin-manager-delete-title",
									children: t("warning")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: PluginManagerSection_module_css_default.modalText,
									children: format(t("confirmDelete"), { name: displayNameOf(confirmTarget) })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: PluginManagerSection_module_css_default.modalActions,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: PluginManagerSection_module_css_default.modalCancel,
										disabled: deleting !== null,
										onClick: () => {
											setConfirmTarget(null);
										},
										children: t("cancel")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: PluginManagerSection_module_css_default.modalConfirm,
										disabled: deleting !== null,
										onClick: () => {
											confirmRemove(confirmTarget);
										},
										children: t("confirm")
									})]
								})
							]
						})
					}) : null
				]
			});
		}
		//#endregion
		//#region src/client/locales.ts
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
			version: "版本",
			detail: "详细",
			delete: "删除",
			noSkills: "该插件暂无 skill。",
			skills: "skill 列表",
			warning: "警告",
			confirmDelete: "确认删除「{name}」插件？",
			confirm: "确认",
			cancel: "取消",
			deleteFailed: "删除失败：{message}",
			enable: "启用插件",
			disable: "停用",
			enableFailed: "操作失败：{message}",
			columnAction: "操作",
			toggleApplied: "已启用/停用 {name}，刷新界面后生效"
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
			version: "Version",
			detail: "Details",
			delete: "Delete",
			noSkills: "This plugin has no skills.",
			skills: "Skills",
			warning: "Warning",
			confirmDelete: "Delete the \"{name}\" plugin?",
			confirm: "Confirm",
			cancel: "Cancel",
			deleteFailed: "Delete failed: {message}",
			enable: "Enable",
			disable: "Disable",
			enableFailed: "Action failed: {message}",
			columnAction: "Action",
			toggleApplied: "Enabled/disabled {name}; takes effect after refreshing the page"
		};
		//#endregion
		//#region src/client/rpc.ts
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
		//#region src/client/index.ts
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
				remove: (pluginName) => rpcCall("pluginManager/removePlugin", { request: { pluginName } }),
				removeProfile: (packageName) => rpcCall("pluginManager/removeProfilePlugin", { request: { packageName } }),
				setEnabled: (packageName, enabled) => rpcCall("pluginManager/setProfilePluginEnabled", { request: {
					packageName,
					enabled
				} })
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
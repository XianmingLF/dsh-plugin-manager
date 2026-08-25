/** Copy dictionaries for the plugin-manager Settings section. */

/** Simplified Chinese dictionary and key source of truth. */
export const zh = {
  nav: '插件管理',
  loading: '正在读取插件…',
  error: '暂时无法读取插件。',
  retry: '重试',
  catalog: '插件列表',
  empty: '暂无插件。',
  columnName: '名称',
  columnPlugin: '插件名称',
  columnDetail: '详细',
  columnDelete: '删除',
  columnSpec: '说明',
  profileCatalog: '{profile} profile 插件',
  profileEmpty: 'profile 中暂无第三方插件。',
  dependencies: '依赖',
  noDependencies: '该插件没有依赖。',
  detail: '详细',
  delete: '删除',
  noSkills: '该插件暂无 skill。',
  skills: 'skill 列表',
  warning: '警告',
  confirmDelete: '确认删除「{name}」插件？',
  confirm: '确认',
  cancel: '取消',
  deleteFailed: '删除失败：{message}',
} satisfies Record<string, string>

/** Plugin-manager locale key union. */
export type PluginManagerLocaleKey = keyof typeof zh

/** English dictionary checked against the Chinese key set. */
export const en = {
  nav: 'Plugins',
  loading: 'Reading plugins…',
  error: 'Plugins are temporarily unavailable.',
  retry: 'Retry',
  catalog: 'Plugin list',
  empty: 'No plugins are available.',
  columnName: 'Name',
  columnPlugin: 'Plugin name',
  columnDetail: 'Details',
  columnDelete: 'Delete',
  columnSpec: 'Description',
  profileCatalog: '{profile} profile plugins',
  profileEmpty: 'No third-party plugins in the profile.',
  dependencies: 'Dependencies',
  noDependencies: 'This plugin has no dependencies.',
  detail: 'Details',
  delete: 'Delete',
  noSkills: 'This plugin has no skills.',
  skills: 'Skills',
  warning: 'Warning',
  confirmDelete: 'Delete the "{name}" plugin?',
  confirm: 'Confirm',
  cancel: 'Cancel',
  deleteFailed: 'Delete failed: {message}',
} satisfies Record<PluginManagerLocaleKey, string>

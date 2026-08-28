import { Fragment, useEffect, useState, type ReactNode } from 'react'
import type {
  PluginManagerSnapshot,
  RemovePluginResult,
} from '@deepseek-ai/dsh-api-remotes/client'
import {
  IconTrashOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { PluginManagerLocaleKey } from './locales.ts'
import css from './PluginManagerSection.module.css'

/** Result of removing one third-party profile plugin via the host Remote. */
export interface RemoveProfilePluginResult {
  readonly removed: boolean
  readonly message?: string
}

/** One third-party profile plugin, with its active state in the profile composition. */
export interface ProfilePluginInfo {
  readonly packageName: string
  readonly displayName: string
  readonly description: string
  readonly spec: string
  readonly version: string
  /** Whether the plugin is in the profile's `dsh.profile.bundles` (active). */
  readonly enabled: boolean
}

/** Profile plugin catalog returned by the host Remote. */
export interface ProfilePluginSnapshot {
  readonly profile: string
  readonly plugins: readonly ProfilePluginInfo[]
}

/** Outcome of toggling one profile plugin's active state. */
export interface SetPluginEnabledResult {
  readonly changed: boolean
  readonly message?: string
}

/** Registration-side injected face used by the section. */
export interface PluginManagerSectionInjected {
  /** Bound translator for this package's dictionary. */
  t: (key: PluginManagerLocaleKey) => string
  /** Read the current managed-plugin catalog. */
  list: () => Promise<PluginManagerSnapshot>
  /** Read the third-party plugins registered in the web profile manifest. */
  profileList: () => Promise<ProfilePluginSnapshot>
  /** Delete one installed plugin by its directory name. */
  remove: (pluginName: string) => Promise<RemovePluginResult>
  /** Remove one third-party profile-bundle plugin (equivalent to `dsh plugin remove`). */
  removeProfile: (packageName: string) => Promise<RemoveProfilePluginResult>
  /** Enable or disable one profile plugin (toggle its `dsh.profile.bundles` membership). */
  setEnabled: (packageName: string, enabled: boolean) => Promise<SetPluginEnabledResult>
}

/** Full component props assembled by the Settings slot renderer. */
export type PluginManagerSectionProps =
  PropsRuntime<'settings.section'>
  & InjectFace<PluginManagerSectionInjected>

type ViewState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | {
    readonly status: 'ready'
    readonly snapshot: PluginManagerSnapshot
    readonly profile: ProfilePluginSnapshot
  }

/** Substitute `{name}`/`{message}`/`{profile}` placeholders in a translated message. */
function format(message: string, values: Record<string, string>): string {
  /* v8 ignore next -- every call site passes the placeholders its message declares */
  return message.replace(/\{(name|message|profile)\}/g, (_, key: string) => values[key] ?? '')
}

/**
 * Render the plugin manager: a three-column catalog
 * (名称 / 插件名称 / 详细) with inline skill details and a bottom-center
 * delete button in the detail panel that opens a confirm dialog. Exe export
 * lives in its own "导出为exe" Settings section.
 * @param props - composed slot props (inject face in contract above).
 * @returns the plugin-manager section tree.
 */
export function PluginManagerSection({ t, list, profileList, remove, removeProfile, setEnabled }: PluginManagerSectionProps): ReactNode {
  const [request, setRequest] = useState(0)
  const [state, setState] = useState<ViewState>({ status: 'loading' })
  const [profileExpanded, setProfileExpanded] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<{ readonly kind: 'managed' | 'profile'; readonly name: string } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let current = true
    void Promise.all([list(), profileList()]).then(
      ([snapshot, profileSnapshot]) => {
        if (current) {
          setState({ status: 'ready', snapshot, profile: profileSnapshot })
        }
      },
      () => { if (current) setState({ status: 'error' }) },
    )
    return () => { current = false }
  }, [list, profileList, request])

  const reload = (): void => {
    setState({ status: 'loading' })
    setRequest(value => value + 1)
  }

  const confirmRemove = async (target: { kind: 'managed' | 'profile'; name: string }): Promise<void> => {
    const { kind, name } = target
    setDeleting(name)
    setActionError(null)
    try {
      const result = kind === 'managed' ? await remove(name) : await removeProfile(name)
      if (!result.removed) {
        setActionError(format(t('deleteFailed'), { message: result.message ?? name }))
        setConfirmTarget(null)
        return
      }
      setConfirmTarget(null)
      reload()
    } catch (error) {
      setActionError(format(t('deleteFailed'), { message: error instanceof Error ? error.message : String(error) }))
      setConfirmTarget(null)
    } finally {
      setDeleting(null)
    }
  }

  const toggleEnabled = async (packageName: string, enabled: boolean): Promise<void> => {
    setToggling(packageName)
    setActionError(null)
    setNotice(null)
    try {
      const result = await setEnabled(packageName, enabled)
      if (!result.changed) {
        setActionError(format(t('enableFailed'), { message: result.message ?? packageName }))
        return
      }
      setNotice(format(t('toggleApplied'), { name: packageName }))
      reload()
    } catch (error) {
      setActionError(format(t('enableFailed'), { message: error instanceof Error ? error.message : String(error) }))
    } finally {
      setToggling(null)
    }
  }

  const plugins = state.status === 'ready' ? state.snapshot.plugins : []

  /** Resolve the confirm-dialog display name from either catalog. */
  const displayNameOf = (target: { kind: 'managed' | 'profile'; name: string }): string => {
    if (target.kind === 'managed') {
      return plugins.find(plugin => plugin.pluginName === target.name)?.displayName ?? target.name
    }
    const profilePlugins = state.status === 'ready' ? state.profile.plugins : []
    return profilePlugins.find(plugin => plugin.packageName === target.name)?.displayName ?? target.name
  }

  return (
    <div className={css.section} aria-busy={state.status === 'loading'}>
      {state.status === 'loading' ? <p className={css.status}>{t('loading')}</p> : null}
      {state.status === 'error' ? (
        <div className={css.failure}>
          <p role="alert">{t('error')}</p>
          <button type="button" onClick={reload}>{t('retry')}</button>
        </div>
      ) : null}
      {actionError !== null ? <p className={css.failure} role="alert">{actionError}</p> : null}
      {notice !== null ? <p className={css.notice} role="status">{notice}</p> : null}
      {state.status === 'ready' ? (
        <div className={css.catalog}>
          <div className={css.catalog}>
            <div className={css.catalogHeading}>
              <h3>{t('catalog')}</h3>
              <span data-plugin-count={state.profile.plugins.length}>{state.profile.plugins.length}</span>
            </div>
            {state.profile.plugins.length === 0 ? <p className={css.status}>{t('profileEmpty')}</p> : null}
            {state.profile.plugins.length > 0 ? (
              <div className={css.table} role="table" aria-label={t('catalog')}>
                <div className={`${css.rowHeader} ${css.rowHeader3}`} role="row">
                  <span role="columnheader">{t('columnName')}</span>
                  <span role="columnheader">{t('columnPlugin')}</span>
                  <span role="columnheader">{t('columnSpec')}</span>
                  <span role="columnheader">{t('columnAction')}</span>
                </div>
                {state.profile.plugins.map((plugin) => {
                  const open = profileExpanded === plugin.packageName
                  const busy = deleting === plugin.packageName
                  return (
                    <Fragment key={plugin.packageName}>
                      <div className={`${css.row} ${css.row3} ${css.rowClickable}`} role="row" data-open={open ? 'true' : undefined} onClick={() => { setProfileExpanded(open ? null : plugin.packageName) }}>
                        <span className={css.cellName} role="cell" title={plugin.packageName}>
                          {plugin.displayName}
                        </span>
                        <span className={css.cellPlugin} role="cell">{plugin.packageName}</span>
                        <span className={css.cellSpec} role="cell" title={plugin.spec}>
                          {plugin.description.length > 0 ? plugin.description : plugin.spec}
                        </span>
                        <span className={css.cellAction} role="cell">
                          <button
                            type="button"
                            className={css.toggleSwitch}
                            data-enabled={plugin.enabled ? 'true' : undefined}
                            disabled={toggling === plugin.packageName}
                            role="switch"
                            aria-checked={plugin.enabled}
                            aria-label={plugin.enabled ? t('disable') : t('enable')}
                            title={plugin.enabled ? t('disable') : t('enable')}
                            onClick={(event) => { event.stopPropagation(); void toggleEnabled(plugin.packageName, !plugin.enabled) }}
                          >
                            <span className={css.toggleKnob} />
                          </button>
                        </span>
                      </div>
                      {open ? (
                        <div className={css.details} role="row">
                          <span className={css.detailsTitle} role="cell">{t('columnName')}</span>
                          <span className={css.detailsValue} role="cell">{plugin.displayName}</span>
                          <span className={css.detailsTitle} role="cell">{t('columnPlugin')}</span>
                          <span className={css.detailsValue} role="cell">{plugin.packageName}</span>
                          <span className={css.detailsTitle} role="cell">{t('columnSpec')}</span>
                          <span className={css.detailsValue} role="cell">
                            {plugin.description.length > 0 ? plugin.description : plugin.spec}
                          </span>
                          <span className={css.detailsTitle} role="cell">{t('version')}</span>
                          <span className={css.detailsValue} role="cell">
                            {plugin.version.length > 0 ? plugin.version : '-'}
                          </span>
                          <div className={css.detailsDelete} role="cell">
                            <button
                              type="button"
                              className={css.detailsDeleteButton}
                              disabled={busy}
                              onClick={() => { setConfirmTarget({ kind: 'profile', name: plugin.packageName }) }}
                            >
                              <IconTrashOutline16 size={14} aria-hidden="true" />
                              {t('delete')}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </Fragment>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {confirmTarget !== null ? (
        <div className={css.modalBackdrop} role="presentation">
          <div className={css.modal} role="dialog" aria-modal="true" aria-labelledby="plugin-manager-delete-title">
            <p className={css.modalTitle} id="plugin-manager-delete-title">{t('warning')}</p>
            <p className={css.modalText}>
              {format(t('confirmDelete'), { name: displayNameOf(confirmTarget) })}
            </p>
            <div className={css.modalActions}>
              <button
                type="button"
                className={css.modalCancel}
                disabled={deleting !== null}
                onClick={() => { setConfirmTarget(null) }}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                className={css.modalConfirm}
                disabled={deleting !== null}
                onClick={() => { void confirmRemove(confirmTarget) }}
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

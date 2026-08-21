import { Fragment, useEffect, useState, type ReactNode } from 'react'
import type {
  PluginManagerSnapshot,
  ProfilePluginSnapshot,
  RemovePluginResult,
} from '@deepseek-ai/dsh-api-remotes/client'
import {
  IconChevronDownOutline14,
  IconTrashOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { PluginManagerLocaleKey } from './locales.ts'
import css from './PluginManagerSection.module.css'

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
}

/** Full component props assembled by the Settings slot renderer. */
export type PluginManagerSectionProps =
  PropsRuntime<'settings.section'>
  & InjectFace<PluginManagerSectionInjected>

type ViewState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'ready'; readonly snapshot: PluginManagerSnapshot }

/** Substitute `{name}`/`{message}`/`{profile}` placeholders in a translated message. */
function format(message: string, values: Record<string, string>): string {
  return message.replace(/\{(name|message|profile)\}/g, (_, key: string) => values[key] ?? '')
}

/**
 * Render the test-version plugin manager: a four-column catalog
 * (名称 / 插件名称 / 详细 / 删除) with inline skill details and delete
 * confirmation. Exe export lives in its own "导出为exe" Settings section.
 * @param props - composed slot props (inject face in contract above).
 * @returns the plugin-manager section tree.
 */
export function PluginManagerSection({ t, list, profileList, remove }: PluginManagerSectionProps): ReactNode {
  const [request, setRequest] = useState(0)
  const [state, setState] = useState<ViewState>({ status: 'loading' })
  const [profile, setProfile] = useState<ProfilePluginSnapshot | null>(null)
  const [profileExpanded, setProfileExpanded] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let current = true
    void Promise.all([list(), profileList()]).then(
      ([snapshot, profileSnapshot]) => {
        if (current) {
          setState({ status: 'ready', snapshot })
          setProfile(profileSnapshot)
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

  const confirmRemove = async (pluginName: string): Promise<void> => {
    setDeleting(pluginName)
    setActionError(null)
    try {
      const result = await remove(pluginName)
      if (!result.removed) {
        setActionError(format(t('deleteFailed'), { message: result.message ?? pluginName }))
        setConfirming(null)
        return
      }
      setConfirming(null)
      reload()
    } catch (error) {
      setActionError(format(t('deleteFailed'), { message: error instanceof Error ? error.message : String(error) }))
      setConfirming(null)
    } finally {
      setDeleting(null)
    }
  }

  const plugins = state.status === 'ready' ? state.snapshot.plugins : []

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
      {state.status === 'ready' ? (
        <div className={css.catalog}>
          <div className={css.catalogHeading}>
            <h3>{t('catalog')}</h3>
            <span data-plugin-count={plugins.length}>{plugins.length}</span>
          </div>
          {plugins.length === 0 ? <p className={css.status}>{t('empty')}</p> : null}
          {plugins.length > 0 ? (
            <div className={css.table} role="table" aria-label={t('catalog')}>
              <div className={css.rowHeader} role="row">
                <span role="columnheader">{t('columnName')}</span>
                <span role="columnheader">{t('columnPlugin')}</span>
                <span role="columnheader">{t('columnDetail')}</span>
                <span role="columnheader">{t('columnDelete')}</span>
              </div>
              {plugins.map((plugin) => {
                const open = expanded === plugin.pluginName
                const confirmOpen = confirming === plugin.pluginName
                const busy = deleting === plugin.pluginName
                return (
                  <Fragment key={plugin.pluginName}>
                    <div className={css.row} role="row" data-open={open ? 'true' : undefined}>
                      <span className={css.cellName} role="cell" title={plugin.pluginName}>
                        {plugin.displayName}
                      </span>
                      <span className={css.cellPlugin} role="cell">{plugin.pluginName}</span>
                      <span className={css.cellAction} role="cell">
                        <button
                          type="button"
                          className={css.detailButton}
                          aria-expanded={open}
                          onClick={() => { setExpanded(open ? null : plugin.pluginName) }}
                        >
                          {t('detail')}
                          <IconChevronDownOutline14 className={css.chevron} size={12} aria-hidden="true" />
                        </button>
                      </span>
                      <span className={css.cellAction} role="cell">
                        <button
                          type="button"
                          className={css.deleteButton}
                          disabled={busy}
                          onClick={() => { setConfirming(plugin.pluginName) }}
                        >
                          <IconTrashOutline16 size={14} aria-hidden="true" />
                          {t('delete')}
                        </button>
                      </span>
                    </div>
                    {open ? (
                      <div className={css.details} role="row">
                        <span className={css.detailsTitle} role="cell">{t('skills')}</span>
                        {plugin.skills.length === 0 ? (
                          <span className={css.detailsEmpty} role="cell">{t('noSkills')}</span>
                        ) : (
                          <ul className={css.skillList} role="cell">
                            {plugin.skills.map(skill => (
                              <li key={skill.name}>
                                <strong>{skill.name}</strong>
                                {skill.description.length > 0 ? <span>{skill.description}</span> : null}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null}
                    {confirmOpen ? (
                      <div className={css.confirm} role="row">
                        <span className={css.confirmText} role="cell">
                          {format(t('confirmDelete'), { name: plugin.displayName })}
                        </span>
                        <span className={css.confirmActions} role="cell">
                          <button
                            type="button"
                            className={css.confirmPrimary}
                            disabled={busy}
                            onClick={() => { void confirmRemove(plugin.pluginName) }}
                          >
                            {t('confirm')}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => { setConfirming(null) }}
                          >
                            {t('cancel')}
                          </button>
                        </span>
                      </div>
                    ) : null}
                  </Fragment>
                )
              })}
            </div>
          ) : null}

          {profile !== null ? (
            <div className={css.catalog}>
              <div className={css.catalogHeading}>
                <h3>{format(t('profileCatalog'), { profile: profile.profile })}</h3>
                <span data-plugin-count={profile.plugins.length}>{profile.plugins.length}</span>
              </div>
              {profile.plugins.length === 0 ? <p className={css.status}>{t('profileEmpty')}</p> : null}
              {profile.plugins.length > 0 ? (
                <div className={css.table} role="table" aria-label={t('profileCatalog')}>
                  <div className={`${css.rowHeader} ${css.rowHeader3}`} role="row">
                    <span role="columnheader">{t('columnName')}</span>
                    <span role="columnheader">{t('columnPlugin')}</span>
                    <span role="columnheader">{t('columnSpec')}</span>
                    <span role="columnheader">{t('columnDetail')}</span>
                  </div>
                  {profile.plugins.map(plugin => {
                    const open = profileExpanded === plugin.packageName
                    return (
                      <Fragment key={plugin.packageName}>
                        <div className={`${css.row} ${css.row3}`} role="row" data-open={open ? 'true' : undefined}>
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
                              className={css.detailButton}
                              aria-expanded={open}
                              onClick={() => { setProfileExpanded(open ? null : plugin.packageName) }}
                            >
                              {t('detail')}
                              <IconChevronDownOutline14 className={css.chevron} size={12} aria-hidden="true" />
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
                            <span className={css.detailsTitle} role="cell">{t('dependencies')}</span>
                            {plugin.dependencies.length === 0 ? (
                              <span className={css.detailsEmpty} role="cell">{t('noDependencies')}</span>
                            ) : (
                              <ul className={css.depList} role="cell">
                                {plugin.dependencies.map(dep => (
                                  <li key={dep.name}>
                                    <strong>{dep.name}</strong>
                                    {dep.spec.length > 0 ? <span>{dep.spec}</span> : null}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : null}
                      </Fragment>
                    )
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

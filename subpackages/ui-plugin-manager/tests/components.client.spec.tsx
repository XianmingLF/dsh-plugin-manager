// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PluginManagerSection } from '../src/client/PluginManagerSection.tsx'
import type {
  PluginManagerSectionInjected,
  PluginManagerSectionProps,
} from '../src/client/PluginManagerSection.tsx'
import type { PluginManagerSnapshot, ProfilePluginSnapshot } from '@deepseek-ai/dsh-api-remotes/client'
import { en, type PluginManagerLocaleKey } from '../src/client/locales.ts'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const t = (key: PluginManagerLocaleKey): string => en[key]

const SNAPSHOT: PluginManagerSnapshot = {
  plugins: [
    {
      pluginName: 'alpha',
      displayName: 'Alpha',
      mainDir: 'alpha-main',
      skills: [
        { name: 'skill-a', description: 'does a' },
        { name: 'skill-b', description: '' },
      ],
    },
    {
      pluginName: 'beta',
      displayName: 'beta',
      mainDir: null,
      skills: [],
    },
  ],
}

const PROFILE: ProfilePluginSnapshot = {
  profile: 'web',
  plugins: [
    {
      packageName: 'pkg-one',
      displayName: 'One',
      description: 'Desc one',
      spec: 'file:../one',
      dependencies: [{ name: 'dep-x', spec: '^1.0.0' }],
    },
    {
      packageName: 'pkg-two',
      displayName: 'Two',
      description: '',
      spec: '^2.0.0',
      dependencies: [{ name: 'dep-empty', spec: '' }],
    },
    {
      packageName: 'pkg-three',
      displayName: 'Three',
      description: '',
      spec: 'file:../three',
      dependencies: [],
    },
  ],
}

function props(overrides: Partial<PluginManagerSectionInjected> = {}): PluginManagerSectionProps {
  return {
    t,
    list: vi.fn().mockResolvedValue(SNAPSHOT),
    profileList: vi.fn().mockResolvedValue(PROFILE),
    remove: vi.fn().mockResolvedValue({ removed: true }),
    ...overrides,
  } as PluginManagerSectionProps
}

describe('PluginManagerSection', () => {
  it('shows the loading state until both catalogs resolve', async () => {
    const listDeferred = Promise.withResolvers<PluginManagerSnapshot>()
    render(<PluginManagerSection {...props({ list: vi.fn(() => listDeferred.promise) })} />)
    expect(screen.getByText(en.loading)).toBeTruthy()
    await act(async () => { listDeferred.resolve(SNAPSHOT) })
    await screen.findByText(en.catalog)
  })

  it('shows the error state and retries', async () => {
    const list = vi.fn()
      .mockRejectedValueOnce(new Error('unavailable'))
      .mockResolvedValueOnce(SNAPSHOT)
    render(<PluginManagerSection {...props({ list })} />)
    await screen.findByText(en.error)
    fireEvent.click(screen.getByRole('button', { name: en.retry }))
    await screen.findByText(en.catalog)
    expect(list).toHaveBeenCalledTimes(2)
  })

  it('ignores a late catalog failure after unmount', async () => {
    const fail = Promise.withResolvers<never>()
    const view = render(<PluginManagerSection {...props({ list: vi.fn(() => fail.promise) })} />)
    view.unmount()
    await act(async () => { fail.reject(new Error('boom')) })
  })

  it('ignores a late catalog load after unmount', async () => {
    const load = Promise.withResolvers<PluginManagerSnapshot>()
    const view = render(<PluginManagerSection {...props({ list: vi.fn(() => load.promise) })} />)
    view.unmount()
    await act(async () => { load.resolve(SNAPSHOT) })
  })

  it('renders the catalog with expandable skill details', async () => {
    render(<PluginManagerSection {...props()} />)
    await screen.findByText(en.catalog)
    expect(screen.getByText('Alpha')).toBeTruthy()
    expect(screen.getAllByText('beta')).toHaveLength(2)
    expect(screen.getByText('alpha')).toBeTruthy()
    const pluginHeading = screen.getByRole('heading', { name: en.catalog })
    expect(pluginHeading.parentElement!.querySelector('[data-plugin-count]')?.textContent).toBe('2')

    const detailButtons = screen.getAllByRole('button', { name: en.detail })
    fireEvent.click(detailButtons[0]!)
    expect(screen.getByText(en.skills)).toBeTruthy()
    expect(screen.getByText('skill-a')).toBeTruthy()
    expect(screen.getByText('does a')).toBeTruthy()
    expect(screen.getByText('skill-b')).toBeTruthy()
    fireEvent.click(detailButtons[0]!)
    expect(screen.queryByText('skill-a')).toBeNull()

    fireEvent.click(detailButtons[1]!)
    expect(screen.getByText(en.noSkills)).toBeTruthy()
    fireEvent.click(detailButtons[1]!)
    expect(screen.queryByText(en.noSkills)).toBeNull()
  })

  it('shows the empty catalog message', async () => {
    render(<PluginManagerSection {...props({
      list: vi.fn().mockResolvedValue({ plugins: [] }),
      profileList: vi.fn().mockResolvedValue({ profile: 'web', plugins: [] }),
    })} />)
    await screen.findByText(en.empty)
    expect(screen.getByText(en.profileEmpty)).toBeTruthy()
  })

  it('deletes a plugin after inline confirmation and reloads', async () => {
    const list = vi.fn().mockResolvedValue(SNAPSHOT)
    const remove = vi.fn().mockResolvedValue({ removed: true })
    render(<PluginManagerSection {...props({ list, remove })} />)
    await screen.findByText(en.catalog)
    fireEvent.click(screen.getAllByRole('button', { name: en.delete })[0]!)
    expect(screen.getByText('Delete the "Alpha" plugin?')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: en.confirm }))
    await waitFor(() => { expect(remove).toHaveBeenCalledWith('alpha') })
    expect(list).toHaveBeenCalledTimes(2)
  })

  it('cancels the delete confirmation', async () => {
    const remove = vi.fn()
    render(<PluginManagerSection {...props({ remove })} />)
    await screen.findByText(en.catalog)
    fireEvent.click(screen.getAllByRole('button', { name: en.delete })[0]!)
    fireEvent.click(screen.getByRole('button', { name: en.cancel }))
    expect(remove).not.toHaveBeenCalled()
    expect(screen.queryByText('Delete the "Alpha" plugin?')).toBeNull()
  })

  it('reports a failed removal with the gateway message and with a rejection', async () => {
    const { rerender } = render(<PluginManagerSection {...props({
      remove: vi.fn().mockResolvedValue({ removed: false, message: 'locked' }),
    })} />)
    await screen.findByText(en.catalog)
    fireEvent.click(screen.getAllByRole('button', { name: en.delete })[0]!)
    fireEvent.click(screen.getByRole('button', { name: en.confirm }))
    await screen.findByText('Delete failed: locked')

    rerender(<PluginManagerSection {...props({
      remove: vi.fn().mockRejectedValue(new Error('boom')),
    })} />)
    await screen.findByText(en.catalog)
    fireEvent.click(screen.getAllByRole('button', { name: en.delete })[0]!)
    fireEvent.click(screen.getByRole('button', { name: en.confirm }))
    await screen.findByText('Delete failed: boom')

    rerender(<PluginManagerSection {...props({
      remove: vi.fn().mockRejectedValue('plain boom'),
    })} />)
    await screen.findByText(en.catalog)
    fireEvent.click(screen.getAllByRole('button', { name: en.delete })[0]!)
    fireEvent.click(screen.getByRole('button', { name: en.confirm }))
    await screen.findByText('Delete failed: plain boom')
  })

  it('falls back to the plugin name when the removal carries no message', async () => {
    render(<PluginManagerSection {...props({ remove: vi.fn().mockResolvedValue({ removed: false }) })} />)
    await screen.findByText(en.catalog)
    fireEvent.click(screen.getAllByRole('button', { name: en.delete })[0]!)
    fireEvent.click(screen.getByRole('button', { name: en.confirm }))
    await screen.findByText('Delete failed: alpha')
  })

  it('renders the profile catalog with expandable dependency details', async () => {
    render(<PluginManagerSection {...props()} />)
    await screen.findByText('web profile plugins')
    expect(screen.getByText('One')).toBeTruthy()
    expect(screen.getByText('pkg-one')).toBeTruthy()
    expect(screen.getByText('Desc one')).toBeTruthy()
    expect(screen.getByText('^2.0.0')).toBeTruthy()

    const profileTable = screen.getByRole('table', { name: 'web profile plugins' })
    const detailButtons = within(profileTable).getAllByRole('button', { name: en.detail })
    fireEvent.click(detailButtons[0]!)
    expect(screen.getByText(en.dependencies)).toBeTruthy()
    expect(screen.getByText('dep-x')).toBeTruthy()
    expect(screen.getByText('^1.0.0')).toBeTruthy()
    fireEvent.click(detailButtons[0]!)
    expect(screen.queryByText('dep-x')).toBeNull()

    fireEvent.click(detailButtons[1]!)
    expect(screen.getByText('dep-empty')).toBeTruthy()

    fireEvent.click(detailButtons[2]!)
    expect(screen.getByText(en.noDependencies)).toBeTruthy()
  })
})

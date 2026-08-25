// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { resolveSlotLabel } from '@deepseek-ai/dsh-client-ui-slots'
import { usePinnedBrowserLanguages } from '@deepseek-ai/dsh-client-test-runtime'
import { apply, inject, NS } from '../src/client/index.ts'
import { PluginManagerSection } from '../src/client/PluginManagerSection.tsx'
import type { PluginManagerSectionInjected } from '../src/client/PluginManagerSection.tsx'

usePinnedBrowserLanguages('zh-CN')
afterEach(cleanup)

/** Echo rpcId so `rpcCall` passes its own envelope assertions. */
function stubGatewayFetch(): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    const raw = init?.body
    const body = typeof raw === 'string' ? JSON.parse(raw) as { rpcId: string } : { rpcId: '' }
    return {
      ok: true,
      json: async () => ({ rpcId: body.rpcId, result: { ok: true, value: { plugins: [] } } }),
    } as unknown as Response
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const locale = new LocaleRuntime(ctx)
  ctx.provide('locale', locale)
  return { ctx, slots: ctx.get('slots') as SlotRegistry, locale }
}

function declare(slots: SlotRegistry): () => void {
  return slots.register({
    name: 'root',
    children: { 'settings.section': { kind: 'list', scope: 'root' } },
  } as never, () => null)
}

describe('ui-plugin-manager browser plugin', () => {
  it('declares only the services used by the Settings registration', () => {
    expect(inject).toEqual(['slots', 'locale'])
  })

  it('registers a localized section without reading the gateway eagerly', async () => {
    const fetchMock = stubGatewayFetch()
    const b = await bench()
    declare(b.slots)
    await b.ctx.plugin({ inject: [...inject], apply }).await()

    const entry = b.slots.entries('settings.section')[0]!
    expect(entry.component).toBe(PluginManagerSection)
    expect(entry.options).toMatchObject({ id: 'plugin-manager', order: 30 })
    expect(resolveSlotLabel(entry.options.label)).toBe('插件管理')
    expect(fetchMock).not.toHaveBeenCalled()

    const injected = (entry.inject as unknown as () => PluginManagerSectionInjected)()
    await expect(injected.list()).resolves.toEqual({ plugins: [] })
    await injected.profileList()
    await injected.remove('alpha')
    expect(fetchMock).toHaveBeenCalledWith('/api/pluginManager/list', expect.objectContaining({ method: 'POST' }))
    expect(fetchMock).toHaveBeenCalledWith('/api/pluginManager/profileList', expect.objectContaining({ method: 'POST' }))
    expect(fetchMock).toHaveBeenCalledWith('/api/pluginManager/removePlugin', expect.objectContaining({ method: 'POST' }))
    await b.ctx.fiber.dispose()
  })

  it('follows locale and recovers across late declaration and declarer reload', async () => {
    stubGatewayFetch()
    const b = await bench()
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(b.slots.entries('settings.section')).toHaveLength(0)

    const stop = declare(b.slots)
    await vi.waitFor(() => { expect(b.slots.entries('settings.section')).toHaveLength(1) })
    b.locale.setLocale('en')
    expect(resolveSlotLabel(b.slots.entries('settings.section')[0]!.options.label)).toBe('Plugins')

    stop()
    expect(b.slots.entries('settings.section')).toHaveLength(0)
    declare(b.slots)
    await vi.waitFor(() => {
      expect(b.slots.entries('settings.section')[0]?.component).toBe(PluginManagerSection)
    })

    await fiber.dispose()
    expect(b.slots.entries('settings.section')).toHaveLength(0)
    expect(() => b.locale.register(NS, 'zh', {})).not.toThrow()
    await b.ctx.fiber.dispose()
  })
})

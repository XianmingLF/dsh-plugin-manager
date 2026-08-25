import { afterEach, describe, expect, it, vi } from 'vitest'
import { rpcCall } from '../src/client/rpc.ts'

const fetchMock = vi.fn<typeof fetch>()

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

/** Echo the request rpcId so the envelope matches what `rpcCall` sent. */
function stubFetch(result: unknown): void {
  fetchMock.mockImplementation(async (_input: RequestInfo | URL, init?: RequestInit) => {
    const raw = init?.body
    const body = typeof raw === 'string' ? JSON.parse(raw) as { rpcId: string } : { rpcId: '' }
    return {
      ok: true,
      json: async () => ({ rpcId: body.rpcId, result }),
    } as unknown as Response
  })
  vi.stubGlobal('fetch', fetchMock)
}

describe('rpcCall', () => {
  it('posts a typed client-request and resolves the value', async () => {
    stubFetch({ ok: true, value: { plugins: [] } })
    await expect(rpcCall<{ plugins: unknown[] }>('pluginManager/list', {})).resolves.toEqual({ plugins: [] })
    expect(fetchMock).toHaveBeenCalledWith('/api/pluginManager/list', expect.objectContaining({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    }))
    const [, init] = fetchMock.mock.calls[0]!
    const raw = init?.body
    const body = JSON.parse(typeof raw === 'string' ? raw : '{}') as Record<string, unknown>
    expect(body).toMatchObject({
      type: 'client-request',
      method: 'pluginManager/list',
      payload: { args: {} },
    })
    expect(String(body.rpcId)).toMatch(/^[0-9a-f-]{36}$/u)
  })

  it('rejects on a non-ok HTTP response', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)
    await expect(rpcCall('pluginManager/list', {})).rejects.toThrow(
      'transport failure for /api/pluginManager/list: HTTP 503',
    )
  })

  it('rejects on an rpcId mismatch', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ rpcId: '22222222-2222-2222-2222-222222222222', result: { ok: true, value: 1 } }),
    } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)
    await expect(rpcCall('pluginManager/list', {})).rejects.toThrow(/rpcId mismatch/)
  })

  it('rejects with the gateway error detail', async () => {
    stubFetch({ ok: false, error: { code: 'REMOTE_ERROR', message: 'unavailable' } })
    await expect(rpcCall('pluginManager/removePlugin', { request: { pluginName: 'x' } })).rejects.toThrow(
      'pluginManager/removePlugin failed: REMOTE_ERROR: unavailable',
    )
  })

  it('rejects with a generic detail when the gateway omits the error', async () => {
    stubFetch({ ok: false })
    await expect(rpcCall('pluginManager/list', {})).rejects.toThrow('pluginManager/list failed: empty result')
  })

  it('rejects when the result carries no value', async () => {
    stubFetch({ ok: true })
    await expect(rpcCall('pluginManager/list', {})).rejects.toThrow('pluginManager/list failed: empty result')
  })
})

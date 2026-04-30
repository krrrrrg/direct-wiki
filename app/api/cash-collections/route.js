import { erpFetch, normalizeCashCollection, routeError } from '@/lib/erpApi'

const GET_PARAMS = ['page', 'limit', 'storeCode', 'search', 'status', 'source', 'targetMonth', 'from', 'to']

export async function GET(req) {
  try {
    const query = new URLSearchParams()
    for (const key of GET_PARAMS) {
      const value = req.nextUrl.searchParams.get(key)
      if (value) query.set(key, value)
    }

    const path = `/api/direct-store-cash-collections${query.toString() ? `?${query}` : ''}`
    const payload = await erpFetch(path)
    const items = payload.data?.items || []

    return Response.json({
      success: true,
      data: items.map(normalizeCashCollection),
      summary: payload.data?.summary || null,
      meta: payload.meta || null,
    })
  } catch (error) {
    return routeError(error)
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const payload = await erpFetch('/api/direct-store-cash-collections', {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        source: 'DIRECT_WIKI',
      }),
    })

    return Response.json({
      success: true,
      data: normalizeCashCollection(payload.data),
    })
  } catch (error) {
    return routeError(error)
  }
}

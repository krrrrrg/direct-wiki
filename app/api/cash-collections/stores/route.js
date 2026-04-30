import { erpFetch, normalizeStore, routeError } from '@/lib/erpApi'

export async function GET() {
  try {
    const payload = await erpFetch('/api/direct-store-sales/stores')
    return Response.json({
      success: true,
      data: (payload.data || []).map(normalizeStore),
    })
  } catch (error) {
    return routeError(error)
  }
}

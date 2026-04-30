import { randomUUID } from 'node:crypto'
import { erpFetch, normalizeRepairRequest, repairStatusToErp, routeError } from '@/lib/erpApi'

const GET_PARAMS = ['page', 'limit', 'storeCode', 'search', 'status', 'source', 'from', 'to']

export async function GET(req) {
  try {
    const query = new URLSearchParams()
    for (const key of GET_PARAMS) {
      const value = req.nextUrl.searchParams.get(key)
      if (!value) continue
      query.set(key, key === 'status' && value.toLowerCase() !== 'all' ? repairStatusToErp(value) : value)
    }

    const path = `/api/direct-store-repair-requests${query.toString() ? `?${query}` : ''}`
    const payload = await erpFetch(path)
    const items = payload.data?.items || []

    return Response.json({
      success: true,
      data: items.map(normalizeRepairRequest),
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
    const payload = await erpFetch('/api/direct-store-repair-requests', {
      method: 'POST',
      body: JSON.stringify({
        storeCode: body.storeCode || body.store_code || body.store_id,
        reporterName: body.reporterName || body.reporter_name,
        symptom: body.symptom,
        photoUrls: body.photoUrls || body.photo_urls || [],
        videoUrl: body.videoUrl || body.video_url || null,
        status: repairStatusToErp(body.status),
        source: 'DIRECT_WIKI',
        sourceSubmissionId: body.sourceSubmissionId || randomUUID(),
        reportedAt: body.reportedAt || body.created_at || new Date().toISOString(),
        raw: {
          source: 'direct-wiki',
          payload: body,
        },
      }),
    })

    return Response.json({
      success: true,
      data: normalizeRepairRequest(payload.data),
    })
  } catch (error) {
    return routeError(error)
  }
}

import { erpFetch, normalizeRepairRequest, repairStatusToErp, routeError } from '@/lib/erpApi'

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const body = await req.json()
    const payload = await erpFetch(`/api/direct-store-repair-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...body,
        status: body.status ? repairStatusToErp(body.status) : undefined,
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

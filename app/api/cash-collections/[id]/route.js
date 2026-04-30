import { erpFetch, normalizeCashCollection, routeError } from '@/lib/erpApi'

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params
    const payload = await erpFetch(`/api/direct-store-cash-collections/${id}`, {
      method: 'DELETE',
    })

    return Response.json({
      success: true,
      data: normalizeCashCollection(payload.data),
    })
  } catch (error) {
    return routeError(error)
  }
}

import 'server-only'

const DEFAULT_ERP_API_BASE_URL = 'https://second-erp-production.up.railway.app'

function erpApiBaseUrl() {
  return (process.env.ERP_API_BASE_URL || DEFAULT_ERP_API_BASE_URL).replace(/\/$/, '')
}

function erpApiKey() {
  return (
    process.env.ERP_API_KEY ||
    process.env.DIRECT_STORE_SALES_BRIDGE_TOKEN ||
    process.env.DIRECT_WIKI_ERP_TOKEN ||
    ''
  ).trim()
}

export function normalizeCashCollection(item) {
  if (!item) return null

  return {
    ...item,
    store_id: item.storeCode,
    worker_name: item.submitterName,
    collection_date: item.collectionDate ? String(item.collectionDate).slice(0, 10) : null,
    target_month: item.targetMonth,
    stores: {
      name: item.storeName || item.store?.storeName || item.storeCode,
      code: item.storeCode,
      region: item.store?.region || null,
    },
  }
}

export function normalizeStore(store) {
  return {
    ...store,
    id: store.storeCode,
    code: store.storeCode,
    name: store.storeName,
  }
}

export async function erpFetch(path, options = {}) {
  const apiKey = erpApiKey()
  if (!apiKey) {
    const error = new Error('ERP 연동 키가 설정되지 않았습니다.')
    error.status = 500
    throw error
  }

  const headers = new Headers(options.headers || {})
  headers.set('Authorization', `Bearer ${apiKey}`)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${erpApiBaseUrl()}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.error?.message || 'ERP API 요청에 실패했습니다.')
    error.status = response.status || 500
    error.payload = payload
    throw error
  }

  return payload
}

export function routeError(error) {
  return Response.json(
    {
      success: false,
      error: {
        message: error?.message || '요청 처리 중 오류가 발생했습니다.',
        details: error?.payload?.error || null,
      },
    },
    { status: error?.status || 500 }
  )
}

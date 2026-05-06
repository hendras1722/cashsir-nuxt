export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const orderId = query.order_id
  const config = useRuntimeConfig()

  const serverKey = config.midtransServerKey
  const isProduction = config.public.midtransIsProduction
  
  if (!serverKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Midtrans Server Key is not configured'
    })
  }

  const baseUrl = isProduction 
    ? 'https://api.midtrans.com/v2' 
    : 'https://api.sandbox.midtrans.com/v2'

  const authHeader = `Basic ${Buffer.from(serverKey + ':').toString('base64')}`

  try {
    const response: any = await $fetch(`${baseUrl}/${orderId}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    })

    return {
      status: 'success',
      data: response
    }
  } catch (error: any) {
    console.error('Midtrans Status API Error:', error.data || error.message)
    return {
      status: 'error',
      message: error.data?.status_message || 'Failed to check status'
    }
  }
})

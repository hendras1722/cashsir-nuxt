export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  console.log(config, '---- config ----')

  const serverKey = config.midtransServerKey
  const isProduction = config.public.midtransIsProduction

  if (!serverKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Midtrans Server Key is not configured'
    })
  }

  const baseUrl = isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

  // Midtrans requires order_id to be unique
  const orderId = `ORDER-${Date.now()}`

  try {
    const response = await $fetch<any>(baseUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(serverKey + ':').toString('base64')}`
      },
      body: {
        transaction_details: {
          order_id: orderId,
          gross_amount: body.amount
        },
        item_details: body.items.map((item: any) => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          name: item.name
        }))
      }
    })

    return {
      status: 'success',
      data: {
        order_id: orderId,
        redirect_url: response.redirect_url,
        token: response.token
      }
    }
  } catch (error: any) {
    console.error('Midtrans API Error:', error.data || error.message)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.error_messages?.[0] || 'Midtrans payment initiation failed'
    })
  }
})

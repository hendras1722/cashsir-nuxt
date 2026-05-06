export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const serverKey = config.midtransServerKey
  const isProduction = config.public.midtransIsProduction
  
  if (!serverKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Midtrans Server Key is not configured'
    })
  }

  const bank = body.bank
  const isCoreApi = !!bank
  const baseUrl = isProduction 
    ? 'https://api.midtrans.com/v2' 
    : 'https://api.sandbox.midtrans.com/v2'

  const snapBaseUrl = isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

  const orderId = `ORDER-${Date.now()}`
  const authHeader = `Basic ${Buffer.from(serverKey + ':').toString('base64')}`

  try {
    let response: any

    if (isCoreApi) {
      // Logic to determine payment type and structure
      let paymentType = 'bank_transfer'
      let paymentDetails: any = {}

      if (['bca', 'bni', 'bri', 'permata'].includes(bank)) {
        paymentType = 'bank_transfer'
        paymentDetails = { bank_transfer: { bank } }
      } else if (bank === 'echannel') {
        paymentType = 'echannel'
        paymentDetails = { 
          echannel: { 
            bill_info1: 'Payment For:',
            bill_info2: 'POS Order'
          } 
        }
      } else if (bank === 'qris') {
        paymentType = 'qris'
        // Removing explicit acquirer to avoid 'Merchant pop id' errors
        paymentDetails = { qris: {} }
      } else if (bank === 'gopay') {
        paymentType = 'gopay'
        paymentDetails = { gopay: { enable_callback: true } }
      } else if (bank === 'shopeepay') {
        paymentType = 'shopeepay'
        paymentDetails = { shopeepay: { callback_url: 'https://midtrans.com' } }
      }

      // Core API Charge
      response = await $fetch(`${baseUrl}/charge`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: {
          payment_type: paymentType,
          transaction_details: {
            order_id: orderId,
            gross_amount: body.amount
          },
          custom_expiry: {
            expiry_duration: 5,
            unit: 'minute'
          },
          ...paymentDetails,
          item_details: body.items.map((item: any) => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity,
            name: item.name
          }))
        }
      })
    } else {
      // Standard Snap API
      response = await $fetch(snapBaseUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: {
          transaction_details: {
            order_id: orderId,
            gross_amount: body.amount
          },
          custom_expiry: {
            expiry_duration: 5,
            unit: 'minute'
          },
          item_details: body.items.map((item: any) => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity,
            name: item.name
          }))
        }
      })
    }

    return {
      status: 'success',
      data: {
        order_id: orderId,
        ...response
      }
    }
  } catch (error: any) {
    console.error('Midtrans API Error:', error.data || error.message)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.error_messages?.[0] || error.data?.status_message || 'Midtrans payment initiation failed'
    })
  }
})

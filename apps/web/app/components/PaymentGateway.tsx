"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@repo/ui/components"
import { PaypalGateway, StripeGateway, MomoGateway } from "pay-connect"

const PaymentGateway = () => {
  const paypal = new PaypalGateway(
    {
      clientId:
        "ATcKk56VTlFumY6C0u3YiTC94xR5_RST9CNRIc18Cby7iGcfc3cNQzMIygtzyP9GCjxszG2X4BCqtUI0",
    },
    "EMlSYr0oXYUs2u_ThwWYsaw5f5nyXdditxTCgGzKrc_ANR-2amzDvHVpiGfVJDwO0Z9WrV1MEJ5RpzAF",
  )
  const stripe = new StripeGateway("your-api-key")
  const momo = new MomoGateway()

  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [refundResponse, setRefundResponse] = useState<string | null>(null)
  const [captureId, setCaptureId] = useState<string | null>(null)
  const [captureDetails, setCaptureDetails] = useState<string | null>(null)
  const [subscriptionResponse, setSubscriptionResponse] = useState<
    string | null
  >(null)
  const [planId, setPlanId] = useState<string | null>(null)
  const [productId, setProductId] = useState<string | null>(null)

  const createOrderHandler = async () => {
    const orderData = {
      subtotal: "100.00",
      tax: "10.00",
      discount: "5.00",
      total: "105.00",
      billing_info: {
        name: "John Doe",
        phone_number: "123456789",
        address: "123 Main St",
        city: "Anytown",
        postal_code: "95131",
      },
    }

    const orderResponse = await paypal.orders.createOrder(orderData)

    if (!orderResponse) {
      throw new Error("Failed to create order")
    }

    const { jsonResponse } = orderResponse
    return jsonResponse.id
  }

  const onApproveCheckoutHandler = async (data: { orderID: string }) => {
    const captureResponse = await paypal.orders.captureOrder(data.orderID)
    if (!captureResponse) {
      throw new Error("Failed to capture order")
    }
    const { jsonResponse } = captureResponse
    const { id: captureId } =
      jsonResponse.purchase_units[0].payments.captures[0]
    setCaptureId(captureId)
    setTransactionId(jsonResponse.id)
  }

  const onApproveSubscriptionHandler = async (data: {
    subscriptionID: string
  }) => {
    if (!data.subscriptionID) {
      throw new Error("Subscription ID is undefined or null")
    }
    const subscriptionDetailsResponse =
      await paypal.subscriptions.getSubscriptionDetails(data.subscriptionID)
    const { jsonResponse } = subscriptionDetailsResponse

    setSubscriptionResponse(JSON.stringify(jsonResponse, null, 2))
    return data.subscriptionID
  }

  const handleRefund = async () => {
    if (!captureId) {
      throw new Error("No transaction to refund")
    }
    try {
      const response = await paypal.payments.refundCapturedPayment(
        captureId,
        "105.00",
      )
      setRefundResponse(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to refund the transaction", error)
      setRefundResponse("Refund failed")
    }
  }

  const handleShowCaptureDetails = async () => {
    if (!captureId) {
      throw new Error("No transaction to show details")
    }
    try {
      const response = await paypal.payments.getCaptureDetails(captureId)
      setCaptureDetails(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to get capture details", error)
      setCaptureDetails("Failed to get capture details")
    }
  }

  const handleCreateProduct = async () => {
    const productData = {
      name: "Basic Product",
      description: "A basic product for subscription",
      type: "SERVICE",
      category: "SOFTWARE",
    }

    try {
      const response = await paypal.products.createProduct(productData)
      setProductId(response.jsonResponse.id)
    } catch (error) {
      console.error("Failed to create product", error)
    }
  }

  const handleCreatePlan = async () => {
    if (!productId) {
      throw new Error("No product ID available")
    }
    const planData = {
      product_id: productId,
      name: "Basic Plan",
      description: "Basic subscription plan",
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 12,
          pricing_scheme: {
            fixed_price: {
              value: "10.00",
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "0.00",
          currency_code: "USD",
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
      taxes: {
        percentage: "10",
        inclusive: false,
      },
    }

    try {
      const response = await paypal.subscriptions.createPlan(planData)
      setPlanId(response.jsonResponse.id)
    } catch (error) {
      console.error("Failed to create plan", error)
    }
  }

  const createSubscriptionHandlerRef = useRef<() => Promise<string>>(null)

  useEffect(() => {
    createSubscriptionHandlerRef.current = async () => {
      if (!planId) {
        throw new Error("No plan ID available")
      }

      const subscriptionData = {
        plan_id: planId,
        subscriber: {
          name: {
            given_name: "John",
            surname: "Doe",
          },
          email_address: "john.doe@example.com",
        },
        application_context: {
          brand_name: "Your Brand",
          locale: "en-US",
          shipping_preference: "SET_PROVIDED_ADDRESS",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
          return_url: "https://your-return-url.com",
          cancel_url: "https://your-cancel-url.com",
        },
      }

      try {
        const response =
          await paypal.subscriptions.createSubscription(subscriptionData)
        setSubscriptionResponse(JSON.stringify(response.jsonResponse, null, 2))
        return response.jsonResponse.id || ""
      } catch (error) {
        console.error("Failed to create subscription", error)
        setSubscriptionResponse("Failed to create subscription")
        throw error
      }
    }
  }, [planId])

  useEffect(() => {
    paypal.renderCheckoutButtons("paypal-button-checkout-container", {
      createOrder: createOrderHandler,
      onApprove: onApproveCheckoutHandler,
    })
    paypal.renderSubscriptionButtons("paypal-button-subscription-container", {
      createSubscription: async () => {
        if (createSubscriptionHandlerRef.current) {
          return await createSubscriptionHandlerRef.current()
        }
        throw new Error("createSubscriptionHandlerRef.current is not defined")
      },
      onApprove: async (data: {
        subscriptionID?: string | null | undefined
      }) => {
        if (!data.subscriptionID) {
          throw new Error("Subscription ID is undefined or null")
        }
        await onApproveSubscriptionHandler({
          subscriptionID: data.subscriptionID,
        })
      },
    })
  }, [])

  return (
    <div className="flex flex-col items-center gap-2">
      <h2 className="text-3xl underline">Payment Gateway Integration</h2>
      <div id="paypal-button-checkout-container"></div>
      {transactionId && (
        <>
          <Button onClick={handleRefund}>Refund Transaction</Button>
          <Button onClick={handleShowCaptureDetails}>
            Show Capture Details
          </Button>
        </>
      )}
      <Button onClick={handleCreateProduct}>Create Product</Button>
      <Button onClick={handleCreatePlan}>Create Plan</Button>
      <div id="paypal-button-subscription-container"></div>
      {refundResponse && (
        <pre className="rounded bg-gray-100 p-4">{refundResponse}</pre>
      )}
      {captureDetails && (
        <pre className="rounded bg-gray-100 p-4">{captureDetails}</pre>
      )}
      {subscriptionResponse && (
        <pre className="rounded bg-gray-100 p-4">{subscriptionResponse}</pre>
      )}
    </div>
  )
}

export default PaymentGateway

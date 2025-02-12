"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@repo/ui/components"
import { PaypalGateway } from "pay-connect"

const PaymentGateway = () => {
  const paypal = new PaypalGateway(
    {
      clientId:
        "ATcKk56VTlFumY6C0u3YiTC94xR5_RST9CNRIc18Cby7iGcfc3cNQzMIygtzyP9GCjxszG2X4BCqtUI0",
    },
    "EMlSYr0oXYUs2u_ThwWYsaw5f5nyXdditxTCgGzKrc_ANR-2amzDvHVpiGfVJDwO0Z9WrV1MEJ5RpzAF",
  )

  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [refundResponse, setRefundResponse] = useState<string | null>(null)
  const [captureId, setCaptureId] = useState<string | null>(null)
  const [captureDetails, setCaptureDetails] = useState<string | null>(null)
  const [subscriptionResponse, setSubscriptionResponse] = useState<
    string | null
  >(null)
  const [planId, setPlanId] = useState<string | null>(null)
  const [productId, setProductId] = useState<string | null>(null)
  const [productList, setProductList] = useState<string | null>(null)
  const [planList, setPlanList] = useState<string | null>(null)
  const [productDetails, setProductDetails] = useState<any | null>(null)
  const buttonsRenderedRef = useRef(false)
  const createSubscriptionHandlerRef = useRef<() => Promise<string>>(null)

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

  const handleGetProductList = async () => {
    try {
      const response = await paypal.products.getProductList()
      setProductList(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to get product list", error)
      setProductList("Failed to get product list")
    }
  }

  const handleGetPlanList = async () => {
    try {
      const response = await paypal.subscriptions.getPlanList()
      setPlanList(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to get plan list", error)
      setPlanList("Failed to get plan list")
    }
  }

  const handleShowProductDetails = async () => {
    if (!productId) {
      throw new Error("No product ID available")
    }
    try {
      const response = await paypal.products.getProductDetails(
        "PROD-56R10706W6680380W",
      )
      setProductDetails(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to get product details", error)
      setProductDetails("Failed to get product details")
    }
  }

  const handleUpdateProduct = async () => {
    if (!productId) {
      throw new Error("No product ID available")
    }

    const updatedProductData = [
      {
        op: "replace",
        path: "/description",
        value: "Premium video streaming service",
      },
    ]

    try {
      await paypal.products.updateProduct(
        "PROD-56R10706W6680380W",
        updatedProductData,
      )
      const response = await paypal.products.getProductDetails(
        "PROD-56R10706W6680380W",
      )
      setProductDetails(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to update product", error)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscriptionResponse) {
      throw new Error("No subscription to cancel")
    }
    const subscriptionID = JSON.parse(subscriptionResponse).id
    try {
      const response = await paypal.subscriptions.cancelSubscription(
        subscriptionID,
        "Customer requested cancellation",
      )
      setSubscriptionResponse(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to cancel subscription", error)
      setSubscriptionResponse("Failed to cancel subscription")
    }
  }

  const handleActivateSubscription = async () => {
    if (!subscriptionResponse) {
      throw new Error("No subscription to activate")
    }
    const subscriptionID = JSON.parse(subscriptionResponse).id
    try {
      const response =
        await paypal.subscriptions.activateSubscription(subscriptionID)
      setSubscriptionResponse(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to activate subscription", error)
      setSubscriptionResponse("Failed to activate subscription")
    }
  }

  const handleCaptureSubscription = async () => {
    if (!subscriptionResponse) {
      throw new Error("No subscription to capture")
    }
    const subscriptionID = JSON.parse(subscriptionResponse).id
    try {
      const response =
        await paypal.subscriptions.captureSubscription(subscriptionID)
      setSubscriptionResponse(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to capture subscription", error)
      setSubscriptionResponse("Failed to capture subscription")
    }
  }

  const handleSuspendSubscription = async () => {
    if (!subscriptionResponse) {
      throw new Error("No subscription to suspend")
    }
    const subscriptionID = JSON.parse(subscriptionResponse).id
    try {
      const response = await paypal.subscriptions.suspendSubscription(
        subscriptionID,
        "Customer requested suspension",
      )
      setSubscriptionResponse(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to suspend subscription", error)
      setSubscriptionResponse("Failed to suspend subscription")
    }
  }

  const handleReviseSubscription = async () => {
    if (!subscriptionResponse) {
      throw new Error("No subscription to revise")
    }
    const subscriptionID = JSON.parse(subscriptionResponse).id
    const revisedData = {
      plan_id: planId,
    }
    try {
      const response = await paypal.subscriptions.reviseSubscription(
        subscriptionID,
        revisedData,
      )
      setSubscriptionResponse(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to revise subscription", error)
      setSubscriptionResponse("Failed to revise subscription")
    }
  }

  const handleListSubscriptionTransactions = async () => {
    if (!subscriptionResponse) {
      throw new Error("No subscription to list transactions")
    }
    const subscriptionID = JSON.parse(subscriptionResponse).id
    const startTime = new Date().toISOString()
    const endTime = new Date().toISOString()
    try {
      const response = await paypal.subscriptions.listSubscriptionTransactions(
        subscriptionID,
        startTime,
        endTime,
      )
      setSubscriptionResponse(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to list subscription transactions", error)
      setSubscriptionResponse("Failed to list subscription transactions")
    }
  }

  const handleGetPlanDetails = async () => {
    if (!planId) {
      throw new Error("No plan ID available")
    }
    try {
      const response = await paypal.subscriptions.getPlanDetails(planId)
      setPlanList(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to get plan details", error)
      setPlanList("Failed to get plan details")
    }
  }

  const handleUpdatePlan = async () => {
    if (!planId) {
      throw new Error("No plan ID available")
    }

    const updatedPlanData = [
      {
        op: "replace",
        path: "/description",
        value: "Updated plan description",
      },
    ]

    try {
      await paypal.subscriptions.updatePlan(planId, updatedPlanData)
      const response = await paypal.subscriptions.getPlanDetails(planId)
      setPlanList(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to update plan", error)
    }
  }

  const handleUpdatePlanPricing = async () => {
    if (!planId) {
      throw new Error("No plan ID available")
    }

    const pricingData = {
      pricing_schemes: [
        {
          billing_cycle_sequence: 1,
          pricing_scheme: {
            fixed_price: {
              value: "15.00",
              currency_code: "USD",
            },
          },
        },
      ],
    }

    try {
      await paypal.subscriptions.updatePlanPricing(planId, pricingData)
      const response = await paypal.subscriptions.getPlanDetails(planId)
      setPlanList(JSON.stringify(response.jsonResponse, null, 2))
    } catch (error) {
      console.error("Failed to update plan pricing", error)
    }
  }

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
    if (!buttonsRenderedRef.current) {
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
      buttonsRenderedRef.current = true
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="mb-4 text-3xl font-bold underline">
        Payment Gateway Integration
      </h2>
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-x-2 space-y-2 rounded border p-4 shadow">
          <h3 className="mb-2 text-xl font-semibold">Order Actions</h3>
          <div id="paypal-button-checkout-container" className="mb-4"></div>
          {transactionId && (
            <>
              <Button onClick={handleRefund}>Refund Transaction</Button>
              <Button onClick={handleShowCaptureDetails}>
                Show Capture Details
              </Button>
            </>
          )}
        </div>
        <div className="space-x-2 space-y-2 rounded border p-4 shadow">
          <h3 className="mb-2 text-xl font-semibold">Product Actions</h3>
          <Button onClick={handleCreateProduct}>Create Product</Button>
          <Button onClick={handleUpdateProduct}>Update Product</Button>
          <Button onClick={handleShowProductDetails}>
            Show Product Details
          </Button>
          <Button onClick={handleGetProductList}>Get Product List</Button>
        </div>
        <div className="space-x-2 space-y-2 rounded border p-4 shadow">
          <h3 className="mb-2 text-xl font-semibold">Plan Actions</h3>
          <Button onClick={handleCreatePlan}>Create Plan</Button>
          <Button onClick={handleGetPlanList}>Get Plan List</Button>
          <Button onClick={handleGetPlanDetails}>Get Plan Details</Button>
          <Button onClick={handleUpdatePlan}>Update Plan</Button>
          <Button onClick={handleUpdatePlanPricing}>Update Plan Pricing</Button>
        </div>
        <div className="space-x-2 space-y-2 rounded border p-4 shadow">
          <h3 className="mb-2 text-xl font-semibold">Subscription Actions</h3>
          <div id="paypal-button-subscription-container" className="mb-4"></div>
          <Button onClick={handleCancelSubscription}>
            Cancel Subscription
          </Button>
          <Button onClick={handleActivateSubscription}>
            Activate Subscription
          </Button>
          <Button onClick={handleCaptureSubscription}>
            Capture Subscription
          </Button>
          <Button onClick={handleSuspendSubscription}>
            Suspend Subscription
          </Button>
          <Button onClick={handleReviseSubscription}>
            Revise Subscription
          </Button>
          <Button onClick={handleListSubscriptionTransactions}>
            List Subscription Transactions
          </Button>
        </div>
      </div>
      <div className="mt-4 w-full max-w-4xl">
        {refundResponse && (
          <pre className="mb-4 rounded bg-gray-100 p-4">{refundResponse}</pre>
        )}
        {captureDetails && (
          <pre className="mb-4 rounded bg-gray-100 p-4">{captureDetails}</pre>
        )}
        {subscriptionResponse && (
          <pre className="mb-4 rounded bg-gray-100 p-4">
            {subscriptionResponse}
          </pre>
        )}
        {productDetails && (
          <pre className="mb-4 rounded bg-gray-100 p-4">{productDetails}</pre>
        )}
        {productList && (
          <pre className="mb-4 rounded bg-gray-100 p-4">{productList}</pre>
        )}
        {planList && (
          <pre className="mb-4 rounded bg-gray-100 p-4">{planList}</pre>
        )}
      </div>
    </div>
  )
}

export default PaymentGateway

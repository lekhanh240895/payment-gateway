"use client"

import { useState } from "react"
import { initializeGateways } from "pay-connect/index"
import { Button } from "@repo/ui/components"

const PaymentGateway = () => {
  const { momo, paypal, stripe } = initializeGateways()
  const [paymentResponse, setPaymentResponse] = useState<string | null>(null)

  const handleMomoPayment = async () => {
    const response = await momo.startPayment(1000, "order-123")
    setPaymentResponse(response)
  }

  const handlePaypalPayment = async () => {
    const response = paypal.initializePayment(1000, "USD")
    setPaymentResponse(response.message)
  }

  const handleStripePayment = async () => {
    const response = stripe.createCharge(1000, "USD", "source-id")
    setPaymentResponse(
      response.success ? "Payment successful" : "Payment failed",
    )
  }

  return (
    <div>
      <h2 className="text-3xl underline">Payment Gateway Integration</h2>
      <Button onClick={handleMomoPayment}>Pay with Momo</Button>
      <Button onClick={handlePaypalPayment}>Pay with PayPal</Button>
      <Button onClick={handleStripePayment}>Pay with Stripe</Button>
      {paymentResponse && <div>Payment Response: {paymentResponse}</div>}
    </div>
  )
}

export default PaymentGateway

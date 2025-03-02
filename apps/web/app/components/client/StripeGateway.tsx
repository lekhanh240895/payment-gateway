"use client"

import dynamic from "next/dynamic"
import React from "react"

const StripeCheckoutComponent = dynamic(
  () => import("@/components/StripeCheckout"),
  {
    ssr: false,
  },
)
const StripeSubscriptionComponent = dynamic(
  () => import("@/components/StripeSubscription"),
  { ssr: false },
)

function StripeGateWayClient() {
  return (
    <div>
      <StripeCheckoutComponent />
      <StripeSubscriptionComponent />
    </div>
  )
}

export default StripeGateWayClient

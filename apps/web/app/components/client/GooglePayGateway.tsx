"use client"

import dynamic from "next/dynamic"
import React from "react"

const GooglePayGatewayComponent = dynamic(
  () => import("@/components/GooglePayGateway"),
  { ssr: false },
)

function GooglePayGatewayClient() {
  return <GooglePayGatewayComponent />
}

export default GooglePayGatewayClient

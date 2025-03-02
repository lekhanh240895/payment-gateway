import { GooglePayGatewayOptions, initializeGateways } from "pay-connect"
import React, { useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components"
import Image from "next/image"

function GooglePayGatewayComponent() {
  const product = {
    name: "Sample Product",
    price: "100.00",
    currency: "USD",
  }

  const googlePayOptions: GooglePayGatewayOptions = {
    environment: "TEST",
    paymentRequest: {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: ["MASTERCARD", "VISA"],
            billingAddressRequired: true,
          },
          tokenizationSpecification: {
            type: "PAYMENT_GATEWAY",
            parameters: {
              gateway: "example",
              gatewayMerchantId: "exampleGatewayMerchantId",
            },
          },
        },
      ],
      merchantInfo: {
        merchantId: "12345678901234567890",
        merchantName: "Demo Merchant",
      },
      transactionInfo: {
        totalPriceStatus: "FINAL",
        totalPriceLabel: "Total",
        totalPrice: product.price,
        currencyCode: product.currency,
        countryCode: "US",
      },
      callbackIntents: [
        "PAYMENT_AUTHORIZATION",
        "SHIPPING_ADDRESS",
        "SHIPPING_OPTION",
      ],
      shippingAddressRequired: true,
      shippingAddressParameters: {
        phoneNumberRequired: true,
      },
      shippingOptionRequired: true,
    },
  }
  const { googlepay } = initializeGateways(["googlepay"], {
    googlepay: googlePayOptions,
  })

  useEffect(() => {
    googlepay.renderButton("google-pay-button-container")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-md">
        <CardHeader>
          <div className="relative h-48">
            <Image
              src="https://picsum.photos/400/200"
              alt="Product Image"
              className="h-48 w-full object-cover"
              fill
              sizes="100%"
            />
          </div>
        </CardHeader>
        <CardContent>
          <CardTitle>Sample Product</CardTitle>
          <CardDescription>Price: $100.00 USD</CardDescription>
          <div className="mt-4">
            <div id="google-pay-button-container" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GooglePayGatewayComponent

export * from "./gateways/momo"
export * from "./gateways/paypal"
export * from "./gateways/stripe"
export * from "./gateways/google-pay"
export type * from "./gateways/google-pay/types"

import { GooglePayGateway } from "./gateways/google-pay"
import { GooglePayOptions } from "./gateways/google-pay/types"
import { MomoGateway } from "./gateways/momo"
import { PaypalGateway, PaypalGatewayOptions } from "./gateways/paypal"
import { StripeGateway } from "./gateways/stripe"

interface GatewayConfig {
  paypal?: {
    options: PaypalGatewayOptions
  }
  stripe?: {
    apiKey: string
  }
  momo?: {
    // Add any necessary configuration for MomoGateway
  }
  googlePay?: GooglePayOptions
}

interface Gateways {
  paypal?: PaypalGateway
  stripe?: StripeGateway
  momo?: MomoGateway
  googlePay?: GooglePayGateway
}

export const initializeGateways = (config: GatewayConfig): Gateways => {
  const gateways: Gateways = {}

  if (config.paypal) {
    gateways.paypal = new PaypalGateway(config.paypal.options)
  }

  if (config.stripe) {
    gateways.stripe = new StripeGateway(config.stripe.apiKey)
  }

  if (config.momo) {
    gateways.momo = new MomoGateway()
  }

  if (config.googlePay) {
    gateways.googlePay = new GooglePayGateway(config.googlePay)
  }

  return gateways
}

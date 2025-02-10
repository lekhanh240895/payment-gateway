export * from "./gateways/momo"
export * from "./gateways/paypal"
export * from "./gateways/stripe"

import { MomoGateway } from "./gateways/momo"
import { PaypalGateway } from "./gateways/paypal"
import { StripeGateway } from "./gateways/stripe"

interface GatewayConfig {
  paypal?: {
    clientId: string
    clientSecret: string
  }
  stripe?: {
    apiKey: string
  }
  momo?: {
    // Add any necessary configuration for MomoGateway
  }
}

interface Gateways {
  paypal?: PaypalGateway
  stripe?: StripeGateway
  momo?: MomoGateway
}

export const initializeGateways = (config: GatewayConfig): Gateways => {
  const gateways: Gateways = {}

  if (config.paypal) {
    gateways.paypal = new PaypalGateway(
      config.paypal.clientId,
      config.paypal.clientSecret,
    )
  }

  if (config.stripe) {
    gateways.stripe = new StripeGateway(config.stripe.apiKey)
  }

  if (config.momo) {
    gateways.momo = new MomoGateway() // Pass any necessary configuration for MomoGateway
  }

  return gateways
}

import { PaypalGateway, PaypalGatewayOptions } from "./gateways/paypal"
import { StripeGateway } from "./gateways/stripe"
import { GooglePayGateway } from "./gateways/google-pay"
import { MomoGateway } from "./gateways/momo"
import { GooglePayGatewayOptions } from "./gateways/google-pay/types"
import { StripeGatewayOptions } from "./gateways/stripe/types"

type GatewayType = "paypal" | "stripe" | "googlepay" | "momo"

interface GatewayConfig {
  paypal?: PaypalGatewayOptions
  stripe?: StripeGatewayOptions
  googlepay?: GooglePayGatewayOptions
  momo?: any
}

export type * from "./gateways/google-pay/types"
export * from "./gateways/stripe/types"

export function initializeGateways(
  gatewayTypes: GatewayType[],
  config: GatewayConfig,
) {
  //@ts-ignore
  const gateways: {
    paypal: PaypalGateway
    stripe: StripeGateway
    googlepay: GooglePayGateway
    momo: MomoGateway
  } = {}

  gatewayTypes.forEach((gatewayType) => {
    switch (gatewayType) {
      case "paypal":
        if (config.paypal) {
          gateways.paypal = new PaypalGateway(config.paypal)
        } else {
          throw new Error("Paypal configuration is missing")
        }
        break
      case "stripe":
        if (config.stripe) {
          gateways.stripe = new StripeGateway(config.stripe)
        } else {
          throw new Error("Stripe configuration is missing")
        }
        break
      case "googlepay":
        if (typeof window !== "undefined") {
          const { GooglePayGateway } = require("./gateways/google-pay")
          if (config.googlepay) {
            gateways.googlepay = new GooglePayGateway(config.googlepay)
          } else {
            throw new Error("Google Pay configuration is missing")
          }
        }
        break
      case "momo":
        gateways.momo = new MomoGateway()
        break
      default:
        throw new Error(`Unsupported gateway type: ${gatewayType}`)
    }
  })

  return gateways
}

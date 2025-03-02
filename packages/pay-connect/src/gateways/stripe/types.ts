export { Stripe } from "stripe"
import Stripe from "stripe"

export interface WebhookOptions {
  secret?: string
  customHandlers?: {
    [key: string]: (event: Stripe.Event) => Promise<void>
  }
}

export interface StripeGatewayOptions extends Stripe.RequestOptions {
  webhookConfig?: WebhookOptions
  publishableKey?: string
}

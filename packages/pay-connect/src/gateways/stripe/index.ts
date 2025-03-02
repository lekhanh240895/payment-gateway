import { loadStripe, StripeConstructorOptions } from "@stripe/stripe-js"
import { Stripe, StripeGatewayOptions } from "./types"
import { createWebhookHandler } from "./webhookHandler"

export class StripeGateway {
  public options: StripeGatewayOptions
  public customers: Stripe.CustomersResource
  public charges: Stripe.ChargesResource
  public refunds: Stripe.RefundsResource
  public subscriptions: Stripe.SubscriptionsResource
  public prices: Stripe.PricesResource
  public products: Stripe.ProductsResource
  public plans: Stripe.PlansResource
  public paymentMethods: Stripe.PaymentMethodsResource
  public checkout: { sessions: Stripe.Checkout.SessionsResource } = {
    sessions: {} as Stripe.Checkout.SessionsResource,
  }
  public billingPortal: {
    sessions: Stripe.BillingPortal.SessionsResource
  } = {
    sessions: {} as Stripe.BillingPortal.SessionsResource,
  }

  private stripe: Stripe
  private webhookHandler: (
    body: string,
    sig: string,
  ) => Promise<{
    received: boolean
  }> = async () => ({ received: false })

  constructor(options: StripeGatewayOptions) {
    this.options = options
    this.stripe = new Stripe(options.apiKey as string, {
      apiVersion: (options.apiVersion as any) ?? "2025-02-24.acacia",
    })
    this.customers = this.stripe.customers
    this.charges = this.stripe.charges
    this.refunds = this.stripe.refunds
    this.subscriptions = this.stripe.subscriptions
    this.prices = this.stripe.prices
    this.products = this.stripe.products
    this.checkout.sessions = this.stripe.checkout.sessions
    this.paymentMethods = this.stripe.paymentMethods
    this.billingPortal.sessions = this.stripe.billingPortal.sessions
    this.plans = this.stripe.plans

    if (options.webhookConfig?.secret) {
      this.webhookHandler = createWebhookHandler(
        this.stripe,
        options.webhookConfig.secret,
        options.webhookConfig.customHandlers || {},
      )
    }
  }

  public async loadStripeClient(constructorOptions?: StripeConstructorOptions) {
    try {
      const clientStripe = await loadStripe(
        this.options.publishableKey as string,
        constructorOptions,
      )
      return clientStripe
    } catch (error: any) {
      console.error("Error loading Stripe client:", error)
      throw error
    }
  }

  public async handleWebhook(req: Request, res: Response) {
    const sig = req.headers.get("stripe-signature") as string

    try {
      const body = await req.text()
      const result = await this.webhookHandler(body, sig)
      res = new Response(JSON.stringify(result), { status: 200 })
    } catch (err: any) {
      res = new Response(JSON.stringify({ error: err.message }), {
        status: 400,
      })
    }
    return res
  }
}

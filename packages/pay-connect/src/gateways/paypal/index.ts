import { PayPalOrders } from "./orders"
import { PayPalSubscriptions } from "./subscriptions"
import { PayPalPayments } from "./payments"
import { PayPalProducts } from "./products"
import {
  loadScript,
  PayPalButtonsComponentOptions,
  PayPalScriptOptions,
} from "@paypal/paypal-js"

export interface PaypalGatewayOptions extends PayPalScriptOptions {
  clientSecret?: string
}

export class PaypalGateway {
  private clientId: string
  private clientSecret?: string
  private options: PaypalGatewayOptions
  private baseUrl: string

  public orders: PayPalOrders
  public subscriptions: PayPalSubscriptions
  public payments: PayPalPayments
  public products: PayPalProducts

  constructor(options: PaypalGatewayOptions) {
    const defaultOptions: Partial<PaypalGatewayOptions> = {
      currency: "USD",
      intent: "CAPTURE",
      vault: false,
      buyerCountry: "US",
      locale: "en_US",
    }

    this.options = { ...defaultOptions, ...options }
    this.clientId = this.options.clientId || "test"
    this.clientSecret = this.options.clientSecret
    this.baseUrl =
      this.options.environment === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com"

    this.orders = new PayPalOrders(
      this.options,
      this.baseUrl,
      this.generateAccessToken.bind(this),
    )
    this.subscriptions = new PayPalSubscriptions(
      this.options,
      this.baseUrl,
      this.generateAccessToken.bind(this),
    )
    this.payments = new PayPalPayments(
      this.options,
      this.baseUrl,
      this.generateAccessToken.bind(this),
    )
    this.products = new PayPalProducts(
      this.options,
      this.baseUrl,
      this.generateAccessToken.bind(this),
    )
  }

  private async generateAccessToken() {
    if (!this.clientSecret) {
      throw new Error("Client secret is required for generating access token")
    }

    const auth = Buffer.from(
      `${this.options.clientId}:${this.clientSecret}`,
    ).toString("base64")
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to generate access token: ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  }

  async renderCheckoutButtons(
    containerId: string,
    options: PayPalButtonsComponentOptions = {},
  ) {
    const defaultOptions: PayPalButtonsComponentOptions = {
      style: {
        shape: "rect",
        layout: "vertical",
        color: "gold",
        label: "paypal",
      },
    }

    options = Object.assign({}, defaultOptions, options)

    let paypal

    try {
      paypal = await loadScript({ clientId: this.clientId })
    } catch (error) {
      console.error("failed to load the PayPal JS SDK script", error)
    }

    if (paypal && paypal.Buttons) {
      try {
        await paypal.Buttons(options).render(`#${containerId}`)
      } catch (error) {
        console.error("failed to render the PayPal Buttons", error)
      }
    }
  }

  async renderSubscriptionButtons(
    containerId: string,
    options: PayPalButtonsComponentOptions = {},
  ) {
    const defaultOptions: PayPalButtonsComponentOptions = {
      style: {
        layout: "vertical",
        color: "blue",
        shape: "rect",
        label: "subscribe",
      },
    }

    options = Object.assign({}, defaultOptions, options)

    let paypal

    try {
      paypal = await loadScript({
        clientId: this.clientId,
        vault: true,
        dataNamespace: "paypal_subscriptions",
      })
    } catch (error) {
      console.error("failed to load the PayPal JS SDK script", error)
    }

    if (paypal && paypal.Buttons) {
      try {
        await paypal.Buttons(options).render(`#${containerId}`)
      } catch (error) {
        console.error("failed to render the PayPal Buttons", error)
      }
    }
  }
}

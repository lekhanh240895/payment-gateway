import { PayPalScriptOptions } from "@paypal/paypal-js"
import { OrderData } from "./types"

export class PayPalOrders {
  private options: PayPalScriptOptions
  private clientSecret?: string
  private baseUrl: string

  constructor(
    options: PayPalScriptOptions,
    baseUrl: string,
    clientSecret?: string,
  ) {
    this.options = options
    this.baseUrl = baseUrl
    this.clientSecret = clientSecret
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

  async createOrder(data: OrderData) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v2/checkout/orders`
    const payload: any = {
      intent: this.options.intent,
      purchase_units: [
        {
          amount: {
            currency_code: this.options.currency,
            value: data.total,
            breakdown: {
              item_total: {
                currency_code: this.options.currency,
                value: data.subtotal,
              },
              discount: {
                currency_code: this.options.currency,
                value: data.discount,
              },
              tax_total: {
                currency_code: this.options.currency,
                value: data.tax,
              },
            },
          },
          shipping: {
            name: {
              full_name: data.billing_info.name,
            },
            address: {
              address_line_1: data.billing_info.address,
              admin_area_2: data.billing_info.city,
              admin_area_1: this.options.buyerCountry,
              country_code: this.options.buyerCountry,
            },
          },
        },
      ],
    }

    // Add postal_code if country_code is US
    if (this.options.buyerCountry === "US") {
      payload.purchase_units[0].shipping.address.postal_code =
        data.billing_info.postal_code
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })

    return this.handleResponse(response)
  }

  async captureOrder(orderID: string) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v2/checkout/orders/${orderID}/capture`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return this.handleResponse(response)
  }

  private async handleResponse(response: Response) {
    try {
      const jsonResponse = await response.json()
      return {
        jsonResponse,
        httpStatusCode: response.status,
      }
    } catch (err) {
      const errorMessage = await response.text()
      throw new Error(errorMessage)
    }
  }
}

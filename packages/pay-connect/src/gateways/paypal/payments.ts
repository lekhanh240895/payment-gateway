import { PayPalScriptOptions } from "@paypal/paypal-js"

export class PayPalPayments {
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

  async refundCapturedPayment(captureID: string, amount: string) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v2/payments/captures/${captureID}/refund`

    const payload = {
      amount: {
        value: amount,
        currency_code: this.options.currency,
      },
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

  async getCaptureDetails(captureID: string) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v2/payments/captures/${captureID}`

    const response = await fetch(url, {
      method: "GET",
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

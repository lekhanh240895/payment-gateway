import { PayPalScriptOptions } from "@paypal/paypal-js"
import { handleResponse } from "./utils"

export class PayPalPayments {
  private options: PayPalScriptOptions
  private baseUrl: string
  private generateAccessToken: () => Promise<string>

  constructor(
    options: PayPalScriptOptions,
    baseUrl: string,
    generateAccessToken: () => Promise<string>,
  ) {
    this.options = options
    this.baseUrl = baseUrl
    this.generateAccessToken = generateAccessToken
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

    return handleResponse(response)
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

    return handleResponse(response)
  }
}

import { PayPalScriptOptions } from "@paypal/paypal-js"
import { handleResponse } from "./utils"

import { ProductData } from "./types"

export class PayPalProducts {
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

  async createProduct(data: ProductData) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/catalogs/products`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    })

    return handleResponse(response)
  }

  async getProductList() {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/catalogs/products`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return handleResponse(response)
  }

  async getProductDetails(productId: string) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/catalogs/products/${productId}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return handleResponse(response)
  }
  async updateProduct(
    productId: string,
    data: { op: string; path: string; value: string }[],
  ) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/catalogs/products/${productId}`

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    })

    return handleResponse(response)
  }
}

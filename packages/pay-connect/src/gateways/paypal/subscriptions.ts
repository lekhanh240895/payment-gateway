import { PayPalScriptOptions } from "@paypal/paypal-js"
import { handleResponse } from "./utils"
import { SubscriptionData, PlanData, PricingData } from "./types"

export class PayPalSubscriptions {
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

  async createPlan(data: PlanData) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/billing/plans`

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

  async getPlanList() {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/billing/plans`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return handleResponse(response)
  }

  async getPlanDetails(planID: string) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/billing/plans/${planID}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return handleResponse(response)
  }

  async updatePlan(
    planID: string,
    data: { op: string; path: string; value: any }[],
  ) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/billing/plans/${planID}`

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

  async updatePlanPricing(planID: string, data: PricingData) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/billing/plans/${planID}/update-pricing-schemes`

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

  async createSubscription(data: SubscriptionData) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/billing/subscriptions`

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

  async getSubscriptionDetails(subscriptionID: string) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/billing/subscriptions/${subscriptionID}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return handleResponse(response)
  }

  async updateSubscription(
    subscriptionID: string,
    data: { op: string; path: string; value: any }[],
  ) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/billing/subscriptions/${subscriptionID}`

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

  async cancelSubscription(subscriptionID: string, reason: string) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/billing/subscriptions/${subscriptionID}/cancel`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ reason }),
    })

    return handleResponse(response)
  }

  async activateSubscription(subscriptionID: string) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/billing/subscriptions/${subscriptionID}/activate`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return handleResponse(response)
  }

  async captureSubscription(subscriptionID: string) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/billing/subscriptions/${subscriptionID}/capture`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return handleResponse(response)
  }

  async suspendSubscription(subscriptionID: string, reason: string) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/billing/subscriptions/${subscriptionID}/suspend`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ reason }),
    })

    return handleResponse(response)
  }

  async reviseSubscription(subscriptionID: string, data: any) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/billing/subscriptions/${subscriptionID}/revise`

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

  async listSubscriptionTransactions(
    subscriptionID: string,
    startTime: string,
    endTime: string,
  ) {
    const accessToken = await this.generateAccessToken()
    const url = `${this.baseUrl}/v1/billing/subscriptions/${subscriptionID}/transactions?start_time=${startTime}&end_time=${endTime}`

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

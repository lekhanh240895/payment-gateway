export interface BillingInfo {
  name: string
  phone_number: string
  address: string
  city: string
  postal_code?: string
}

export interface OrderData {
  subtotal: string
  tax: string
  discount: string
  total: string
  billing_info: BillingInfo
}

export interface OrderResponse {
  jsonResponse: any
  httpStatusCode: number
}

export interface SubscriptionData {
  plan_id: string
  start_time?: string
  quantity?: string
  shipping_amount?: {
    currency_code: string
    value: string
  }
  subscriber?: {
    name?: {
      given_name: string
      surname: string
    }
    email_address?: string
    shipping_address?: {
      name?: {
        full_name: string
      }
      address?: {
        address_line_1: string
        address_line_2?: string
        admin_area_2: string
        admin_area_1: string
        postal_code: string
        country_code: string
      }
    }
  }
  application_context?: {
    brand_name?: string
    locale?: string
    shipping_preference?: string
    user_action?: string
    payment_method?: {
      payer_selected?: string
      payee_preferred?: string
    }
    return_url?: string
    cancel_url?: string
  }
}

export interface PlanData {
  product_id: string
  name: string
  description: string
  status: string
  billing_cycles: Array<{
    frequency: {
      interval_unit: string
      interval_count: number
    }
    tenure_type: string
    sequence: number
    total_cycles: number
    pricing_scheme: {
      fixed_price: {
        value: string
        currency_code: string
      }
    }
  }>
  payment_preferences: {
    auto_bill_outstanding: boolean
    setup_fee: {
      value: string
      currency_code: string
    }
    setup_fee_failure_action: string
    payment_failure_threshold: number
  }
  taxes: {
    percentage: string
    inclusive: boolean
  }
}

export interface ProductData {
  name: string
  description: string
  type: string
  category: string
}

export interface CaptureData {
  note: string
  capture_type: string
  amount: { currency_code: string; value: string }
}
export interface PricingData {
  pricing_schemes: {
    billing_cycle_sequence: number
    pricing_scheme: {
      fixed_price: {
        value: string
        currency_code: string
      }
      pricing_model?: string
      tiers?: {
        starting_quantity: string
        ending_quantity?: string
        amount: {
          value: string
          currency_code: string
        }
      }[]
    }
  }[]
}

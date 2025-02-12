# Pay Connect Modules

This project provides a unified interface for integrating multiple payment
gateways, including PayPal, Stripe, and Momo. It is designed to simplify the
process of handling payments in your application.

## Features

- **PayPal Integration**: Easily manage payments with PayPal using the
  `PaypalGateway` class.
- **Stripe Integration**: Handle payments through Stripe with the
  `StripeGateway` class.
- **Momo Integration**: Integrate Momo payment services using the `MomoGateway`
  class.

## Installation

To install the payment gateway module, run the following command:

```
npm install pay-connect
```

## Usage

### Importing the Module

You can import the payment gateway module in your application as follows:

```typescript
import { PaypalGateway, StripeGateway, MomoGateway } from "pay-connect"
```

### PayPal Example

```typescript
const paypal = new PaypalGateway({
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
  environment: "sandbox", // or "production"
})

// Create an order
const {
  jsonResponse: { id: orderId },
} = await paypal.orders.createOrder({
  subtotal: "100.00",
  tax: "10.00",
  discount: "5.00",
  total: "105.00",
  billing_info: {
    name: "John Doe",
    phone_number: "123456789",
    address: "123 Main St",
    city: "Anytown",
    postal_code: "95131",
  },
})

// Capture an order
const captureResponse = await paypal.orders.captureOrder(orderId)

// Create a product
const {
  jsonResponse: { id: productId },
} = await paypal.products.createProduct({
  name: "Basic Product",
  description: "A basic product for subscription",
  type: "SERVICE",
  category: "SOFTWARE",
})

// Create a plan
const {
  jsonResponse: { id: planId },
} = await paypal.subscriptions.createPlan({
  product_id: productId,
  name: "Basic Plan",
  description: "Basic subscription plan",
  status: "ACTIVE",
  billing_cycles: [
    {
      frequency: {
        interval_unit: "MONTH",
        interval_count: 1,
      },
      tenure_type: "REGULAR",
      sequence: 1,
      total_cycles: 12,
      pricing_scheme: {
        fixed_price: {
          value: "10.00",
          currency_code: "USD",
        },
      },
    },
  ],
  payment_preferences: {
    auto_bill_outstanding: true,
    setup_fee: {
      value: "0.00",
      currency_code: "USD",
    },
    setup_fee_failure_action: "CONTINUE",
    payment_failure_threshold: 3,
  },
  taxes: {
    percentage: "10",
    inclusive: false,
  },
})

// Create a subscription
const subscriptionId = await paypal.subscriptions.createSubscription({
  plan_id: planId,
  subscriber: {
    name: {
      given_name: "John",
      surname: "Doe",
    },
    email_address: "john.doe@example.com",
  },
  application_context: {
    brand_name: "Your Brand",
    locale: "en-US",
    shipping_preference: "SET_PROVIDED_ADDRESS",
    user_action: "SUBSCRIBE_NOW",
    payment_method: {
      payer_selected: "PAYPAL",
      payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
    },
    return_url: "https://your-return-url.com",
    cancel_url: "https://your-cancel-url.com",
  },
})
```

### Stripe Example

```typescript
const stripe = new StripeGateway("your-api-key")
stripe.createCharge(/* charge details */)
```

### Momo Example

```typescript
const momo = new MomoGateway()
momo.startPayment(/* payment details */)
```

## PayPal Methods

### Initialization Options

When initializing the `PaypalGateway`, you can pass the following options:

| Option         | Type    | Description                                    |
| -------------- | ------- | ---------------------------------------------- |
| `clientId`     | string  | Your PayPal client ID                          |
| `clientSecret` | string  | Your PayPal client secret                      |
| `environment`  | string  | Environment to use (`sandbox` or `production`) |
| `currency`     | string  | Currency code (default: "USD")                 |
| `intent`       | string  | Payment intent (default: "CAPTURE")            |
| `vault`        | boolean | Vault option (default: false)                  |
| `buyerCountry` | string  | Buyer country code (default: "US")             |
| `locale`       | string  | Locale (default: "en_US")                      |

### Orders

- `createOrder(data: OrderData)`: Creates a new order.
- `captureOrder(orderID: string)`: Captures an existing order.

### Subscriptions

- `createSubscription(data: SubscriptionData)`: Creates a new subscription.
- `createPlan(data: PlanData)`: Creates a new subscription plan.
- `getSubscriptionDetails(subscriptionID: string)`: Retrieves details of an
  existing subscription.
- `cancelSubscription(subscriptionID: string, reason: string)`: Cancels an
  existing subscription.
- `activateSubscription(subscriptionID: string)`: Activates an existing
  subscription.
- `captureSubscription(subscriptionID: string)`: Captures an existing
  subscription.
- `suspendSubscription(subscriptionID: string, reason: string)`: Suspends an
  existing subscription.
- `reviseSubscription(subscriptionID: string, data: any)`: Revises an existing
  subscription.
- `listSubscriptionTransactions(subscriptionID: string, startTime: string, endTime: string)`:
  Lists transactions of an existing subscription.

### Plans

- `createPlan(data: PlanData)`: Creates a new subscription plan.
- `getPlanList()`: Retrieves a list of subscription plans.
- `getPlanDetails(planID: string)`: Retrieves details of a subscription plan.
- `updatePlan(planID: string, data: any)`: Updates an existing subscription
  plan.
- `updatePlanPricing(planID: string, data: PricingData)`: Updates the pricing of
  an existing subscription plan.

### Products

- `createProduct(data: ProductData)`: Creates a new product.
- `getProductList()`: Retrieves a list of products.
- `getProductDetails(productId: string)`: Retrieves details of a product.
- `updateProduct(productId: string, data: any)`: Updates an existing product.

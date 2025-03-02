# Pay Connect Modules

Are you tired of getting lost in the official documentation for multiple payment
gateways? This project provides a unified interface for integrating multiple
payment gateways, including PayPal, Stripe, Momo, and Google Pay. It is designed
to simplify the process of handling payments in your application.

## Features

- **PayPal Integration**: Easily manage payments with PayPal using the
  `PaypalGateway` class.
- **Stripe Integration**: Handle payments through Stripe with the
  `StripeGateway` class.
- **Momo Integration**: Integrate Momo payment services using the `MomoGateway`
  class.
- **Google Pay Integration**: Integrate Google Pay services using the
  `GooglePayGateway` class.

## Installation

To install the payment gateway module, run the following command:

```
npm install pay-connect
```

## Usage

### Importing the Module

You can import the payment gateway module in your application as follows:

```typescript
import { initializeGateways } from "pay-connect"
```

### Initializing Gateways

You can initialize multiple gateways using the initializeGateways function:

```typescript
const gatewayConfig = {
  paypal: {
    clientId: "your-client-id",
    clientSecret: "your-client-secret",
    environment: "sandbox", // or "production"
  },
  stripe: {
    apiKey: "your-stripe-secret-key",
    publishableKey: "your-stripe-publish-key",
    webhookConfig: {
      secret: "your-stripe-webhook-secret",
      customHandlers: {
        "customer.subscription.created": async (event) => {
          console.log("Subscription created:", event)
        },
        "customer.subscription.deleted": async (event) => {
          console.log("Subscription deleted:", event)
        },
      },
    },
  },
  googlepay: {
    environment: "TEST",
    paymentRequest: {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: ["MASTERCARD", "VISA"],
            billingAddressRequired: true,
          },
          tokenizationSpecification: {
            type: "PAYMENT_GATEWAY",
            parameters: {
              gateway: "example",
              gatewayMerchantId: "exampleGatewayMerchantId",
            },
          },
        },
      ],
      merchantInfo: {
        merchantId: "12345678901234567890",
        merchantName: "Demo Merchant",
      },
      transactionInfo: {
        totalPriceStatus: "FINAL",
        totalPriceLabel: "Total",
        totalPrice: "10.00",
        currencyCode: "USD",
        countryCode: "US",
      },
      callbackIntents: ["PAYMENT_AUTHORIZATION"],
    },
  },
  momo: {
    // Momo configuration
  },
}

const gateways = initializeGateways(
  ["paypal", "stripe", "googlepay", "momo"],
  gatewayConfig,
)
```

### PayPal Example

```typescript
const paypal = gateways.paypal

// Render checkout button
paypal.renderCheckoutButtons("paypal-button-checkout-container", {
  createOrder: createOrderHandler,
  onApprove: onApproveCheckoutHandler,
})
// Render subscription button
paypal.renderSubscriptionButtons("paypal-button-subscription-container", {
  createSubscription: async () => {
    if (createSubscriptionHandlerRef.current) {
      return await createSubscriptionHandlerRef.current()
    }
    throw new Error("createSubscriptionHandlerRef.current is not defined")
  },
  onApprove: async (data: { subscriptionID?: string | null | undefined }) => {
    if (!data.subscriptionID) {
      throw new Error("Subscription ID is undefined or null")
    }
    await onApproveSubscriptionHandler({
      subscriptionID: data.subscriptionID,
    })
  },
})
```

### Stripe Example

```typescript
const stripe = gateways.stripe

// Create a charge
stripe.charges.create({
  amount: 2000,
  currency: "usd",
  source: "tok_visa",
  description: "Charge for test@example.com",
})

// Create a subscription
const product = await stripe.products.create({
  name: "Product Name",
  description: "Product Description",
})

const customer = await stripe.customers.create({
  email: "customer@example.com",
  name: "Customer Name",
})

const price = await stripe.prices.create({
  unit_amount: 1000,
  currency: "usd",
  product: product.id,
  recurring: { interval: "month" },
})

const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  payment_method_types: ["card"],
  line_items: [
    {
      price: price.id,
      quantity: 1,
    },
  ],
  customer: customer.id,
  success_url: `http://example.com/?success=1`,
  cancel_url: `http://example.com/?canceled=1`,
})

const clientStripe = await stripe.loadStripeClient()
await clientStripe!.redirectToCheckout({
  sessionId: session.id,
})
```

### Momo Example

```typescript
const momo = new MomoGateway()
momo.startPayment(/* payment details */)
```

### Google Pay Example

```typescript
const googlePay = gateways.googlepay

// Render Google Pay button
googlePay.renderButton("google-pay-button-container")
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

## Google Pay Methods

### Initialization Options

When initializing the `GooglePayGateway`, you can pass the following options:

| Option                          | Type     | Description                                                     |
| ------------------------------- | -------- | --------------------------------------------------------------- |
| `environment`                   | string   | Environment to use (`TEST` or `PRODUCTION`)                     |
| `buttonType`                    | string   | Type of the Google Pay button (default: "buy")                  |
| `buttonColor`                   | string   | Color of the Google Pay button (default: "default")             |
| `buttonSizeMode`                | string   | Size mode of the Google Pay button (default: "static")          |
| `existingPaymentMethodRequired` | boolean  | Whether an existing payment method is required (default: false) |
| `paymentRequest`                | object   | Payment request configuration object                            |
| `onLoadPaymentData`             | function | Callback function when payment data is loaded                   |
| `onCancel`                      | function | Callback function when payment is canceled                      |
| `onError`                       | function | Callback function when an error occurs                          |
| `onClick`                       | function | Callback function when the button is clicked                    |
| `paymentDataCallbacks`          | object   | Callbacks for payment data changes and authorization            |
| `onReadyToPayChange`            | function | Callback function when the ready-to-pay state changes           |

## Stripe Methods

### Initialization Options

When initializing the `StripeGateway`, you can pass the following options:

| Option           | Type   | Description                                       |
| ---------------- | ------ | ------------------------------------------------- |
| `apiKey`         | string | Your Stripe secret key                            |
| `publishableKey` | string | Your Stripe publishable key                       |
| `apiVersion`     | string | Stripe API version (default: "2025-02-24.acacia") |
| `webhookConfig`  | object | Configuration for Stripe webhooks                 |

### Charges

- `create(data: ChargeData)`: Creates a new charge.
- `retrieve(chargeID: string)`: Retrieves an existing charge.
- `capture(chargeID: string)`: Captures an existing charge.
- `refund(chargeID: string, data: RefundData)`: Refunds an existing charge.

### Customers

- `create(data: CustomerData)`: Creates a new customer.
- `retrieve(customerID: string)`: Retrieves an existing customer.
- `update(customerID: string, data: CustomerData)`: Updates an existing
  customer.
- `delete(customerID: string)`: Deletes an existing customer.

### Subscriptions

- `create(data: SubscriptionData)`: Creates a new subscription.
- `retrieve(subscriptionID: string)`: Retrieves an existing subscription.
- `update(subscriptionID: string, data: SubscriptionData)`: Updates an existing
  subscription.
- `cancel(subscriptionID: string)`: Cancels an existing subscription.

### Products

- `create(data: ProductData)`: Creates a new product.
- `retrieve(productID: string)`: Retrieves an existing product.
- `update(productID: string, data: ProductData)`: Updates an existing product.
- `delete(productID: string)`: Deletes an existing product.

### Prices

- `create(data: PriceData)`: Creates a new price.
- `retrieve(priceID: string)`: Retrieves an existing price.
- `update(priceID: string, data: PriceData)`: Updates an existing price.

### Payment Methods

- `attach(customerID: string, paymentMethodID: string)`: Attaches a payment
  method to a customer.
- `detach(paymentMethodID: string)`: Detaches a payment method from a customer.

### Checkout Sessions

- `create(data: SessionData)`: Creates a new checkout session.
- `retrieve(sessionID: string)`: Retrieves an existing checkout session.

### Billing Portal Sessions

- `create(data: SessionData)`: Creates a new billing portal session.

### Plans

- `create(data: PlanData)`: Creates a new plan.
- `retrieve(planID: string)`: Retrieves an existing plan.
- `update(planID: string, data: PlanData)`: Updates an existing plan.

### Webhooks

- `handleWebhook(req: Request, res: Response)`: Handles incoming Stripe
  webhooks.

### Utility Methods

- `loadStripeClient(constructorOptions?: StripeConstructorOptions)`: Loads the
  Stripe client.

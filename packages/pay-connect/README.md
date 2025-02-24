# Pay Connect Modules

This project provides a unified interface for integrating multiple payment
gateways, including PayPal, Stripe, Momo, and Google Pay. It is designed to
simplify the process of handling payments in your application.

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
import {
  PaypalGateway,
  StripeGateway,
  MomoGateway,
  GooglePayGateway,
} from "pay-connect"
```

### PayPal Example

```typescript
const paypal = new PaypalGateway({
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
  environment: "sandbox", // or "production"
})

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
const stripe = new StripeGateway("your-api-key")
stripe.createCharge(/* charge details */)
```

### Momo Example

```typescript
const momo = new MomoGateway()
momo.startPayment(/* payment details */)
```

### Google Pay Example

```typescript
const googlePay = new GooglePayGateway({
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
      totalPrice: product.price,
      currencyCode: product.currency,
      countryCode: "US",
    },
    callbackIntents: [
      "PAYMENT_AUTHORIZATION",
      "SHIPPING_ADDRESS",
      "SHIPPING_OPTION",
    ],
    shippingAddressRequired: true,
    shippingAddressParameters: {
      phoneNumberRequired: true,
    },
    shippingOptionRequired: true,
  },
})

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

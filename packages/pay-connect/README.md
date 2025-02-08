# Payment Gateway Module

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
const paypal = new PaypalGateway()
paypal.initializePayment(/* payment details */)
```

### Stripe Example

```typescript
const stripe = new StripeGateway()
stripe.createCharge(/* charge details */)
```

### Momo Example

```typescript
const momo = new MomoGateway()
momo.startPayment(/* payment details */)
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an
issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more
details.

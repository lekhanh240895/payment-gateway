import { Stripe } from "./types"

export const createWebhookHandler = (
  stripe: Stripe,
  secret: string,
  customHandlers: {
    [key: string]: (event: Stripe.Event) => Promise<void>
  } = {},
) => {
  return async (body: string, sig: string) => {
    let event

    try {
      if (!secret) {
        throw new Error("Webhook secret is required")
      }
      event = stripe.webhooks.constructEvent(body, sig, secret)
    } catch (err: any) {
      console.error("Webhook signature verification failed.", err)
      throw new Error(`Webhook Error: ${err.message}`)
    }

    // Handle the event with custom handlers or default logging
    if (customHandlers[event.type]) {
      await customHandlers[event.type](event)
    } else {
      // Default event handling
      switch (event.type) {
        case "charge.succeeded": {
          const charge = event.data.object as Stripe.Charge
          console.log(`Charge succeeded: ${charge.id}`)
          break
        }
        case "charge.refunded": {
          const refund = event.data.object as Stripe.Charge
          console.log(`Charge refunded: ${refund.id}`)
          break
        }
        case "customer.subscription.created": {
          const subscription = event.data.object as Stripe.Subscription
          console.log(`Subscription created: ${subscription.id}`)
          break
        }
        case "customer.subscription.deleted": {
          const deletedSubscription = event.data.object as Stripe.Subscription
          console.log(`Subscription deleted: ${deletedSubscription.id}`)
          break
        }
        case "customer.created": {
          const customer = event.data.object as Stripe.Customer
          console.log(`Customer created: ${customer.id}`)
          break
        }
        case "price.created": {
          const price = event.data.object as Stripe.Price
          console.log(`Price created: ${price.id}`)
          break
        }
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }
    }

    return { received: true }
  }
}

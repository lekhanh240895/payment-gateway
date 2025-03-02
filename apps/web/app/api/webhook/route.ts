import {
  NEXT_PUBLIC_STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_WEBHOOK_ENDPOINT_SECRET,
} from "@/lib/constants/common"
import { initializeGateways, StripeGatewayOptions } from "pay-connect"

const stripeOptions: StripeGatewayOptions = {
  apiKey: NEXT_PUBLIC_STRIPE_SECRET_KEY!,
  webhookConfig: {
    secret: NEXT_PUBLIC_STRIPE_WEBHOOK_ENDPOINT_SECRET!,
    customHandlers: {
      "charge.succeeded": async (event) => {
        console.log("Charge succeeded:", event)
      },
      "charge.refunded": async (event) => {
        console.log("Charge refunded:", event)
      },
      "customer.subscription.created": async (event) => {
        console.log("Subscription created:", event)
      },
      "customer.subscription.deleted": async (event) => {
        console.log("Subscription deleted:", event)
      },
      "customer.created": async (event) => {
        console.log("Customer created:", event)
      },
      "price.created": async (event) => {
        console.log("Price created:", event)
      },
    },
  },
}

export async function POST(req: Request, res: Response) {
  console.log("webhookHandler")

  try {
    const { stripe } = initializeGateways(["stripe"], {
      stripe: stripeOptions,
    })

    const response = await stripe.handleWebhook(req, res)

    return new Response(JSON.stringify(response), { status: 200 })
  } catch (error) {
    console.error("Error in webhook handler:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    })
  }
}

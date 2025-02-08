import { MomoGateway } from "./gateways/momo";
import { PaypalGateway } from "./gateways/paypal";
import { StripeGateway } from "./gateways/stripe";

export const initializeGateways = () => {
  return {
    paypal: new PaypalGateway("your-client-id", "your-client-secret"),
    stripe: new StripeGateway("your-api-key"),
    momo: new MomoGateway(),
  };
};

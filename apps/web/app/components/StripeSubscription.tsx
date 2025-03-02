"use client"

import React, { useState, useEffect } from "react"
import { initializeGateways, StripeGatewayOptions } from "pay-connect"
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  Input,
  CommandGroup,
  CommandEmpty,
} from "@repo/ui/components"
import { Plus, Trash } from "@repo/ui/icons"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_STRIPE_SECRET_KEY,
} from "@/lib/constants/common"

const formSchema = z.object({
  customerId: z.string().min(1, { message: "Customer ID is required." }),
  priceId: z.string().min(1, { message: "Price ID is required." }),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  productName: z.string().optional(),
  productDescription: z.string().optional(),
})

const SubscriptionComponent = () => {
  interface Plan {
    id: string
    name: string
    price: number
    interval: string
    currency: string
    productId: string
  }

  interface Customer {
    id: string
    name: string
    email: string
  }

  interface Subscription {
    id: string
    customer: string
    plan: Plan
    status: string
  }

  const [plans, setPlans] = useState<Plan[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  )
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [searchPlan, setSearchPlan] = useState("")

  const stripeOptions: StripeGatewayOptions = {
    apiKey: NEXT_PUBLIC_STRIPE_SECRET_KEY!,
    publishableKey: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    apiVersion: "2022-11-15",
  }
  const { stripe } = initializeGateways(["stripe"], {
    stripe: stripeOptions,
  })

  useEffect(() => {
    const fetchPlans = async () => {
      const pricesResponse = await stripe.prices.list()
      if (pricesResponse.data) {
        const plans = await Promise.all(
          pricesResponse.data
            .filter((price) => price.recurring?.interval)
            .map(async (price) => {
              const productResponse = await stripe.products.retrieve(
                price.product as string,
              )
              const product = productResponse
              return {
                id: price.id,
                name: product.name,
                price: price.unit_amount ?? 0,
                interval: price.recurring?.interval ?? "",
                currency: price.currency,
                productId: product.id,
              }
            }),
        )
        setPlans(plans)
      }
    }

    const fetchCustomers = async () => {
      const customersResponse = await stripe.customers.list()
      if (customersResponse.data) {
        setCustomers(
          customersResponse.data.map((customer) => ({
            id: customer.id,
            name: customer.name ?? "",
            email: customer.email ?? "",
          })),
        )
      }
    }

    const fetchSubscriptions = async () => {
      const subscriptionsResponse = await stripe.subscriptions.list()
      if (subscriptionsResponse.data) {
        const subscriptions = await Promise.all(
          subscriptionsResponse.data.map(async (subscription) => {
            const planId = subscription.items.data[0]?.plan.id
            if (!planId) {
              throw new Error("Plan ID is undefined")
            }
            const plan = await stripe.plans.retrieve(planId)
            return {
              id: subscription.id,
              customer: subscription.customer as string,
              plan: {
                id: plan.id,
                name: plan.nickname ?? "",
                price: plan.amount ?? 0,
                interval: plan.interval,
                currency: plan.currency,
                productId: plan.product as string,
              },
              status: subscription.status,
            }
          }),
        )
        setSubscriptions(subscriptions)
      }
    }

    fetchPlans()
    fetchCustomers()
    fetchSubscriptions()
  }, [])

  const handleCreateSubscription = async (data: z.infer<typeof formSchema>) => {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      customer: data.customerId,
      success_url: `${window.location.origin}/stripe/?success=1`,
      cancel_url: `${window.location.origin}/stripe/?canceled=1`,
    })
    const clientStripe = await stripe.loadStripeClient()
    await clientStripe!.redirectToCheckout({
      sessionId: session.id,
    })
    setIsDialogOpen(false)
  }

  const handleAddCustomer = async (name: string, email: string) => {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      })

      await stripe.customers.createSource(customer.id, {
        source: "tok_visa",
      })

      const newCustomer: Customer = {
        id: customer.id,
        name: customer.name ?? "",
        email: customer.email ?? "",
      }
      setCustomers((prevCustomers) => [...prevCustomers, newCustomer])
      form.reset({
        customerName: "",
        customerEmail: "",
      })
      console.log("Customer added with default card:", customer)
    } catch (error) {
      console.error("Error adding customer with default card:", error)
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await stripe.customers.del(customerId)
      setCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer.id !== customerId),
      )
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null)
      }
      console.log("Customer deleted:", customerId)
    } catch (error) {
      console.error("Error deleting customer:", error)
    }
  }

  const handleAddProduct = async (name: string, description: string) => {
    try {
      const product = await stripe.products.create({
        name,
        description,
      })
      if (product.id) {
        const price = await stripe.prices.create({
          unit_amount: 1000,
          currency: "usd",
          product: product.id,
          recurring: { interval: "month" },
        })
        const newPlan: Plan = {
          id: price.id,
          name: product.name,
          price: price.unit_amount ?? 0,
          interval: price.recurring?.interval ?? "",
          currency: price.currency,
          productId: product.id,
        }
        setPlans((prevPlans) => [...prevPlans, newPlan])
        form.reset({
          productName: "",
          productDescription: "",
        })
        console.log("Product and price added:", product, price)
      } else {
        console.error("Product ID is undefined")
      }
    } catch (error) {
      console.error("Error adding product:", error)
    }
  }

  const handleGoToBillingPortal = async (customerId: string) => {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: window.location.origin,
      })
      window.location.href = session.url
    } catch (error) {
      console.error("Error redirecting to billing portal:", error)
    }
  }

  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(searchPlan.toLowerCase()),
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      priceId: "",
      customerName: "",
      customerEmail: "",
      productName: "",
      productDescription: "",
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Create a new subscription</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              Create Subscription
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create Subscription</DialogTitle>
            <DialogDescription>
              Select a customer and a plan to create a new subscription.
            </DialogDescription>
            <Form {...form}>
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Customer</FormLabel>
                    <FormControl>
                      <Command>
                        <CommandInput placeholder="Find or add a customer" />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup heading="Recent">
                            {customers.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                onSelect={() => {
                                  field.onChange(customer.id)
                                  setSelectedCustomer(customer)
                                }}
                              >
                                {customer.name || customer.email}
                                <Button
                                  variant="outline"
                                  size={"icon"}
                                  onClick={() =>
                                    handleDeleteCustomer(customer.id)
                                  }
                                >
                                  <Trash />
                                </Button>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandGroup forceMount={true}>
                            <CommandItem>
                              <Input
                                placeholder="Name"
                                {...form.register("customerName")}
                              />
                              <Input
                                placeholder="Email"
                                {...form.register("customerEmail")}
                              />
                              <Button
                                onClick={() =>
                                  handleAddCustomer(
                                    form.getValues("customerName") ?? "",
                                    form.getValues("customerEmail") ?? "",
                                  )
                                }
                                disabled={
                                  !form.getValues("customerName") ||
                                  !form.getValues("customerEmail")
                                }
                                size={"icon"}
                                variant={"outline"}
                                className="shrink-0"
                              >
                                <Plus />
                              </Button>
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedCustomer && (
                <div className="mt-4">
                  <p>
                    <strong>Selected Customer:</strong> {selectedCustomer.name}{" "}
                    ({selectedCustomer.email})
                  </p>
                </div>
              )}
              <FormField
                control={form.control}
                name="priceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Plan</FormLabel>
                    <FormControl>
                      <Command>
                        <CommandInput
                          onValueChange={setSearchPlan}
                          placeholder="Search plans..."
                        />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          {filteredPlans.map((plan) => (
                            <CommandGroup heading={plan.name} key={plan.id}>
                              <CommandItem
                                onSelect={() => {
                                  field.onChange(plan.id)
                                  setSelectedPlan(plan)
                                }}
                              >
                                {plan.name} - {plan.price} {plan.currency} /{" "}
                                {plan.interval}
                              </CommandItem>
                            </CommandGroup>
                          ))}
                          <CommandGroup>
                            <CommandItem>
                              <Input
                                placeholder="Product Name"
                                {...form.register("productName")}
                              />
                              <Input
                                placeholder="Product Description"
                                {...form.register("productDescription")}
                              />
                              <Button
                                onClick={() =>
                                  handleAddProduct(
                                    form.getValues("productName") ?? "",
                                    form.getValues("productDescription") ?? "",
                                  )
                                }
                                disabled={
                                  !form.getValues("productName") ||
                                  !form.getValues("productDescription")
                                }
                                size={"icon"}
                                variant={"outline"}
                                className="shrink-0"
                              >
                                <Plus />
                              </Button>
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedPlan && (
                <div className="mt-4">
                  <p>
                    <strong>Selected Plan:</strong> {selectedPlan.name} -{" "}
                    {selectedPlan.price / 100} {selectedPlan.currency} /{" "}
                    {selectedPlan.interval}
                  </p>
                </div>
              )}
              <Button
                disabled={
                  !form.getValues("customerId") || !form.getValues("priceId")
                }
                onClick={form.handleSubmit(handleCreateSubscription)}
              >
                Create Subscription
              </Button>
            </Form>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Subscriptions</h2>
          <ul className="space-y-4">
            {subscriptions.map((subscription) => (
              <li
                key={subscription.id}
                className="flex items-center justify-between rounded-lg border p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium">
                    <strong>Customer:</strong> {subscription.customer}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Plan:</strong> {subscription.plan.name} -{" "}
                    {(subscription.plan.price / 100).toFixed(2)}{" "}
                    {subscription.plan.currency.toUpperCase()} /{" "}
                    {subscription.plan.interval}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {subscription.status}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleGoToBillingPortal(subscription.customer)}
                >
                  Edit Subscription
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default SubscriptionComponent

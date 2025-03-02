"use client"

import React, { useState, useEffect } from "react"
import { initializeGateways, Stripe } from "pay-connect"
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
import { NEXT_PUBLIC_STRIPE_SECRET_KEY } from "@/lib/constants/common"

const formSchema = z.object({
  customerId: z.string().min(1, { message: "Customer ID is required." }),
  productId: z.string().min(1, { message: "Product ID is required." }),
  unitAmount: z.number().min(1, { message: "Amount must be greater than 0." }),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  productName: z.string().optional(),
  productDescription: z.string().optional(),
})

const CheckoutComponent = () => {
  interface Product {
    id: string
    name: string
    description: string
    price: number
    currency: string
  }

  interface Customer {
    id: string
    name: string
    email: string
  }

  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  )
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const stripeOptions = {
    apiKey: NEXT_PUBLIC_STRIPE_SECRET_KEY!,
  }
  const { stripe } = initializeGateways(["stripe"], {
    stripe: stripeOptions,
  })

  useEffect(() => {
    const fetchProducts = async () => {
      const pricesResponse = await stripe.prices.list()
      if (pricesResponse.data) {
        const products = await Promise.all(
          pricesResponse.data
            .filter((price) => !price.recurring)
            .map(async (price) => {
              const productResponse = await stripe.products.retrieve(
                price.product as string,
              )
              const product = productResponse
              return {
                id: product.id,
                name: product.name,
                description: product.description ?? "",
                price: price.unit_amount ?? 0,
                currency: price.currency,
              }
            }),
        )
        setProducts(products)
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

    fetchProducts()
    fetchCustomers()
  }, [])

  const handleCreateCheckoutSession = async (
    data: z.infer<typeof formSchema>,
  ) => {
    console.log("handleCreateCheckoutSession", data)
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: selectedProduct?.name ?? "",
            },
            unit_amount: data.unitAmount * 100,
          },
        },
      ],
      success_url: `${window.location.origin}/stripe/?success=1`,
      cancel_url: `${window.location.origin}/stripe/?canceled=1`,
      customer: selectedCustomer?.id,
    }

    const response = await stripe.checkout.sessions.create(params)
    if (response.url) {
      window.location.href = response.url
    }
    setIsDialogOpen(false)
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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      productId: "",
      unitAmount: 1,
      customerName: "",
      customerEmail: "",
      productName: "",
      productDescription: "",
    },
  })

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
        })
        setProducts((prevProducts) => [
          ...prevProducts,
          {
            id: product.id,
            name: product.name,
            description: product.description ?? "",
            price: price.unit_amount ?? 0,
            currency: price.currency,
          },
        ])
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
        <CardDescription>Create a new checkout session</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              Create Checkout Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create Checkout Session</DialogTitle>
            <DialogDescription>
              Enter the details to create a new checkout session.
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
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Product</FormLabel>
                    <FormControl>
                      <Command>
                        <CommandInput
                          onValueChange={setSearchTerm}
                          placeholder="Search products..."
                        />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          {filteredProducts.map((product) => (
                            <CommandGroup
                              key={product.id}
                              heading={product.name}
                            >
                              <CommandItem
                                key={product.id}
                                onSelect={() => {
                                  field.onChange(product.id)
                                  setSelectedProduct(product)
                                }}
                              >
                                {product.price / 100} {product.currency}
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
              {selectedProduct && (
                <div className="mt-4">
                  <p>
                    <strong>Selected Product:</strong> {selectedProduct.name} -{" "}
                    {selectedProduct.price / 100} {selectedProduct.currency}
                  </p>
                </div>
              )}
              <FormField
                control={form.control}
                name="unitAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Amount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Unit Amount"
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.unitAmount?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <Button
                disabled={
                  !form.getValues("customerId") || !form.getValues("productId")
                }
                onClick={form.handleSubmit(handleCreateCheckoutSession)}
              >
                Create Checkout Session
              </Button>
            </Form>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default CheckoutComponent

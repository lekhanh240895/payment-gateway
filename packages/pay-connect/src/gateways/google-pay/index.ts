import "@google-pay/button-element/dist/index"
import GooglePayButton from "@google-pay/button-element/dist/index"
import {
  GooglePayOptions,
  PaymentData,
  PaymentsError,
  IntermediatePaymentData,
  PaymentDataRequestUpdate,
  ReadyToPayChangeResponse,
  TransactionState,
  PaymentDataError,
  TransactionInfo,
  ShippingOptionParameters,
  CallbackIntent,
} from "./types"

export class GooglePayGateway {
  private options: GooglePayOptions

  constructor(options: GooglePayOptions) {
    const defaultOptions: GooglePayOptions = {
      environment: "TEST",
      buttonType: "buy",
      buttonColor: "default",
      buttonSizeMode: "static",
      existingPaymentMethodRequired: false,
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
          totalPrice: "100.00",
          currencyCode: "USD",
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
      onLoadPaymentData: this.handleLoadPaymentData,
      onCancel: this.handleCancel,
      onError: this.handleError,
      onClick: this.handleClick,
      paymentDataCallbacks: {
        onPaymentAuthorized: this.onPaymentAuthorized,
        onPaymentDataChanged: this.onPaymentDataChanged,
      },
      onReadyToPayChange: this.onReadyToPayChange,
    }

    this.options = { ...defaultOptions, ...options }
  }

  private handleLoadPaymentData = (paymentData: PaymentData) => {
    console.log("onLoadPaymentData", paymentData)
  }

  private handleCancel = (reason: PaymentsError) => {
    console.log("onCancel", reason)
  }

  private handleError = (reason: PaymentsError | Error) => {
    console.error("onError", reason)
  }

  private handleClick = (event: Event) => {
    console.log("onClick", event)
  }

  private onPaymentDataChanged = (
    intermediatePaymentData: IntermediatePaymentData,
  ): Promise<PaymentDataRequestUpdate> => {
    return new Promise((resolve) => {
      const { shippingAddress, shippingOptionData, callbackTrigger } =
        intermediatePaymentData
      const paymentDataRequestUpdate: PaymentDataRequestUpdate = {}

      if (callbackTrigger === "INITIALIZE") {
        paymentDataRequestUpdate.newShippingOptionParameters = {
          ...this.getGoogleDefaultShippingOptions(),
        }
      } else if (callbackTrigger === "SHIPPING_ADDRESS") {
        if (shippingAddress?.administrativeArea === "NJ") {
          paymentDataRequestUpdate.error =
            this.getGoogleUnserviceableAddressError()
        } else {
          const selectedShippingOptionId = shippingOptionData?.id ?? "standard"

          paymentDataRequestUpdate.newShippingOptionParameters = {
            ...this.getGoogleDefaultShippingOptions(),
            defaultSelectedOptionId: selectedShippingOptionId,
          }

          paymentDataRequestUpdate.newTransactionInfo =
            this.calculateNewTransactionInfo(selectedShippingOptionId)
        }
      } else if (callbackTrigger === "SHIPPING_OPTION") {
        paymentDataRequestUpdate.newTransactionInfo =
          this.calculateNewTransactionInfo(shippingOptionData?.id)
      }

      resolve(paymentDataRequestUpdate)
    })
  }

  private getGoogleUnserviceableAddressError(): PaymentDataError {
    return {
      reason: "SHIPPING_ADDRESS_UNSERVICEABLE",
      message: "Cannot ship to the selected address",
      intent: "SHIPPING_ADDRESS",
    }
  }

  private getGoogleDefaultShippingOptions(): ShippingOptionParameters {
    return {
      shippingOptions: [
        {
          id: "standard",
          label: "Standard shipping",
          description: "Arrives in 3-5 days",
        },
        {
          id: "express",
          label: "Express shipping",
          description: "Arrives in 1-2 days",
        },
      ],
      defaultSelectedOptionId: "standard",
    }
  }

  private calculateNewTransactionInfo(
    selectedShippingOptionId: string | undefined,
  ): TransactionInfo {
    let totalPrice = "100.00"
    if (selectedShippingOptionId === "express") {
      totalPrice = "110.00"
    }
    return {
      totalPriceStatus: "FINAL",
      totalPriceLabel: "Total",
      totalPrice: totalPrice,
      currencyCode: "USD",
      countryCode: "US",
    }
  }

  private onReadyToPayChange = (result: ReadyToPayChangeResponse) => {
    console.log("onReadyToPayChange", result)
  }

  private processPayment = (paymentData: PaymentData): Promise<void> => {
    return new Promise((resolve) => {
      const paymentToken = paymentData.paymentMethodData.tokenizationData.token
      console.log("onPaymentAuthorized", { paymentToken })

      setTimeout(() => {
        resolve()
      }, 1000)
    })
  }

  private onPaymentAuthorized = (
    paymentData: PaymentData,
  ): Promise<{
    transactionState: TransactionState
    error?: PaymentDataError
  }> => {
    return new Promise((resolve) => {
      this.processPayment(paymentData)
        .then(() => {
          resolve({
            transactionState: "SUCCESS",
          })
        })
        .catch(() => {
          resolve({
            transactionState: "ERROR",
            error: {
              intent: "PAYMENT_AUTHORIZATION",
              message: "Insufficient funds",
              reason: "PAYMENT_DATA_INVALID",
            },
          })
        })
    })
  }

  public renderButton(containerId: string): void {
    const button = document.createElement(
      "google-pay-button",
    ) as GooglePayButton
    button.environment = this.options.environment
    button.buttonType = this.options.buttonType
    button.buttonColor = this.options.buttonColor
    button.buttonLocale = this.options.buttonLocale || ""
    button.buttonSizeMode = this.options.buttonSizeMode
    button.buttonRadius = this.options.buttonRadius
    button.existingPaymentMethodRequired =
      this.options.existingPaymentMethodRequired || false
    button.paymentRequest = this.options.paymentRequest

    if (
      this.options.paymentDataCallbacks &&
      this.options.paymentRequest.callbackIntents
    ) {
      const { callbackIntents } = this.options.paymentRequest

      if (callbackIntents.includes("PAYMENT_AUTHORIZATION" as CallbackIntent)) {
        button.onPaymentAuthorized =
          this.options.paymentDataCallbacks.onPaymentAuthorized
      }

      if (
        ["SHIPPING_ADDRESS", "SHIPPING_OPTION"].some((intent) =>
          callbackIntents.includes(intent as CallbackIntent),
        )
      ) {
        button.onPaymentDataChanged =
          this.options.paymentDataCallbacks.onPaymentDataChanged
      }
    }

    if (this.options.onLoadPaymentData) {
      button.onLoadPaymentData = this.options.onLoadPaymentData
    }

    if (this.options.onCancel) {
      button.onCancel = this.options.onCancel
    }

    if (this.options.onClick) {
      button.onClick = this.options.onClick
    }

    if (this.options.onError) {
      button.onError = this.options.onError
    }

    if (this.options.onReadyToPayChange) {
      button.onReadyToPayChange = this.options.onReadyToPayChange
    }

    const container = document.getElementById(containerId)
    if (container) {
      container.innerHTML = ""
      container.appendChild(button)
    }
  }
}

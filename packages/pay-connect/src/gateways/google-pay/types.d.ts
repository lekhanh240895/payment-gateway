import GooglePayButton from "@google-pay/button-element/dist/index"

type Environment = GooglePayButton["environment"]
type ButtonType = GooglePayButton["buttonType"]
type ButtonColor = GooglePayButton["buttonColor"]
type ButtonSizeMode = GooglePayButton["buttonSizeMode"]
type ButtonLocale = GooglePayButton["buttonLocale"]
type ButtonRadius = GooglePayButton["buttonRadius"]
type ExistingPaymentMethodRequired =
  GooglePayButton["existingPaymentMethodRequired"]
type PaymentRequest = GooglePayButton["paymentRequest"]
type OnPaymentDataChanged = GooglePayButton["onPaymentDataChanged"]
type OnPaymentAuthorized = GooglePayButton["onPaymentAuthorized"]
type OnReadyToPayChange = GooglePayButton["onReadyToPayChange"]
type OnLoadPaymentData = GooglePayButton["onLoadPaymentData"]
type OnCancel = GooglePayButton["onCancel"]
type OnError = GooglePayButton["onError"]
type OnClick = GooglePayButton["onClick"]
export type PaymentData = google.payments.api.PaymentData
export type IntermediatePaymentData =
  google.payments.api.IntermediatePaymentData
export type TransactionInfo = google.payments.api.TransactionInfo
export type TransactionState = google.payments.api.TransactionState
export type PaymentDataRequest = google.payments.api.PaymentDataRequest
export type PaymentDataError = google.payments.api.PaymentDataError
export type IsReadyToPayResponse = google.payments.api.IsReadyToPayResponse
export type PaymentDataRequestUpdate =
  google.payments.api.PaymentDataRequestUpdate
export type ReadyToPayChangeResponse = {
  isButtonVisible: boolean
  isReadyToPay: boolean
  paymentMethodPresent?: boolean
}
export type PaymentsError = google.payments.api.PaymentsError
export type CallbackIntent = google.payments.api.CallbackIntent
export type ShippingOptionParameters =
  google.payments.api.ShippingOptionParameters
export type ShippingAddressParameters =
  google.payments.api.ShippingAddressParameters
export interface GooglePayOptions {
  environment: Environment
  paymentRequest: PaymentRequest
  buttonType?: ButtonType
  buttonColor?: ButtonColor
  buttonLocale?: ButtonLocale
  buttonSizeMode?: ButtonSizeMode
  buttonRadius?: ButtonRadius
  existingPaymentMethodRequired?: ExistingPaymentMethodRequired
  onCancel?: OnCancel
  onClick?: OnClick
  onError?: OnError
  onLoadPaymentData?: OnLoadPaymentData
  paymentDataCallbacks?: {
    onPaymentAuthorized?: OnPaymentAuthorized
    onPaymentDataChanged?: OnPaymentDataChanged
  }
  onReadyToPayChange?: OnReadyToPayChange
}

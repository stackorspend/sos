import { Galoy } from "../services/galoy"

export const payNoAmountLnInvoice = async (args) => {
  const galoy = await Galoy()
  if (galoy instanceof Error) return galoy

  return galoy.sendLnPaymentWithAmount(args)
}

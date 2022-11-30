import { Galoy } from "../services/galoy"

export const payWithAmountLnInvoice = async (args) => {
  const galoy = await Galoy()
  if (galoy instanceof Error) return galoy

  return galoy.sendLnPayment(args)
}

import {
  fetchTxns,
  syncLatestTxns,
  getStackCost,
  payNoAmountLnInvoice,
  payWithAmountLnInvoice,
  receiveLnNoAmount,
  receiveLnWithAmount,
} from "./src/app"

// API definition
export const StackorSpend = () => {
  return {
    syncTxns: syncLatestTxns,

    fetchTxns,
    getStackCost,
    // getCurrentPrice,
    // checkPlannedStackTxn,
    // checkPlannedSpendTxn,

    payNoAmountLnInvoice,
    payWithAmountLnInvoice,
    receiveLnNoAmount,
    receiveLnWithAmount,

    // payOnChainAddress,
    // receiveOnChain,
  }
}

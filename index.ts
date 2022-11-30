import {
  fetchTxns,
  syncLatestTxns,
  getStackCost,
  payNoAmountLnInvoice,
  payWithAmountLnInvoice,
  receiveLnNoAmount,
  receiveLnWithAmount,
  SYNC_PAGE_SIZE,
  IMPORT_PAGE_SIZE,
} from "./src/app"

import { getDb, TransactionsRepository } from "./src/services/sqlite"

// API definition
export const StackorSpend = () => {
  return {
    syncTxns: syncLatestTxns,

    fetchTxns,
    getStackCost,
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

// Demo API usage
const main = async () => {
  const sos = StackorSpend()
  const db = await getDb()

  console.log("Syncing transactions from Galoy...")
  const exists = await TransactionsRepository(db).checkRepositoryExists()
  if (exists instanceof Error) throw exists
  const synced = await sos.syncTxns({
    db,
    pageSize: exists ? SYNC_PAGE_SIZE : IMPORT_PAGE_SIZE,
    // rescanForMissing: true,
    // rebuild: true,
  })
  if (synced instanceof Error) throw synced
  console.log("Finished sync.")

  console.log("Fetching transactions from local db...")
  const pageOne = await sos.fetchTxns({ db, first: 3 })
  if (pageOne instanceof Error) throw pageOne
  const { cursor, txns } = pageOne
  console.log("Page 1 txns:", txns)
  console.log("Page 1 cursor:", cursor)
  const pageTwo = await sos.fetchTxns({ db, first: 2, after: cursor })
  console.log("Page 2:", pageTwo)

  const stackCost = await sos.getStackCost(db)
  console.log("Current (DCA'd) stack cost is:", stackCost)

  await db.close()

  // Test invoice generation
  const withAmountInvoice = await sos.receiveLnWithAmount({ amount: 1, memo: "" })
  console.log({ withAmountInvoice })

  const noAmountInvoice = await sos.receiveLnNoAmount({ memo: "" })
  console.log({ noAmountInvoice })
}

main()

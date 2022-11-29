import { fetchAllTxnsAscAndCalculate, syncLatestTxns, getStackCost } from "./src/app"

import { getDb, TransactionsRepository } from "./src/services/sqlite"

// API definition
export const StackorSpend = () => {
  return {
    // TODO: Write state to separate table on sync/resync (instead of calculating in SELECT)
    syncTxns: syncLatestTxns,

    // TODO: Add a paginated option here for loading for Txns view (requires calcs state table first)
    fetchTxns: fetchAllTxnsAscAndCalculate,
    getStackCost,
    // checkPlannedStackTxn,
    // checkPlannedSpendTxn,

    // payNoAmountLnInvoice,
    // payWithAmountLnInvoice,
    // receiveLnNoAmount,
    // receiveLnWithAmount,

    // payOnChainAddress,
    // receiveOnChain,
  }
}

// Demo API usage
const main = async () => {
  const IMPORT_PAGE_SIZE = 100
  const SYNC_PAGE_SIZE = 10

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
  const txns = await sos.fetchTxns(db)
  if (txns instanceof Error) throw txns
  console.log("Last 2 txns:", txns.slice(txns.length - 3, txns.length - 1))

  const stackCost = await sos.getStackCost(db)
  console.log("Current (DCA'd) stack cost is:", stackCost)

  await db.close()
}

main()

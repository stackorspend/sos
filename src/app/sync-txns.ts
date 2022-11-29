import {
  LocalBalanceDoesNotMatchSourceError,
  TableNotCreatedYetError,
} from "../domain/error"
import { Galoy } from "../services/galoy"

import { TransactionsRepository } from "../services/sqlite"

export const syncLatestTxns = async ({
  db,
  pageSize,
  rescanForMissing = false,
  rebuild = false,
}: {
  db: Db
  pageSize: number
  rescanForMissing?: boolean // continues scanning through all txns to find all missing txns
  rebuild?: boolean // drops table and does full rebuild
}) => {
  // TODO: Figure out how to fix mismatched/corrupted txns on rescanForMissing

  const txnsRepo = TransactionsRepository(db)

  if (rebuild) txnsRepo.deleteRepositoryForRebuild()

  const data: INPUT_TXN[] = []
  let transactions: Txn[]
  let lastCursor: string | false | null = null
  let hasNextPage: boolean = true
  let finish = false
  while ((rescanForMissing || !finish) && hasNextPage && lastCursor !== false) {
    // Fetch from source
    ;({ transactions, lastCursor, hasNextPage } = await Galoy().fetchTransactionsPage({
      first: pageSize,
      cursorFetchAfter: lastCursor,
    }))

    // Sort fetched
    const txnsDesc = transactions.sort((a: Txn, b: Txn) =>
      a.node.createdAt < b.node.createdAt
        ? 1
        : a.node.createdAt > b.node.createdAt
        ? -1
        : 0,
    )

    // Process for local format
    for (const tx of txnsDesc) {
      const {
        id,
        settlementAmount,
        settlementPrice: { base },
        createdAt: timestamp,
        status,
      } = tx.node

      const txInDb = await txnsRepo.fetchTxn(id)
      if (txInDb instanceof Error && !(txInDb instanceof TableNotCreatedYetError)) {
        throw txInDb
      }
      if (!(txInDb === undefined || txInDb instanceof Error)) {
        finish = true
        continue
      }
      console.log(`Writing new txn '${id}'...`)
      data.push({ id, timestamp, sats: settlementAmount, price: base / 10 ** 6, status })
    }
  }
  // Persist locally
  await TransactionsRepository(db).persistMany(data)

  // Check balance
  // Note, figure how to (default is rescanForMissing):
  //  - handle pending transactions that disappear later (e.g. RBF)
  //  - handle pending incoming onchain transactions that get replaced when confirmed
  const sumFromLocal = await TransactionsRepository(db).sumSatsAmount()
  const balanceFromSource = await Galoy().balance()
  if (sumFromLocal !== balanceFromSource) {
    return new LocalBalanceDoesNotMatchSourceError(
      JSON.stringify({ sumFromLocal, balanceFromSource }),
    )
  }

  // Calculate stack prices from last known point

  // 1. Create state table if not exists & check for last entry in table

  // 2. Start iterating through transactions table and populating state table

  // 3. Finish with some check (sats persisted as well maybe)

  return true
}

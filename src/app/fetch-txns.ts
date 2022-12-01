import { TransactionsRepository } from "../services/sqlite"

export const fetchTxns = async ({
  db,
  first,
  after,
}: {
  db: Db
  first?: number
  after?: string
}) => {
  const txns = await TransactionsRepository(db).fetchTxns({
    first,
    after,
  })
  if (txns instanceof Error) return txns

  return {
    cursor: txns && txns.length ? txns[txns.length - 1].source_tx_id : after,
    txns: txns.map(mapTxns),
  }
}

import { Galoy } from "../services/galoy"
import { TransactionsRepository } from "../services/sqlite"

import { IMPORT_PAGE_SIZE, syncLatestTxns, SYNC_PAGE_SIZE } from "./sync-txns"

export const payNoAmountLnInvoice = async ({
  db,
  ...args
}: {
  db: Db
  noAmountPaymentRequest: string
  amount: number
  memo: string
}) => {
  const galoy = await Galoy()
  if (galoy instanceof Error) return galoy

  const sendResult = await galoy.sendLnPaymentWithAmount(args)
  if (sendResult instanceof Error) return sendResult

  const exists = await TransactionsRepository(db).checkRepositoryExists()
  if (exists instanceof Error) throw exists
  const synced = await syncLatestTxns({
    db,
    pageSize: exists ? SYNC_PAGE_SIZE : IMPORT_PAGE_SIZE,
  })
  if (synced instanceof Error) return synced

  return sendResult
}
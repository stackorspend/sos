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

const mapTxns = (txn) => {
  const { sats_amount_with_fee: satsAmountWithFee } = txn
  const satsFee = satsAmountWithFee < 0 ? -txn.sats_fee : txn.sats_fee
  const satsAmount = satsAmountWithFee - satsFee

  return {
    timestamp: txn.timestamp,
    sourceId: txn.source_tx_id,
    source: txn.source_name,
    txStatus: txn.tx_status,
    satsAmountWithFee,
    satsAmount,
    satsFee,
    fiat: txn.fiat_amount,
    fiatUnit: txn.fiat_code,
    txPrice: txn.fiat_per_sat / 10 ** 4,
    stackAvgPrice: txn.stack_price_without_pl,
    gainLoss: txn.fiat_pl_percentage,
  }
}

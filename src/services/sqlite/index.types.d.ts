type INPUT_TXN = {
  id: string
  timestamp: number
  sats: number
  price: number
  status: string
}

type Txn = {
  cursor: string
  node: {
    id: string
    createdAt: number
    settlementAmount: number
    settlementPrice: {
      base: number
    }
    status: string
  }
}

type CalcRowRaw = {
  source_tx_id
  timestamp
  agg_sats
  avg_price_with_pl
  fiat_no_pl
  agg_fiat_with_pl
  fiat_pl
  pl_pct
  agg_fiat_no_pl
  avg_price_no_pl
}

type CalcRow = {
  source_tx_id
  timestamp
  aggregate_sats
  aggregate_display_currency_amount
  stack_price_with_pl_included
  display_currency_amount_less_pl
  display_currency_pl
  display_currency_pl_percentage
  aggregate_display_currency_amount_less_pl
  stack_price_without_pl
}

type Db = import("sqlite").Database

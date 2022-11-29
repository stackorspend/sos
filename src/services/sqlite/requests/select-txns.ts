const AGG_SATS_FRAG = `SUM(sats_amount) OVER(ORDER BY timestamp)`
const PRICE_PER_BTC_FRAG = `display_currency_per_sat / POWER(10, display_currency_offset - 8)`
const PRICE_FRAG = `display_currency_per_sat / POWER(10, display_currency_offset)`
const FIAT_TOTAL_FRAG = `sats_amount * ${PRICE_FRAG}`
const AGG_FIAT_WITH_PL_FRAG = `SUM(${FIAT_TOTAL_FRAG}) OVER(ORDER BY timestamp)`

const DISPLAY_AMOUNT = `printf("%.2f", display_currency_amount) AS amount`

export const BASE_TXNS_ASC_SELECT = `
  SELECT
    source_name,
    source_tx_id,
    display_currency_amount,

    timestamp,
    sats_amount,
    ${PRICE_PER_BTC_FRAG} as price,
    ${AGG_SATS_FRAG} as agg_sats,
    '' as _,

    ${FIAT_TOTAL_FRAG} as fiat_with_pl,
    ${AGG_FIAT_WITH_PL_FRAG} as agg_fiat_with_pl,
    CASE
      WHEN NOT sats_amount = 0 THEN ${AGG_FIAT_WITH_PL_FRAG} / ${AGG_SATS_FRAG} * POWER(10,8)
      ELSE null
    END as avg_price_with_pl,
    '' as __

    -- Columns no_pl go here
    -- '' as ___

  FROM transactions
`
export const handleRow = ({ acc, prev, row }: { acc; prev; row }) => {
  let { avg_price_no_pl, agg_fiat_no_pl } = acc
  let { prev_agg_sats, prev_avg_price } = prev

  const { sats_amount, price, agg_sats, fiat_with_pl } = row
  let fiat_no_pl
  if (sats_amount > 0) {
    // isBuy
    fiat_no_pl = (sats_amount / 10 ** 8) * price
    agg_fiat_no_pl += fiat_no_pl
    avg_price_no_pl = agg_fiat_no_pl / (agg_sats / 10 ** 8)

    prev_avg_price = avg_price_no_pl
  } else {
    // isSell
    fiat_no_pl = sats_amount * (agg_fiat_no_pl / prev_agg_sats)
    agg_fiat_no_pl += fiat_no_pl
    avg_price_no_pl = prev_avg_price

    prev_avg_price = prev_avg_price // No change to prev_avg_price
  }
  const fiat_pl = -(fiat_no_pl - fiat_with_pl)
  const pl_pct = (fiat_pl / fiat_no_pl) * 100

  prev_agg_sats = agg_sats

  const newRow = {
    ...row,
    fiat_no_pl: fiat_no_pl.toFixed(2),
    fiat_pl: fiat_pl.toFixed(2),
    pl_pct: `${pl_pct.toFixed(2)}%`,
    agg_fiat_no_pl: agg_fiat_no_pl.toFixed(2),
    avg_price_no_pl: avg_price_no_pl.toFixed(2),
  }

  return {
    acc: { avg_price_no_pl, agg_fiat_no_pl },
    prev: { prev_agg_sats, prev_avg_price },
    row: newRow,
  }
}

export const selectTxns = async (db) => {
  // @ts-ignore-next-line no-implicit-any error
  const { acc, rows } = await new Promise((resolve) => {
    let acc = { avg_price_no_pl: 0, agg_fiat_no_pl: 0 }
    let prev = { prev_agg_sats: 0, prev_avg_price: 0 }

    let newRow,
      newRows = []
    db.all(BASE_TXNS_ASC_SELECT, (err, rows) => {
      for (const row of rows) {
        ;({ acc, prev, row: newRow } = handleRow({ acc, prev, row }))
        // @ts-ignore-next-line no-implicit-any error
        newRows.push(newRow)
      }
      resolve({ acc, rows: newRows })
    })
  })

  return rows
}

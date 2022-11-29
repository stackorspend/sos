import fs from "fs"
import { TableNotCreatedYetError, UnknownRepositoryError } from "../../domain/error"

import { BASE_TXNS_ASC_SELECT, handleRow } from "./requests/select-txns"

const REQUESTS_DIR = "./src/services/sqlite/requests"

const CREATE_TABLE = fs.readFileSync(`${REQUESTS_DIR}/create-txns-table.sql`, "utf8")
const INSERT = fs.readFileSync(`${REQUESTS_DIR}/insert-txn.sql`, "utf8")

const TXNS_TABLE = "transactions"
const DROP_TXNS_TABLE = `DROP TABLE IF EXISTS ${TXNS_TABLE};`

export const TransactionsRepository = (db: Db) => {
  const checkRepositoryExists = async (): Promise<boolean | Error> => {
    try {
      const txn: Txn | undefined = await db.get(`SELECT * FROM ${TXNS_TABLE}`)
      return true
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        case message.includes("no such table"):
          return false
        default:
          return new UnknownRepositoryError(message)
      }
    }
  }

  const deleteRepositoryForRebuild = async (): Promise<true | Error> => {
    try {
      await db.exec(DROP_TXNS_TABLE)
      return true
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        default:
          return new UnknownRepositoryError(message)
      }
    }
  }

  const sumSatsAmount = async (): Promise<number | Error> => {
    const SUM_SATS_AMOUNT = `SELECT SUM(sats_amount) as sum FROM transactions;`
    try {
      const { sum } = await db.get(SUM_SATS_AMOUNT)
      return sum || 0
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        case message.includes("no such table"):
          return new TableNotCreatedYetError()
        default:
          return new UnknownRepositoryError((err as Error).message)
      }
    }
  }

  const fetchTxn = async (id: string): Promise<Txn | undefined | Error> => {
    try {
      const txn: Txn | undefined = await db.get(
        "SELECT * FROM transactions WHERE source_tx_id = ?",
        id,
      )
      return txn
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        case message.includes("no such table"):
          return new TableNotCreatedYetError()
        default:
          return new UnknownRepositoryError((err as Error).message)
      }
    }
  }

  const fetchAll = async () => {
    let acc = { avg_price_no_pl: 0, agg_fiat_no_pl: 0 }
    let prev = { prev_agg_sats: 0, prev_avg_price: 0 }

    let rows: INPUT_TXN[]
    try {
      rows = await db.all(BASE_TXNS_ASC_SELECT)
    } catch (err) {
      const { message } = err as Error
      switch (true) {
        case message.includes("no such table"):
          return new TableNotCreatedYetError()
        default:
          return new UnknownRepositoryError((err as Error).message)
      }
    }

    let newRow
    let newRows = []
    for (const row of rows) {
      ;({ acc, prev, row: newRow } = handleRow({ acc, prev, row }))
      // @ts-ignore-next-line no-implicit-any error
      newRows.push(newRow)
    }

    return newRows
  }

  const persistMany = async (data: INPUT_TXN[]) => {
    await db.run(CREATE_TABLE)

    console.log("Preparing persist statement...")
    const start = Date.now()

    const stmt = await db.prepare(INSERT)
    for (const i in data) {
      const txn = data[i]
      await stmt.run({
        [":sats_amount"]: txn.sats,
        [":timestamp"]: new Date(txn.timestamp * 1000).toISOString(),
        [":display_currency_per_sat"]: Math.round(txn.price * 10 ** 4),
        [":display_currency_offset"]: 12,
        [":display_currency_code"]: "USD",
        [":source_name"]: "galoy",
        [":source_tx_id"]: txn.id,
        // TODO: figure how to check & finalize pending txns
        [":tx_status"]: txn.status,
      })
    }

    await stmt.finalize()
    const elapsed = (Date.now() - Number(start)) / 1000
    console.log(`Persisted ${data.length} records in ${elapsed}s.`)
  }

  return {
    checkRepositoryExists,
    deleteRepositoryForRebuild,
    sumSatsAmount,
    fetchTxn,
    fetchAll,
    persistMany,
  }
}

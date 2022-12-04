import { StackorSpend } from ".."
import { IMPORT_PAGE_SIZE, SYNC_PAGE_SIZE } from "../src/app"

import { getDb, TransactionsRepository } from "../src/services/sqlite"

import util from "util"

const sqliteDb = async (): Promise<SqliteDb> => {
  const db = await getDb()

  const create = async (query: string): Promise<void> => {
    try {
      await db.run(query)
    } catch (err) {
      throw err
    }
  }

  const insert = async ({ query, row }: { query: string; row: any[] }): Promise<void> => {
    try {
      await db.run(query, ...row)
    } catch (err) {
      throw err
    }
  }

  const select = async ({
    query,
    args = [],
  }: {
    query: string
    args?: any[]
  }): Promise<any[]> => {
    try {
      const res = await db.all(query, ...args)
      return res
    } catch (err) {
      throw err
    }
  }

  return { create, insert, select, db }
}

// Demo API usage
const main = async () => {
  const { API_ENDPOINT, GALOY_JWT } = process.env
  if (!API_ENDPOINT) throw new Error(`Missing 'endpoint' env variable`)
  if (!GALOY_JWT) throw new Error(`Missing 'token' env variable`)

  const sos = StackorSpend({ galoy: { endpoint: API_ENDPOINT, token: GALOY_JWT } })

  const db = await sqliteDb()

  // ==========
  // Step 1: Sync transactions from Galoy source
  // ==========
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

  // ==========
  // Step 2: Retrieve synced transactions in pages
  // ==========
  const step2 = true
  if (step2) {
    console.log("Fetching transactions from local db...")
    const pageOne = await sos.fetchTxns({ db, first: 4 })
    if (pageOne instanceof Error) throw pageOne
    const { cursor, txns } = pageOne
    console.log("Page 1 txns:")
    console.log(util.inspect(txns, { depth: null, colors: true }))
    console.log("Page 1 cursor:", cursor)
    const pageTwo = await sos.fetchTxns({ db, first: 2, after: cursor })
    console.log("Page 2:")
    console.log(util.inspect(pageTwo, { depth: null, colors: true }))
  }

  // ==========
  // Step 3: Get figure for stack cost
  // ==========
  const step3 = true
  if (step3) {
    const stackCost = await sos.getStackCost(db)
    console.log("Current (DCA'd) stack cost is:", stackCost)
  }

  // ==========
  // Step 4: Test (testnet) invoice send
  // ==========
  const testSend = false
  if (testSend) {
    const withAmountPaymentRequest =
      "lntbs10n1p3cdm95pp5mptywj9900xh4st9fu3upwqha6nt63z6rj8em5xtfmzsu43yzspqsp5t97k2eyprw767p8knvfc3kutndpk3ctx0he37tegy99v64q79h6qdpq23jhxapqwa5hg6pdv9kk7atwwss9xm6ncqzynxqyz5vq9qxpq9qsq9ut0usyatsw0t8cptx9748qdx87w6v9jagtjt8plpahraynfx9w4uj5vjkzhhdclhgdstdn25drl6qutqvv8sxfpgkvs4ekyw4zmsrsqsxazhv"
    const withAmountSend = await sos.payWithAmountLnInvoice({
      db,
      withAmountPaymentRequest,
      memo: "",
    })
    console.log({ withAmountSend })

    const noAmountPaymentRequest =
      "lntbs1p3cdmyupp55r8wmr2qg08k2u7h3t8uq8mqjj0dza2hdmu5383dhgtxu43msd2ssp5r0lzh8cl42c339sax5rdzsf6rzu979ncd8e8cal9kc3l6mmn2mmsdqa23jhxapqdehj6ctdda6kuapq2dh4xcqzynxqyz5vq9qxpq9qsqfxy4sagc0sa4mv53zxxl6a9auld8hasf2gydc26emv7jcn4883tj7aynmh8jejj599vwlxaq9t5u6uy248dul0grtaua7s9p5dpqegcqfn7j8q"
    const noAmountSend = await sos.payNoAmountLnInvoice({
      db,
      noAmountPaymentRequest,
      amount: 1,
      memo: "",
    })
    console.log({ noAmountSend })
  }
  // ==========
  // Step 5: Test invoice generation
  // ==========
  const testInvoice = false
  if (testInvoice) {
    const withAmountInvoice = await sos.receiveLnWithAmount({ amount: 1, memo: "" })
    console.log({ withAmountInvoice })

    const noAmountInvoice = await sos.receiveLnNoAmount({ memo: "" })
    console.log({ noAmountInvoice })
  }

  await db.db.close()
}

main()

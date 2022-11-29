import { TransactionsRepository } from "../services/sqlite"

export const fetchAllTxnsAscAndCalculate = async (db: Db) =>
  TransactionsRepository(db).fetchAllTxnsAscAndCalculate()

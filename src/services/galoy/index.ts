import fs from "fs"
import axios from "axios"

const { API_ENDPOINT, GALOY_JWT } = process.env
if (!API_ENDPOINT) throw new Error(`Missing 'API_ENDPOINT' env variable`)

const defaultHeaders = {
  "Accept": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Authorization": `Bearer ${GALOY_JWT}`,
}
const galoyRequestsPath = "./src/services/galoy/requests"

const Transactions = fs.readFileSync(`${galoyRequestsPath}/transactions.gql`, "utf8")

export const Galoy = () => {
  const fetchTransactions = async (path?: string) => {
    console.log("Fetching galoy txns...")

    const allEdges = []
    let hasNextPage = true
    let after = null
    while (hasNextPage) {
      const query = {
        query: Transactions,
        variables: {
          first: 100,
          after,
        },
      }

      let data, errors
      if (path) {
        ;({ data, errors } = JSON.parse(fs.readFileSync(path, "utf8")))
        data.me.defaultAccount.wallets[0].transactions.pageInfo.hasNextPage = false
      } else {
        ;({
          data: { data, errors },
        } = await axios.post(API_ENDPOINT, query, {
          headers: defaultHeaders,
        }))
      }
      const { edges, pageInfo } = data.me.defaultAccount.wallets[0].transactions
      console.log("Page:", { pageInfo, edges: edges.length })
      // @ts-ignore-next-line no-implicit-any error
      allEdges.push(...edges)

      after = edges[edges.length - 1].cursor
      ;({ hasNextPage } = pageInfo)
    }

    console.log(`Fetched ${allEdges.length} galoy txns`)
    return allEdges
  }

  return {
    fetchTransactions,
  }
}

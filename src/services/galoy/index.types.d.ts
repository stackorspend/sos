type TRANSACTION_RESPONSE = {
  errors
  data: {
    me: {
      defaultAccount: {
        wallets: {
          transactions: { pageInfo: { hasNextPage: boolean }; edges: Txn[] }
        }[]
      }
    }
  }
}

type BALANCE_RESPONSE = {
  errors
  data: {
    me: {
      defaultAccount: {
        wallets: {
          id: string
          balance: number
          pendingIncomingBalance: number
        }[]
      }
      errors: {
        message: string
        code: string
      }
    }
  }
}

type LN_SEND_PAYMENT_RESPONSE = {
  errors
  data: {
    lnInvoicePaymentSend: {
      status: string
      errors: [
        {
          message: string
          code: string
        },
      ]
    }
  }
}

type LN_SEND_PAYMENT_WITH_AMOUNT_RESPONSE = {
  errors
  data: {
    lnNoAmountInvoicePaymentSend: {
      status: string
      errors: [
        {
          message: string
          code: string
        },
      ]
    }
  }
}

CREATE TABLE IF NOT EXISTS txn_calculations (
    source_name TEXT NOT NULL,
    source_tx_id TEXT NOT NULL UNIQUE,
    display_currency_amount REAL NOT NULL,
    timestamp TEXT NOT NULL,

    aggregate_sats INTEGER NOT NULL,
    aggregate_display_currency_amount REAL NOT NULL,
    stack_price_with_pl_included REAL NOT NULL,

    display_currency_amount_less_pl REAL NOT NULL,
    display_currency_pl REAL NOT NULL,
    display_currency_pl_percentage TEXT NOT NULL,
    aggregate_display_currency_amount_less_pl REAL NOT NULL,
    stack_price_without_pl REAL NOT NULL
)

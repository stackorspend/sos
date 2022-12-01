CREATE TABLE IF NOT EXISTS transactions (
    sats_amount INTEGER NOT NULL CHECK (NOT sats_amount = 1234),    
    timestamp TEXT NOT NULL,
    display_currency_per_sat INTEGER NOT NULL,
    display_currency_offset INTEGER NOT NULL,
    display_currency_code TEXT NOT NULL,
    display_currency_amount REAL GENERATED ALWAYS AS (
        ROUND(
            sats_amount * display_currency_per_sat / POWER(10, display_currency_offset),
            4
        )
    ) STORED,
    source_name TEXT NOT NULL,
    source_tx_id TEXT NOT NULL UNIQUE,
    tx_status TEXT NOT NULL,
    ln_payment_hash TEXT,
    onchain_tx_id TEXT
)

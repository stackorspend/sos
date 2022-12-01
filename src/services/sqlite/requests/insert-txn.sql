INSERT INTO transactions (
    sats_amount,
    timestamp,
    display_currency_per_sat,
    display_currency_offset,
    display_currency_code,
    source_name,
    source_tx_id,
    ln_payment_hash,
    onchain_tx_id,
    tx_status
) VALUES (
    :sats_amount,    
    :timestamp,
    :display_currency_per_sat,
    :display_currency_offset,
    :display_currency_code,
    :source_name,
    :source_tx_id,
    :ln_payment_hash,
    :onchain_tx_id,
    :tx_status
)

INSERT INTO txn_calculations (
    source_name,
    source_tx_id,
    display_currency_amount,
    timestamp,
    aggregate_sats,
    aggregate_display_currency_amount,
    stack_price_with_pl_included,
    display_currency_amount_less_pl,
    display_currency_pl,
    display_currency_pl_percentage,
    aggregate_display_currency_amount_less_pl,
    stack_price_without_pl
) VALUES (
    :source_name,
    :source_tx_id,
    :display_currency_amount,
    :timestamp,
    :aggregate_sats,
    :aggregate_display_currency_amount,
    :stack_price_with_pl_included,
    :display_currency_amount_less_pl,
    :display_currency_pl,
    :display_currency_pl_percentage,
    :aggregate_display_currency_amount_less_pl,
    :stack_price_without_pl
)

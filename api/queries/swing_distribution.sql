with  dedup_events as (
    SELECT
        DISTINCT ON(transaction_hash, log_index) *
    FROM wyrm_labels
    WHERE label='moonworm-alpha'
        AND (address='0xde191e8c352BA59F95cf19f0931cCbBcc7B60934' 
            OR address='0x9270df8d907A99E5024dc3532657a5cF9C7A4889'
            OR address='0xC90F37D09f2f8fB2e9D1Aa9a9d5142f5aE100d84')
        AND log_index IS NOT NULL
), SessionResolved as (
    SELECT
        address as contract_address,
        label_data->'args'->>'sessionID' as session_id,
        label_data->'args'->>'outcome' as outcome,
        label_data->'args'->>'batterAddress' as batter_address,
        label_data->'args'->>'batterTokenID' as batter_token_id,
        label_data->'args'->>'pitcherAddress' as pitcher_address,
        label_data->'args'->>'pitcherTokenID' as pitcher_token_id,
        log_index
    FROM dedup_events
    WHERE label_data->>'name'='SessionResolved'
), SwingRevealed as (
    SELECT
        address as contract_address,
        label_data->'args'->>'sessionID' as session_id,
        label_data->'args'->'swing'-> 1 as swing_type,
        label_data->'args'->'swing'-> 2 as swing_vertical,
        label_data->'args'->'swing'-> 3 as swing_horizontal,
        log_index
    FROM dedup_events
    WHERE label_data->>'name'='SwingRevealed'
), SwingDistribution as (
    SELECT
        batter_address || '_' || batter_token_id as address,
        swing_type,
        swing_vertical,
        swing_horizontal,
        count(*) as swing_count
    FROM SessionResolved LEFT JOIN SwingRevealed ON (SessionResolved.contract_address=SwingRevealed.contract_address AND SessionResolved.session_id = SwingRevealed.session_id)
    GROUP BY batter_address, batter_token_id, swing_type, swing_vertical, swing_horizontal
    ORDER BY swing_type, swing_vertical, swing_horizontal
)
SELECT
    address,
    json_agg(json_build_object(
        'swing_type', swing_type,
        'swing_vertical', swing_vertical,
        'swing_horizontal', swing_horizontal,
        'count', swing_count
    )) as swing_distribution
FROM SwingDistribution
GROUP BY address
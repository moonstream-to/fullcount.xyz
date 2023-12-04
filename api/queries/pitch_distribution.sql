with  dedup_events as (
    SELECT
        DISTINCT ON(transaction_hash, log_index) *
    FROM wyrm_labels
    WHERE label='moonworm-alpha'
        AND address='0x391FFCcea2BC1a615e2d4923fFd9373278707504'
        AND log_index IS NOT NULL
), SessionResolved as (
    SELECT
        label_data->'args'->>'sessionID' as session_id,
        label_data->'args'->>'outcome' as outcome,
        label_data->'args'->>'batterAddress' as batter_address,
        label_data->'args'->>'batterTokenID' as batter_token_id,
        label_data->'args'->>'pitcherAddress' as pitcher_address,
        label_data->'args'->>'pitcherTokenID' as pitcher_token_id,
        log_index
    FROM dedup_events
    WHERE label_data->>'name'='SessionResolved'
), PitchRevealed as (
    SELECT
        label_data->'args'->>'sessionID' as session_id,
        label_data->'args'->'pitch'-> 1 as pitch_speed,
        label_data->'args'->'pitch'-> 2 as pitch_vertical,
        label_data->'args'->'pitch'-> 3 as pitch_horizontal,
        log_index
    FROM dedup_events
    WHERE label_data->>'name'='PitchRevealed'
), PitchDistribution as (
    SELECT
        pitcher_address || '_' || pitcher_token_id as address,
        pitch_speed,
        pitch_vertical,
        pitch_horizontal,
        count(*) as pitch_count
    FROM SessionResolved LEFT JOIN PitchRevealed ON SessionResolved.session_id = PitchRevealed.session_id
    GROUP BY pitcher_address, pitcher_token_id, pitch_speed, pitch_vertical, pitch_horizontal
    ORDER BY pitch_speed, pitch_vertical, pitch_horizontal
)
SELECT
    address,
    json_agg(json_build_object(
        'pitch_speed', pitch_speed,
        'pitch_vertical', pitch_vertical,
        'pitch_horizontal', pitch_horizontal,
        'count', pitch_count
    )) as pitch_distribution
FROM PitchDistribution
GROUP BY address
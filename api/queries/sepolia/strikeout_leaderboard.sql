with  dedup_events as (
    SELECT
        DISTINCT ON(transaction_hash, log_index) *
    FROM arbitrum_sepolia_labels
    WHERE label='moonworm-alpha'
        AND address='0x7Be10D395617438b78500b003d5a1D201B150D6b'
        AND log_index IS NOT NULL
), AtBats as (
    SELECT
        label_data->'args'->>'sessionID' as session_id,
        label_data->'args'->>'outcome' as outcome,
        label_data->'args'->>'batterAddress' as batter_address,
        label_data->'args'->>'batterTokenID' as batter_token_id,
        label_data->'args'->>'pitcherAddress' as pitcher_address,
        label_data->'args'->>'pitcherTokenID' as pitcher_token_id,
        log_index
    FROM dedup_events
    WHERE label_data->>'name'='AtBatProgress' AND label_data->'args'->>'outcome'!='0'
), pitcher_stats as (
    SELECT
        SUM(CASE
            WHEN outcome = '1' THEN 1 ELSE 0 
        END) as strikeouts,
        SUM(CASE
            WHEN outcome = '2' THEN 1 ELSE 0 
        END) as walks,
        SUM(CASE
            WHEN outcome = '3' THEN 1 ELSE 0 
        END) as singles,
        SUM(CASE
            WHEN outcome = '4' THEN 1 ELSE 0 
        END) as doubles,
        SUM(CASE
            WHEN outcome = '5' THEN 1 ELSE 0 
        END) as triples,
        SUM(CASE
            WHEN outcome = '6' THEN 1 ELSE 0 
        END) as home_runs,
        SUM(CASE
            WHEN outcome = '7' THEN 1 ELSE 0 
        END) as in_play_outs,
        count(*) as total_pitcher_events,
        pitcher_address,
        pitcher_token_id
    FROM AtBats
    GROUP BY pitcher_address, pitcher_token_id
    ORDER BY strikeouts DESC
)
select 
    pitcher_address || '_' || pitcher_token_id as address,
    strikeouts as score,
    json_build_object(
        'strikeouts', strikeouts
    ) as points_data
from pitcher_stats
with  dedup_events as (
    SELECT
        DISTINCT ON(transaction_hash, log_index) *
    FROM arbitrum_nova_labels
    WHERE label='moonworm-alpha'
        AND address='0xDfE251B4F12547867ff839bcacec4d159DD68E47'
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
            WHEN outcome = '1' or outcome = '7' THEN 1 ELSE 0 
        END) as outs,
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
        count(*) as total_pitcher_events,
        pitcher_address,
        pitcher_token_id
    FROM AtBats
    GROUP BY pitcher_address, pitcher_token_id
    ORDER BY outs DESC
)
select 
    pitcher_address || '_' || pitcher_token_id as address,
    outs as score,
    json_build_object(
        'outs', outs
    ) as points_data
from pitcher_stats
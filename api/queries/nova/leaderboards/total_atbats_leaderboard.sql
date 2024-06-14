with  dedup_events as (
    SELECT
        DISTINCT ON(transaction_hash, log_index) *
    FROM arbitrum_nova_labels
    WHERE label='moonworm-alpha'
        AND address='0xDfE251B4F12547867ff839bcacec4d159DD68E47'
        AND log_index IS NOT NULL
), AtBats as (
    SELECT
        label_data->'args'->>'outcome' as outcome,
        label_data->'args'->>'batterAddress' as batter_address,
        label_data->'args'->>'batterTokenID' as batter_token_id,
        log_index
    FROM dedup_events
    WHERE label_data->>'name'='AtBatProgress' AND label_data->'args'->>'outcome'!='0'
), batter_stats as ( 
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
        count(*) as total_batter_events,
        batter_address as batter_address,
        batter_token_id as batter_token_id
    FROM AtBats
    GROUP BY batter_address, batter_token_id
), batter_data as (
    SELECT 
        batter_address || '_' || batter_token_id as address,
        total_batter_events - walks as at_bats
    FROM batter_stats
    ORDER BY at_bats DESC
)
select 
    address,
    at_bats as score,
    json_build_object(
        'at-bats', at_bats
    ) as points_data
from batter_data
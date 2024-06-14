WITH bot_atbat_results AS (
    SELECT
        label_data -> 'args' ->> 'atBatID' as atbat_id,
        label_data -> 'args' ->> 'batterAddress' as batter_address,
        label_data -> 'args' ->> 'batterTokenID' as batter_token_id,
        label_data -> 'args' ->> 'pitcherAddress' as pitcher_address,
        label_data -> 'args' ->> 'pitcherTokenID' as pitcher_token_id,
        label_data -> 'args' ->> 'outcome' as outcome
    FROM
        __labels_table__
    WHERE
        label_data->>'name' = 'AtBatProgress'
        AND address = :fullcount_address 
        AND label_data -> 'args' ->> 'pitcherAddress' = :bots_address
),
batter_wins AS (
    SELECT
        pitcher_token_id,
        COUNT(*) as wins
    FROM
        bot_atbat_results
    WHERE
        outcome = '6'
        AND batter_address = :batter_address
        AND batter_token_id = :batter_token_id
        AND pitcher_token_id IN :pitcher_token_ids
    GROUP BY
        pitcher_token_id
)
SELECT
    COALESCE(json_agg(json_build_object('token_id', pitcher_token_id, 'wins', wins)), json_build_array()) as wins_against_token_id
FROM
    batter_wins
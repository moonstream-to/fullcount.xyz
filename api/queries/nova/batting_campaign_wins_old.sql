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
    )
    SELECT
        COUNT(*) as wins
    FROM
        bot_atbat_results
    WHERE
        outcome = '6'
        AND bot_atbat_results.batter_address = :batter_address
        AND bot_atbat_results.batter_token_id = :batter_token_id
        AND bot_atbat_results.pitcher_token_id IN :pitcher_token_ids
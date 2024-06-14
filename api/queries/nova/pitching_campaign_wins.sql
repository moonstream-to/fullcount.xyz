WITH atbat_progress_events AS (
    SELECT
        label_data -> 'args' ->> 'atBatID' AS atbat_id,
        label_data -> 'args' ->> 'outcome' AS outcome,
        label_data -> 'args' ->> 'strikes' AS strikes,
        label_data -> 'args' ->> 'pitcherAddress' AS pitcher_address,
        label_data -> 'args' ->> 'pitcherTokenID' AS pitcher_id,
        label_data -> 'args' ->> 'batterAddress' AS batter_address,
        label_data -> 'args' ->> 'batterTokenID' AS batter_id
    FROM
        __labels_table__
    WHERE
        label = 'moonworm-alpha'
        AND address = :fullcount_address
        AND label_data ->> 'name' = 'AtBatProgress'
),
atbat_lengths AS (
    SELECT
        atbat_id,
        COUNT(*) AS atbat_length
    FROM
        atbat_progress_events
    GROUP BY
        atbat_id
),
strikeouts AS (
    SELECT
        atbat_id,
        pitcher_address,
        pitcher_id,
        batter_address,
        batter_id
    FROM
        atbat_progress_events
    WHERE
        outcome = '1'
),
pitcher_wins AS (
    SELECT
        strikeouts.atbat_id,
        strikeouts.pitcher_address,
        strikeouts.pitcher_id,
        strikeouts.batter_address,
        strikeouts.batter_id
    FROM
        strikeouts
        INNER JOIN atbat_lengths ON strikeouts.atbat_id = atbat_lengths.atbat_id
    WHERE
        atbat_lengths.atbat_length = 3
), pitcher_wins_by_id AS (
    SELECT
        batter_id,
        COUNT(*) AS wins
    FROM
        pitcher_wins
    WHERE
        batter_address = :bots_address
        AND batter_id IN :batter_token_ids
        AND pitcher_address = :pitcher_address
        and pitcher_id = :pitcher_token_id
    GROUP BY batter_id
)
SELECT
    COALESCE(json_agg(json_build_object('token_id', batter_id, 'wins', wins)), json_build_array()) as wins_against_token_id
FROM
    pitcher_wins_by_id

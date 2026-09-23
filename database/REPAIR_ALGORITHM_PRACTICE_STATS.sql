-- Rebuild aggregate algorithm stats from the individual solve history.
-- Run after applying ALGORITHM_TRAINER_SETUP.sql.

UPDATE algorithm_practice_stats AS stats
SET
  practice_count = aggregates.practice_count,
  total_time_ms = aggregates.total_time_ms,
  best_time_ms = aggregates.best_time_ms,
  avg_time_ms = aggregates.avg_time_ms,
  last_practiced = aggregates.last_practiced,
  updated_at = CURRENT_TIMESTAMP
FROM (
  SELECT
    user_id,
    algorithm_id,
    COUNT(*)::INTEGER AS practice_count,
    SUM(time_ms)::INTEGER AS total_time_ms,
    MIN(time_ms) AS best_time_ms,
    AVG(time_ms)::NUMERIC AS avg_time_ms,
    MAX(timestamp) AS last_practiced
  FROM algorithm_practice_sessions
  GROUP BY user_id, algorithm_id
) AS aggregates
WHERE stats.user_id = aggregates.user_id
  AND stats.algorithm_id = aggregates.algorithm_id;

DELETE FROM algorithm_practice_stats AS stats
WHERE NOT EXISTS (
  SELECT 1
  FROM algorithm_practice_sessions AS sessions
  WHERE sessions.user_id = stats.user_id
    AND sessions.algorithm_id = stats.algorithm_id
);

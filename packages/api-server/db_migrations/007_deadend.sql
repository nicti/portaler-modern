CREATE TABLE IF NOT EXISTS zone_dead_end (
  albion_id varchar(25) PRIMARY KEY,
  is_dead_end boolean DEFAULT false
);

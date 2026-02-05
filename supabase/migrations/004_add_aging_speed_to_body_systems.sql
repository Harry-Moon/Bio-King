-- Add aging_speed to body_systems for SystemAge Breakdown display
ALTER TABLE body_systems
ADD COLUMN aging_speed NUMERIC;

COMMENT ON COLUMN body_systems.aging_speed IS 'Aging speed ratio per system (e.g., 1.04x)';

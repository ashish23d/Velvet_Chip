-- Function to get distinct states efficiently
CREATE OR REPLACE FUNCTION get_unique_states()
RETURNS TABLE (state_name text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY SELECT DISTINCT state FROM master_locations ORDER BY state;
END;
$$;

-- Function to get distinct cities for a specific state
CREATE OR REPLACE FUNCTION get_cities_by_state(p_state text)
RETURNS TABLE (city_name text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY SELECT DISTINCT city FROM master_locations WHERE state = p_state ORDER BY city;
END;
$$;

-- Function to get pincodes for a specific city AND state (More Robust)
-- Returns a JSON object with count and array
CREATE OR REPLACE FUNCTION get_pincodes_by_city(
  p_state text,
  p_city text
)
RETURNS json
LANGUAGE sql
AS $$
  SELECT json_build_object(
    'state', p_state,
    'city', p_city,
    'total_pincodes', count(*),
    'pincodes', COALESCE(json_agg(pincode ORDER BY pincode), '[]'::json)
  )
  FROM master_locations
  WHERE state = p_state
  AND city = p_city;
$$;

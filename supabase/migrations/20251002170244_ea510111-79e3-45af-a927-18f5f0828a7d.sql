-- Fix security warnings by setting search_path for gamification functions

ALTER FUNCTION get_xp_required_for_level(integer) SET search_path = public;
ALTER FUNCTION get_level_from_xp(bigint) SET search_path = public;
ALTER FUNCTION award_points(uuid, integer, text, text, text, text, decimal) SET search_path = public;
ALTER FUNCTION reset_periodic_xp() SET search_path = public;
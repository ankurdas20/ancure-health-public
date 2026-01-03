CREATE OR REPLACE FUNCTION public.get_user_role() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT role FROM public.profiles WHERE user_id = auth.uid()),
      'user'
    )
  );
END;
$$;

-- Drop overly permissive policies on schemes
DROP POLICY IF EXISTS "Authenticated users can insert schemes" ON public.schemes;
DROP POLICY IF EXISTS "Authenticated users can update schemes" ON public.schemes;
DROP POLICY IF EXISTS "Authenticated users can delete schemes" ON public.schemes;

-- Only admins can manage schemes
CREATE POLICY "Admins can insert schemes"
  ON public.schemes FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update schemes"
  ON public.schemes FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete schemes"
  ON public.schemes FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

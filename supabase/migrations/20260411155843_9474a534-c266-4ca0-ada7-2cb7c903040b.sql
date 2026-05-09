
CREATE POLICY "Authenticated users can insert schemes" ON public.schemes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update schemes" ON public.schemes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete schemes" ON public.schemes FOR DELETE TO authenticated USING (true);

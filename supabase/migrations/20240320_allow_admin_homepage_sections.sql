CREATE POLICY "Admins can manage homepage sections" 
ON homepage_sections 
FOR ALL TO public 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

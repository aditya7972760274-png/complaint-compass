
-- Allow public/anonymous inserts for the complaint form (with fixed public user_id)
CREATE POLICY "Allow public complaint submissions"
ON public.complaints FOR INSERT
TO anon
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000');

-- Allow anon to call functions needed for public complaint form
CREATE POLICY "Allow public to view complaints for duplicate check"
ON public.complaints FOR SELECT
TO anon
USING (true);

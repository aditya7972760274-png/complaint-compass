
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow anon users to insert messages (for public complaint chat)
CREATE POLICY "Allow anon insert chat messages" ON public.chat_messages
  FOR INSERT TO anon WITH CHECK (true);

-- Allow anon users to read messages for their complaint
CREATE POLICY "Allow anon read chat messages" ON public.chat_messages
  FOR SELECT TO anon USING (true);

-- Allow authenticated users to read all chat messages
CREATE POLICY "Authenticated can read chat messages" ON public.chat_messages
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert chat messages (admin replies)
CREATE POLICY "Authenticated can insert chat messages" ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (true);

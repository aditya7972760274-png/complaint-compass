
-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  complaint_text TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  product_type TEXT NOT NULL DEFAULT 'General',
  channel TEXT NOT NULL DEFAULT 'Manual',
  location TEXT NOT NULL DEFAULT 'Unknown',
  category TEXT,
  sentiment TEXT,
  frustration_score INTEGER,
  priority_score INTEGER,
  escalation_risk NUMERIC(4,2),
  status TEXT NOT NULL DEFAULT 'new',
  cluster_id TEXT,
  duplicate_of UUID REFERENCES public.complaints(id),
  ai_response_draft TEXT,
  ai_root_cause TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all complaints (admin dashboard)
CREATE POLICY "Authenticated users can view all complaints"
  ON public.complaints FOR SELECT TO authenticated USING (true);

-- Authenticated users can insert complaints
CREATE POLICY "Authenticated users can insert complaints"
  ON public.complaints FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update complaints
CREATE POLICY "Authenticated users can update complaints"
  ON public.complaints FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX idx_complaints_category ON public.complaints(category);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_date ON public.complaints(date);
CREATE INDEX idx_complaints_priority ON public.complaints(priority_score DESC);

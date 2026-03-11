-- Notifications table for admin alerts
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  complaint_id uuid REFERENCES public.complaints(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (true);

-- Function to auto-create notification on high-priority complaint
CREATE OR REPLACE FUNCTION public.notify_on_high_priority()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.priority_score IS NOT NULL AND NEW.priority_score >= 70) THEN
    INSERT INTO public.notifications (title, message, type, complaint_id)
    VALUES (
      'High Priority Complaint',
      'A complaint with priority score ' || NEW.priority_score || ' has been submitted: ' || LEFT(NEW.complaint_text, 100),
      'warning',
      NEW.id
    );
  END IF;
  IF (NEW.escalation_risk IS NOT NULL AND NEW.escalation_risk > 0.7) THEN
    INSERT INTO public.notifications (title, message, type, complaint_id)
    VALUES (
      'Escalation Risk Alert',
      'A complaint with ' || ROUND(NEW.escalation_risk::numeric * 100) || '% escalation risk detected: ' || LEFT(NEW.complaint_text, 100),
      'critical',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_high_priority
  AFTER INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_high_priority();

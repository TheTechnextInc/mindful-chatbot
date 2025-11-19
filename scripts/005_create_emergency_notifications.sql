-- Create emergency notifications table
CREATE TABLE IF NOT EXISTS public.emergency_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emergency_email TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('emergency_alert', 'milestone', 'weekly_report', 'concern_alert')),
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on emergency notifications
ALTER TABLE public.emergency_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for emergency notifications
CREATE POLICY "emergency_notifications_select_own" ON public.emergency_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "emergency_notifications_insert_own" ON public.emergency_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_emergency_notifications_user_id ON public.emergency_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_notifications_sent_at ON public.emergency_notifications(sent_at);

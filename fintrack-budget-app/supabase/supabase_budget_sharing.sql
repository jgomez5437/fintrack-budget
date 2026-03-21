-- =========================================================================
-- BUDGET SHARING & ACCOUNT LINKING (MIGRATION SCRIPT)
-- Instructions: Copy and paste this entirely into the Supabase SQL Editor
-- and hit "RUN". It will automatically create the necessary tables and
-- securely enable data sharing between linked accounts!
-- =========================================================================

-- 1. Create the Account Links Table
CREATE TABLE IF NOT EXISTS public.account_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    primary_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    linked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(linked_user_id) -- A user can only be linked to one primary budget at a time
);

-- Enable RLS for Account Links
ALTER TABLE public.account_links ENABLE ROW LEVEL SECURITY;

-- primary user can read their own links
CREATE POLICY "Primary users can view their linked accounts" 
  ON public.account_links FOR SELECT 
  USING (auth.uid() = primary_user_id);

-- linked user can read their own link
CREATE POLICY "Linked users can view their own link" 
  ON public.account_links FOR SELECT 
  USING (auth.uid() = linked_user_id);

-- primary user can delete their linked accounts (revoke access)
CREATE POLICY "Primary users can manage their links" 
  ON public.account_links FOR DELETE 
  USING (auth.uid() = primary_user_id);
  
-- linked user can delete their own link (leave budget)
CREATE POLICY "Linked users can leave budget" 
  ON public.account_links FOR DELETE 
  USING (auth.uid() = linked_user_id);

-- Allow linked user to create the link initially (when redeeming a code)
CREATE POLICY "Users can create a link for themselves" 
  ON public.account_links FOR INSERT 
  WITH CHECK (auth.uid() = linked_user_id);


-- 2. Create the Budget Invites Table (For the 6-digit pairing codes)
CREATE TABLE IF NOT EXISTS public.budget_invites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    primary_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invite_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS for Budget Invites
ALTER TABLE public.budget_invites ENABLE ROW LEVEL SECURITY;

-- primary user can manage their invites
CREATE POLICY "Primary users can manage their invites" 
  ON public.budget_invites FOR ALL 
  USING (auth.uid() = primary_user_id);

-- Anyone who is authenticated can lookup an invite code to join
CREATE POLICY "Anyone can lookup an invite code" 
  ON public.budget_invites FOR SELECT 
  USING (auth.role() = 'authenticated');


-- 3. Modify RLS on `monthly_budgets` to allow linked users
-- This policy operates alongside your existing policy which checks (user_id = auth.uid())
-- It instructs Supabase: "If this row belongs to my primary_user_id, let me read/write it."
CREATE POLICY "Linked users can access primary budgets"
  ON public.monthly_budgets
  FOR ALL
  USING (
    user_id IN (
      SELECT primary_user_id 
      FROM public.account_links 
      WHERE linked_user_id = auth.uid()
    )
  );


-- 4. Modify RLS on `user_preferences` to allow linked users
CREATE POLICY "Linked users can access primary preferences"
  ON public.user_preferences
  FOR ALL
  USING (
    user_id IN (
      SELECT primary_user_id 
      FROM public.account_links 
      WHERE linked_user_id = auth.uid()
    )
  );

-- SUCCESS! The database is now fully capable of Multi-Account Budget Syncing!

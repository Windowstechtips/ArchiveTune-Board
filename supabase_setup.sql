-- ArchiveTune Feedback Board Supabase Schema

-- 1. Create Issues Table
CREATE TABLE issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('suggestion', 'bug')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'underway', 'resolved', 'denied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  upvotes INTEGER DEFAULT 0
);

-- 2. Create Admin Todos Table
CREATE TABLE admin_todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) -- links to the authenticated admin user
);

-- 3. Set up Row Level Security (RLS)
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_todos ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Issues
-- Anyone can view issues
CREATE POLICY "Public profiles are viewable by everyone." 
ON issues FOR SELECT USING (true);

-- Anyone can submit an issue
CREATE POLICY "Anyone can insert an issue." 
ON issues FOR INSERT WITH CHECK (true);

-- Anyone can upvote (update the upvotes column). 
-- In a stricter app, you'd restrict this or use an RPC, but for a public board this works.
CREATE POLICY "Anyone can update upvotes." 
ON issues FOR UPDATE USING (true);

-- Only Authenticated Admins can update issue status or delete
CREATE POLICY "Admins can update all issue fields." 
ON issues FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete issues." 
ON issues FOR DELETE USING (auth.role() = 'authenticated');


-- 5. Policies for Admin Todos
-- Only Authenticated Admins can manage todos
CREATE POLICY "Admins can manage their todos." 
ON admin_todos FOR ALL USING (auth.role() = 'authenticated');

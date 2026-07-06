-- ─────────────────────────────────────────────────────────
-- ArchiveTune Board — Votes Migration (run this in Supabase SQL editor)
-- ─────────────────────────────────────────────────────────

-- 1. Create the votes table
CREATE TABLE IF NOT EXISTS issue_votes (
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (issue_id, user_id)
);

-- 2. Enable RLS
ALTER TABLE issue_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read votes"
  ON issue_votes FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes"
  ON issue_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON issue_votes FOR DELETE USING (auth.uid() = user_id);

-- 3. Create triggers to automatically update the issues.upvotes count
CREATE OR REPLACE FUNCTION increment_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE issues SET upvotes = upvotes + 1 WHERE id = NEW.issue_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE issues SET upvotes = upvotes - 1 WHERE id = OLD.issue_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_increment_upvotes ON issue_votes;
CREATE TRIGGER tr_increment_upvotes
  AFTER INSERT ON issue_votes
  FOR EACH ROW EXECUTE FUNCTION increment_upvotes();

DROP TRIGGER IF EXISTS tr_decrement_upvotes ON issue_votes;
CREATE TRIGGER tr_decrement_upvotes
  AFTER DELETE ON issue_votes
  FOR EACH ROW EXECUTE FUNCTION decrement_upvotes();

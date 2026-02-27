-- 0016_case_discussions.sql
-- Add case discussion messages table for real-time chat on cases

CREATE TABLE IF NOT EXISTS case_discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    screening_id UUID NOT NULL REFERENCES screenings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by screening
CREATE INDEX IF NOT EXISTS idx_case_discussions_screening ON case_discussions(screening_id, created_at);

-- Index for user preferences (accordion defaults etc.)
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences_json JSONB DEFAULT '{}';

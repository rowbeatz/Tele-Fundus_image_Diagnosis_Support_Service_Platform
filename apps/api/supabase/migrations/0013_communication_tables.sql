-- Phase 9: Real-time Communication Hub Tables

-- 1. Communication Threads (Chat Rooms)
-- A thread is generally attached to a specific screening context, allowing triage across the 3 parties.
CREATE TABLE IF NOT EXISTS communication_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    screening_id UUID REFERENCES screenings(id) ON DELETE CASCADE,
    title VARCHAR(255),
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'resolved', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comm_threads_screening ON communication_threads(screening_id);

-- 2. Messages
-- Stores text, links to audio blobs (voice messages), or diagnostic viewer coordinates
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES communication_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    content_text TEXT, -- The main body of the chat
    
    -- Phase 9 specific attachments
    audio_file_url TEXT, -- S3 URL to a recorded voice message
    audio_transcription TEXT, -- Auto-transcribed text by AI
    
    -- Image pinning: e.g. { "imageId": "uuid", "coordinates": [...] }
    viewer_annotation_json JSONB,
    
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- 3. Thread Participants (Role-based presence)
-- Tracks who is involved in a thread (Client, Operator, Physician) and last read times
CREATE TABLE IF NOT EXISTS thread_participants (
    thread_id UUID NOT NULL REFERENCES communication_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (thread_id, user_id)
);

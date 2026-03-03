-- 0017_communication_integrity.sql
-- Enforce stronger case/thread integrity for screening-linked communications.

-- A communication thread must always belong to a screening.
ALTER TABLE communication_threads
    ALTER COLUMN screening_id SET NOT NULL;

-- One canonical thread per screening to avoid ambiguous thread linkage in UI/API.
CREATE UNIQUE INDEX IF NOT EXISTS uq_comm_threads_screening
    ON communication_threads(screening_id);

-- Message payload must include at least one meaningful content field.
ALTER TABLE messages
    ADD CONSTRAINT chk_messages_has_payload
    CHECK (
        COALESCE(NULLIF(BTRIM(content_text), ''), NULL) IS NOT NULL
        OR COALESCE(NULLIF(BTRIM(audio_file_url), ''), NULL) IS NOT NULL
        OR viewer_annotation_json IS NOT NULL
    );

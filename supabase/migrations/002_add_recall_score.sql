-- Add recall_score column to memories table
-- This column tracks how well the patient remembers a memory

ALTER TABLE memories ADD COLUMN IF NOT EXISTS recall_score int DEFAULT 0;

-- Add index for recall queries
CREATE INDEX IF NOT EXISTS idx_memories_recall_score ON memories(recall_score);

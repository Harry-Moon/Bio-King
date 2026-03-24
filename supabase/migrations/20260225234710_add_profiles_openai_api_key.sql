-- Migration: Add OpenAI API key to profiles for Coach feature
-- Users can store their own ChatGPT/OpenAI key to use the AI Coach
-- RLS ensures only the owner can read/update this column

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS openai_api_key TEXT;

COMMENT ON COLUMN public.profiles.openai_api_key IS 'OpenAI API key (user-provided) for Coach AI. Stored encrypted at rest. Only owner can read/update.';

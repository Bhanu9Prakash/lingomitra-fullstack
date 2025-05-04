-- Add email verification columns to users table if they don't exist
DO $$
BEGIN
    -- Check if email_verified column exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    
    -- Check if verification_token column exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'verification_token'
    ) THEN
        ALTER TABLE users ADD COLUMN verification_token TEXT;
    END IF;
    
    -- Check if verification_token_expiry column exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'verification_token_expiry'
    ) THEN
        ALTER TABLE users ADD COLUMN verification_token_expiry TIMESTAMP;
    END IF;
END
$$;
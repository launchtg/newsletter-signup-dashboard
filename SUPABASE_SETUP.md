# 🗄️ Supabase Setup for Newsletter Dashboard

## Quick Setup (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/eytpovjjhwprfedrdceu
2. Click **"SQL Editor"** in left sidebar
3. Click **"New query"**

### Step 2: Run This SQL

Copy and paste this into the SQL editor:

```sql
-- Newsletter Tracking Table
CREATE TABLE IF NOT EXISTS newsletters (
  id BIGSERIAL PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  name TEXT,
  platform TEXT,
  company TEXT,
  employees TEXT,
  country TEXT,
  status TEXT DEFAULT 'pending',
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  signed_up_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_url ON newsletters(url);
CREATE INDEX IF NOT EXISTS idx_newsletters_created_at ON newsletters(created_at);

-- Enable Row Level Security
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
CREATE POLICY "Service role has full access" ON newsletters
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### Step 3: Click "Run"

That's it! The table is now created.

---

## Test It

Run this query to verify:

```sql
SELECT COUNT(*) FROM newsletters;
```

Should return `0` (empty table ready for data).

---

## What This Does

Creates a table to store:
- **url** - Newsletter website URL
- **name** - Extracted newsletter name
- **platform** - beehiiv, substack, ghost, etc.
- **company** - Company name from Fiverr CSV
- **employees** - Employee count
- **country** - Country location
- **status** - pending, success, or failed
- **data** - All other CSV fields stored as JSON
- **created_at** - When added to database
- **updated_at** - Last modified
- **signed_up_at** - When signup succeeded

---

## After Setup

Your dashboard will:
1. Store all newsletter data in Supabase (persistent, accessible anywhere)
2. Track signup status in real-time
3. Sync across all devices
4. Never lose data (even if browser cache is cleared)

---

**Ready to use!** After running the SQL, refresh your dashboard and upload your CSV.

-- Supabase Database Schema for Flowbase Workspace
-- Put this file inside a supabase folder at the root

-- 1. STUDENT PROFILE Table (Extends Supabase Auth users)
CREATE TABLE public.student_profile (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for student_profile
ALTER TABLE public.student_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
    ON public.student_profile FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.student_profile FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.student_profile FOR INSERT 
    WITH CHECK (auth.uid() = id);


-- 2. STUDY GROUPS Table
CREATE TABLE public.study_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    members_count INT DEFAULT 1 NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    next_meeting TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for study groups
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own study groups" 
    ON public.study_groups FOR ALL 
    USING (auth.uid() = user_id);


-- 3. DOUBT BOARD Table
CREATE TABLE public.doubts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    question TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- pending, solved
    solution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for doubts
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own doubts" 
    ON public.doubts FOR ALL 
    USING (auth.uid() = user_id);


-- 4. RESOURCE LIBRARY Table
CREATE TABLE public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- book, article, lecture, other
    author TEXT NOT NULL,
    url TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for resources
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own resources" 
    ON public.resources FOR ALL 
    USING (auth.uid() = user_id);


-- 5. ASSIGNMENTS Table
CREATE TABLE public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    due_date DATE,
    status TEXT DEFAULT 'not_started' NOT NULL, -- not_started, in_progress, completed
    priority TEXT DEFAULT 'medium' NOT NULL, -- low, medium, high
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own assignments" 
    ON public.assignments FOR ALL 
    USING (auth.uid() = user_id);


-- 6. FLASHCARDS Table
CREATE TABLE public.flashcard_decks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    cards JSONB DEFAULT '[]'::JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for flashcards
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own flashcard decks" 
    ON public.flashcard_decks FOR ALL 
    USING (auth.uid() = user_id);


-- 7. GRADE TRACKER Table (Courses)
CREATE TABLE public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    credits INT NOT NULL,
    components JSONB DEFAULT '[]'::JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own courses" 
    ON public.courses FOR ALL 
    USING (auth.uid() = user_id);


-- 8. NOTES Table
CREATE TABLE public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    folder TEXT DEFAULT 'General',
    tags TEXT[] DEFAULT '{}'::TEXT[],
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own notes" 
    ON public.notes FOR ALL 
    USING (auth.uid() = user_id);


-- Realtime subscriptions triggers (Optional setup for live updates)
-- ALTER PUBLICATION supabase_realtime ADD TABLE study_groups, doubts, resources, assignments, notes;

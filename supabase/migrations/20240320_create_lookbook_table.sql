-- Create lookbook_images table
CREATE TABLE IF NOT EXISTS public.lookbook_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    link TEXT,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS
ALTER TABLE public.lookbook_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active images
CREATE POLICY "Public Read Access for Active Lookbook Images" 
    ON public.lookbook_images 
    FOR SELECT 
    USING (is_active = true);

-- Allow authenticated users (Admins) to manage all lookbook images
CREATE POLICY "Admins can manage lookbook images" 
    ON public.lookbook_images 
    FOR ALL 
    USING (auth.role() = 'authenticated');

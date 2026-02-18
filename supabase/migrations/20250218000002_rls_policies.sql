-- RLS: public read published articles and journalists; auth required for write

ALTER TABLE journalists ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Journalists: public read active only; authenticated read all + write
CREATE POLICY "Public read active journalists" ON journalists
  FOR SELECT USING (status = 'Active');
CREATE POLICY "Authenticated read all journalists" ON journalists
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write journalists" ON journalists
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update journalists" ON journalists
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete journalists" ON journalists
  FOR DELETE USING (auth.role() = 'authenticated');

-- Articles: public read published only; authenticated read all + write
CREATE POLICY "Public read published articles" ON articles
  FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated read all articles" ON articles
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert articles" ON articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update articles" ON articles
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete articles" ON articles
  FOR DELETE USING (auth.role() = 'authenticated');

-- Media: authenticated read/write; public can read (for displaying images by URL, storage is separate)
CREATE POLICY "Authenticated full access media" ON media
  FOR ALL USING (auth.role() = 'authenticated');

-- Contacts: anyone can insert; only authenticated can read (admin)
CREATE POLICY "Anyone can submit contact" ON contacts
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated read contacts" ON contacts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Site settings: public read; authenticated write
CREATE POLICY "Public read site_settings" ON site_settings
  FOR SELECT USING (true);
CREATE POLICY "Authenticated full access site_settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Profiles: users can read own; authenticated can update
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Authenticated insert update profile" ON profiles
  FOR ALL USING (auth.role() = 'authenticated');

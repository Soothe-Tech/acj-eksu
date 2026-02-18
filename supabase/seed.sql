-- ACJ EKSU CMS: Seed data
-- Run after migrations in Supabase SQL Editor (or: supabase db reset with this in seed.sql)

-- Journalists (use fixed UUIDs so articles can reference them)
INSERT INTO journalists (id, name, email, role, department, bio, avatar_url, status) VALUES
  ('a1b2c3d4-e5f6-4789-a012-111111111101'::uuid, 'Adebayo Oluwaseun', 'adebayo@acjeksu.org', 'Editor-in-Chief', 'Editorial', 'Leading the charge for truth and integrity in campus journalism.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', 'Active'),
  ('a1b2c3d4-e5f6-4789-a012-111111111102'::uuid, 'Chinedu Okafor', 'chinedu@acjeksu.org', 'Lead Correspondent', 'Politics', 'Covering student union politics and campus elections with precision.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', 'Active'),
  ('a1b2c3d4-e5f6-4789-a012-111111111103'::uuid, 'Ibrahim Musa', 'ibrahim@acjeksu.org', 'Sports Editor', 'Sports', 'Bringing you live updates from the SUG Cup and inter-faculty games.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400', 'Active'),
  ('a1b2c3d4-e5f6-4789-a012-111111111104'::uuid, 'Funke Akindele', 'funke@acjeksu.org', 'Investigative Reporter', 'News', 'Digging deep into campus infrastructure issues and administrative policies.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400', 'Active'),
  ('a1b2c3d4-e5f6-4789-a012-111111111105'::uuid, 'Zainab Aliyu', 'zainab@acjeksu.org', 'Lifestyle Columnist', 'Lifestyle', 'Exploring campus fashion, events, and student mental health.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', 'Active'),
  ('a1b2c3d4-e5f6-4789-a012-111111111106'::uuid, 'David Ojo', 'david@acjeksu.org', 'Lead Photographer', 'Visuals', 'Capturing the moments that define our campus history.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', 'Active')
ON CONFLICT (id) DO NOTHING;

-- Articles (published and one draft)
INSERT INTO articles (title, slug, excerpt, body, category, author_id, featured_image_url, status, published_at) VALUES
  (
    'Tuition Hike Protests: What Every Student Needs to Know',
    'tuition-hike-protests-what-every-student-needs-to-know',
    'Following the recent announcement by the management, student leaders have gathered to discuss the way forward.',
    '<p>Ekiti State University (EKSU) has always been a hub of academic excellence and vibrant student life. However, recent events have sparked a new wave of discussions across campus.</p><p>Student leaders have been meeting around the clock to address the concerns raised by the student body. We are committed to ensuring that every student''s voice is heard, stated the SUG President during a press briefing yesterday.</p><h3>The Core Issues at Hand</h3><p>Infrastructure remains a primary concern. Management has promised immediate remedial action.</p>',
    'Campus News',
    'a1b2c3d4-e5f6-4789-a012-111111111101'::uuid,
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
    'published',
    now() - interval '2 hours'
  ),
  (
    'Exclusive: A Sit-Down with the New Vice Chancellor',
    'exclusive-sit-down-with-the-new-vice-chancellor',
    'We sat down with Prof. Adebayo to discuss his vision for a digital-first campus and improved student welfare.',
    '<p>In an exclusive interview, the new Vice Chancellor outlined his priorities for the coming academic year.</p><p>Innovation is the key to our survival. We must adapt to the changing times to remain competitive globally.</p>',
    'Interview',
    'a1b2c3d4-e5f6-4789-a012-111111111101'::uuid,
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800',
    'published',
    now() - interval '1 day'
  ),
  (
    'Sports Complex Renovations Halted Indefinitely',
    'sports-complex-renovations-halted-indefinitely',
    'The highly anticipated upgrade to the main bowl has been paused due to budget constraints.',
    '<p>The university has announced that work on the sports complex will not resume until further notice.</p>',
    'Sports',
    'a1b2c3d4-e5f6-4789-a012-111111111103'::uuid,
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
    'published',
    now() - interval '2 days'
  ),
  (
    'SUG Elections: The Contenders and Their Manifestos',
    'sug-elections-the-contenders-and-their-manifestos',
    'As election week approaches, we breakdown the key promises from the top three presidential candidates.',
    '<p>Student union elections are around the corner. Here is where the leading candidates stand on key issues.</p>',
    'Politics',
    'a1b2c3d4-e5f6-4789-a012-111111111102'::uuid,
    'https://images.unsplash.com/photo-1541872703-74c5963631df?auto=format&fit=crop&q=80&w=800',
    'published',
    now() - interval '3 days'
  ),
  (
    'Faculty of Science Announces New Research Grants',
    'faculty-of-science-announces-new-research-grants',
    'Undergraduate researchers can now apply for funding up to ₦500,000 for innovative science projects.',
    '<p>The Faculty of Science has opened applications for its annual research grant scheme.</p>',
    'Academics',
    'a1b2c3d4-e5f6-4789-a012-111111111104'::uuid,
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
    'published',
    now() - interval '4 days'
  ),
  (
    'Tech Week Review: Is EKSU the Next Silicon Valley?',
    'tech-week-review-is-eksu-the-next-silicon-valley',
    'Showcasing the highlights from the just concluded Tech Week and the innovative apps built by students.',
    '<p>Tech Week drew record participation this year. We look at the projects that stood out.</p>',
    'Lifestyle',
    'a1b2c3d4-e5f6-4789-a012-111111111105'::uuid,
    'https://images.unsplash.com/photo-1504384308090-c54be385263d?auto=format&fit=crop&q=80&w=800',
    'published',
    now() - interval '5 days'
  ),
  (
    'New Cafeteria Price Hike Protest',
    'new-cafeteria-price-hike-protest',
    'Students have expressed concern over the latest increase in cafeteria prices.',
    '<p>Draft article – content to be finalised.</p>',
    'Politics',
    'a1b2c3d4-e5f6-4789-a012-111111111102'::uuid,
    NULL,
    'draft',
    NULL
  )
ON CONFLICT (slug) DO NOTHING;

-- Site settings (general)
INSERT INTO site_settings (key, value) VALUES (
  'general',
  '{"siteTitle":"ACJ EKSU","description":"The Fourth Arm of Government: Truth, Accountability, Excellence","supportEmail":"editor@acjeksu.org","phone":"+234 812 345 6789","officeAddress":"Student Union Building, Ekiti State University"}'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();


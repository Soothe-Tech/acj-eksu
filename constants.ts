export const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'News', href: '/news' },
    { label: 'About', href: '/about' },
    { label: 'Journalists', href: '/journalists' },
    { label: 'Contact', href: '/contact' },
    { label: 'Admin', href: '/admin' }, // Hidden in real app usually
  ];
  
  export const LATEST_UPDATES = [
    {
      id: 1,
      category: 'Campus News',
      title: 'Tuition Hike Protests: What Every Student Needs to Know',
      excerpt: 'Following the recent announcement by the management, student leaders have gathered to discuss the way forward.',
      author: 'Oluwaseun J.',
      time: '2 hrs ago',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
      labelColor: 'bg-primary text-white'
    },
    {
      id: 2,
      category: 'Interview',
      title: 'Exclusive: A Sit-Down with the New Vice Chancellor',
      excerpt: 'We sat down with Prof. Adebayo to discuss his vision for a digital-first campus and improved student welfare.',
      author: 'Kemi A.',
      time: '1 day ago',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800',
      labelColor: 'bg-purple-600 text-white'
    },
    {
      id: 3,
      category: 'Sports',
      title: 'Sports Complex Renovations Halted Indefinitely',
      excerpt: 'The highly anticipated upgrade to the main bowl has been paused due to budget constraints.',
      author: 'David T.',
      time: '2 days ago',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
      labelColor: 'bg-green-600 text-white'
    },
    {
      id: 4,
      category: 'Politics',
      title: 'SUG Elections: The Contenders and Their Manifestos',
      excerpt: 'As election week approaches, we breakdown the key promises from the top three presidential candidates.',
      author: 'Femi B.',
      time: '3 days ago',
      image: 'https://images.unsplash.com/photo-1541872703-74c5963631df?auto=format&fit=crop&q=80&w=800',
      labelColor: 'bg-yellow-600 text-white'
    },
    {
      id: 5,
      category: 'Academics',
      title: 'Faculty of Science Announces New Research Grants',
      excerpt: 'Undergraduate researchers can now apply for funding up to ₦500,000 for innovative science projects.',
      author: 'Ada A.',
      time: '4 days ago',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
      labelColor: 'bg-blue-500 text-white'
    },
    {
      id: 6,
      category: 'Lifestyle',
      title: 'Tech Week Review: Is EKSU the Next Silicon Valley?',
      excerpt: 'Showcasing the highlights from the just concluded Tech Week and the innovative apps built by students.',
      author: 'Tolu D.',
      time: '5 days ago',
      image: 'https://images.unsplash.com/photo-1504384308090-c54be385263d?auto=format&fit=crop&q=80&w=800',
      labelColor: 'bg-pink-600 text-white'
    }
  ];
  
  export const JOURNALISTS = [
    { name: 'Adebayo Oluwaseun', role: 'Editor-in-Chief', dept: 'Editorial', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', desc: 'Leading the charge for truth and integrity in campus journalism.' },
    { name: 'Chinedu Okafor', role: 'Lead Correspondent', dept: 'Politics', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', desc: 'Covering student union politics and campus elections with precision.' },
    { name: 'Ibrahim Musa', role: 'Sports Editor', dept: 'Sports', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400', desc: 'Bringing you live updates from the SUG Cup and inter-faculty games.' },
    { name: 'Funke Akindele', role: 'Investigative Reporter', dept: 'News', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400', desc: 'Digging deep into campus infrastructure issues and administrative policies.' },
    { name: 'Zainab Aliyu', role: 'Lifestyle Columnist', dept: 'Lifestyle', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', desc: 'Exploring campus fashion, events, and student mental health.' },
    { name: 'David Ojo', role: 'Lead Photographer', dept: 'Visuals', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', desc: 'Capturing the moments that define our campus history.' },
  ];
  
  export const RECENT_SUBMISSIONS = [
    { id: 1, title: 'New Cafeteria Price Hike Protest', category: 'Politics', author: 'John Doe', status: 'Pending Review', date: '2 hours ago', img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=200' },
    { id: 2, title: "VC's Annual Visit Summary", category: 'News', author: 'Jane Smith', status: 'Published', date: 'Yesterday', img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=200' },
    { id: 3, title: 'Sports Week: Fixtures Update', category: 'Sports', author: 'Mike Ross', status: 'Draft', date: '2 days ago', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=200' },
    { id: 4, title: 'Alumni Donation Report 2023', category: 'Finance', author: 'Sarah Adebayo', status: 'Pending Review', date: '3 days ago', img: 'https://images.unsplash.com/photo-1541872703-74c5963631df?auto=format&fit=crop&q=80&w=200' },
  ];
  
  export const ADMIN_STATS = [
    { label: 'Total Published Articles', value: '1,248', change: '+12%', icon: 'article', color: 'blue' },
    { label: 'Pending Reviews', value: '8', change: '3 high priority', icon: 'rate_review', color: 'yellow', alert: true },
    { label: 'Top Performing Story', value: 'SUG Election...', sub: '2.4k views', icon: 'star', color: 'purple' },
  ];
  
  export const JOURNALIST_MANAGEMENT = [
    { id: 1, name: 'Adeola Ogunleye', email: 'adeola.o@acj-eksu.edu.ng', role: 'Editor-in-Chief', dept: 'Mass Communication', articles: 42, status: 'Active', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100' },
    { id: 2, name: 'Tunde Bakare', email: 'tunde.b@acj-eksu.edu.ng', role: 'Editor', dept: 'English & Literary Studies', articles: 28, status: 'Active', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
    { id: 3, name: 'Chidinma Azikiwe', email: 'chidinma.a@acj-eksu.edu.ng', role: 'Contributor', dept: 'Political Science', articles: 5, status: 'On Leave', img: null },
    { id: 4, name: 'Yusuf Ibrahim', email: 'yusuf.i@acj-eksu.edu.ng', role: 'Contributor', dept: 'History & Int. Studies', articles: 11, status: 'Active', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' },
    { id: 5, name: 'Grace Okafor', email: 'grace.o@acj-eksu.edu.ng', role: 'Editor', dept: 'Law', articles: 19, status: 'Active', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100' },
  ];

  export const MOCK_MEDIA = [
    { id: 1, name: 'protest_IMG_2023.jpg', type: 'image/jpeg', size: '2.4 MB', date: 'Oct 24, 2023', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=200' },
    { id: 2, name: 'vc_interview.png', type: 'image/png', size: '1.8 MB', date: 'Oct 23, 2023', url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=200' },
    { id: 3, name: 'sports_complex_1.jpg', type: 'image/jpeg', size: '3.1 MB', date: 'Oct 21, 2023', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=200' },
    { id: 4, name: 'sug_manifesto_doc.pdf', type: 'application/pdf', size: '450 KB', date: 'Oct 20, 2023', url: 'https://images.unsplash.com/photo-1541872703-74c5963631df?auto=format&fit=crop&q=80&w=200' }, // using img as placeholder
    { id: 5, name: 'tech_week_banner.jpg', type: 'image/jpeg', size: '1.2 MB', date: 'Oct 18, 2023', url: 'https://images.unsplash.com/photo-1504384308090-c54be385263d?auto=format&fit=crop&q=80&w=200' },
    { id: 6, name: 'campus_life_04.jpg', type: 'image/jpeg', size: '2.2 MB', date: 'Oct 15, 2023', url: 'https://images.unsplash.com/photo-1524813686514-a5756c97759e?auto=format&fit=crop&q=80&w=200' },
  ];
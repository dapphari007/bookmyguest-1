import speaker1 from "@/assets/speakers/speaker-1.jpg";
import speaker2 from "@/assets/speakers/speaker-2.jpg";
import speaker3 from "@/assets/speakers/speaker-3.jpg";
import speaker4 from "@/assets/speakers/speaker-4.jpg";
import speaker5 from "@/assets/speakers/speaker-5.jpg";
import speaker6 from "@/assets/speakers/speaker-6.jpg";

export interface Speaker {
  id: string;
  name: string;
  title: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  image: string;
  isVerified?: boolean;
  isInstantBook?: boolean;
  tags?: string[];
  bio?: string;
  topics?: string[];
  experience?: string;
  events?: number;
  languages?: string[];
}

export const speakers: Speaker[] = [
  {
    id: "1",
    name: "Priya Sharma",
    title: "Motivational Speaker & Life Coach",
    category: "Motivational",
    location: "Mumbai, Maharashtra",
    rating: 4.9,
    reviewCount: 156,
    priceRange: "₹50,000 - ₹1,00,000",
    image: speaker1,
    isVerified: true,
    isInstantBook: true,
    tags: ["Leadership", "Women Empowerment", "Career Growth"],
    bio: "Priya Sharma is a renowned motivational speaker with over 15 years of experience inspiring audiences across India. Her powerful storytelling and actionable insights have transformed thousands of lives.",
    topics: ["Leadership Development", "Women in Leadership", "Career Transformation", "Work-Life Balance"],
    experience: "15+ years",
    events: 500,
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "2",
    name: "Rajesh Mehta",
    title: "Former CEO & Business Strategist",
    category: "Business",
    location: "Bangalore, Karnataka",
    rating: 4.8,
    reviewCount: 89,
    priceRange: "₹1,00,000+",
    image: speaker2,
    isVerified: true,
    tags: ["Entrepreneurship", "Strategy", "Leadership"],
    bio: "Rajesh Mehta is a former Fortune 500 CEO turned business consultant. He brings decades of experience in strategic planning and corporate leadership to every engagement.",
    topics: ["Business Strategy", "Entrepreneurship", "Corporate Leadership", "Digital Transformation"],
    experience: "25+ years",
    events: 300,
    languages: ["English", "Hindi"],
  },
  {
    id: "3",
    name: "Vikram Desai",
    title: "Stand-up Comedian & Host",
    category: "Comedy",
    location: "Delhi NCR",
    rating: 4.7,
    reviewCount: 234,
    priceRange: "₹25,000 - ₹50,000",
    image: speaker3,
    isVerified: true,
    isInstantBook: true,
    tags: ["Corporate Comedy", "Event Hosting", "Entertainment"],
    bio: "Vikram Desai is one of India's fastest-rising stand-up comedians. His clean humor and quick wit make him perfect for corporate events and college fests.",
    topics: ["Stand-up Comedy", "Event Hosting", "Corporate Entertainment"],
    experience: "8+ years",
    events: 450,
    languages: ["English", "Hindi"],
  },
  {
    id: "4",
    name: "Dr. Anjali Patel",
    title: "AI & Technology Expert",
    category: "Technology",
    location: "Hyderabad, Telangana",
    rating: 4.9,
    reviewCount: 67,
    priceRange: "₹75,000 - ₹1,50,000",
    image: speaker4,
    isVerified: true,
    tags: ["AI", "Innovation", "Future Tech"],
    bio: "Dr. Anjali Patel is a leading AI researcher and technology evangelist. She simplifies complex tech concepts for diverse audiences, from students to C-suite executives.",
    topics: ["Artificial Intelligence", "Machine Learning", "Future of Work", "Tech Innovation"],
    experience: "12+ years",
    events: 180,
    languages: ["English", "Hindi", "Telugu"],
  },
  {
    id: "5",
    name: "Prof. Suresh Kumar",
    title: "Educator & Academic Speaker",
    category: "Education",
    location: "Chennai, Tamil Nadu",
    rating: 4.8,
    reviewCount: 112,
    priceRange: "₹30,000 - ₹60,000",
    image: speaker5,
    isVerified: true,
    isInstantBook: true,
    tags: ["Education", "Career Guidance", "Youth"],
    bio: "Prof. Suresh Kumar has 20+ years in academia and is passionate about inspiring the next generation. He specializes in career guidance and student motivation.",
    topics: ["Career Guidance", "Student Motivation", "Higher Education", "Skill Development"],
    experience: "20+ years",
    events: 350,
    languages: ["English", "Hindi", "Tamil"],
  },
  {
    id: "6",
    name: "Meera Krishnan",
    title: "Wellness Coach & Mindfulness Expert",
    category: "Motivational",
    location: "Pune, Maharashtra",
    rating: 4.9,
    reviewCount: 98,
    priceRange: "₹40,000 - ₹80,000",
    image: speaker6,
    isVerified: true,
    tags: ["Wellness", "Mindfulness", "Stress Management"],
    bio: "Meera Krishnan combines ancient wisdom with modern science to help professionals achieve peak performance and inner peace. Her workshops are transformative experiences.",
    topics: ["Mindfulness", "Stress Management", "Work-Life Balance", "Mental Wellness"],
    experience: "10+ years",
    events: 220,
    languages: ["English", "Hindi", "Malayalam"],
  },
];

export const getSpeakerById = (id: string): Speaker | undefined => {
  return speakers.find((speaker) => speaker.id === id);
};

export const getSpeakersByCategory = (category: string): Speaker[] => {
  if (!category || category === "all") return speakers;
  return speakers.filter(
    (speaker) => speaker.category.toLowerCase() === category.toLowerCase()
  );
};

export type EventStatus =
  | 'Upcoming'
  | 'Registration Open'
  | 'Registration Closed'
  | 'Ongoing'
  | 'Completed'
  | 'Cancelled';

export type EventCategory =
  | 'Workshop'
  | 'Hackathon'
  | 'Seminar'
  | 'Coding Contest'
  | 'AI Bootcamp'
  | 'Orientation'
  | 'Tech Talk'
  | 'Technical Talk'
  | 'Project Expo'
  | 'Guest Lecture';

export interface EventWinner {
  position: string;
  name: string;
  team_name?: string;
  project_title?: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  event_image: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  category: EventCategory;
  speaker?: string;
  speaker_bio?: string;
  speaker_avatar?: string;
  registration_url?: string;
  registration_deadline?: string;
  maximum_participants: number;
  current_participants: number;
  status: EventStatus;
  featured: boolean;
  highlights?: string[];
  photos?: string[];
  results?: string;
  winners?: EventWinner[];
  certificates_available?: boolean;
  created_at: string;
  updated_at: string;
}

export type AnnouncementCategory =
  | 'All'
  | 'Events'
  | 'Event'
  | 'Club News'
  | 'Achievements'
  | 'Recruitment'
  | 'Workshops'
  | 'Workshop'
  | 'Hackathon'
  | 'Opportunity'
  | 'General'
  | 'Important';

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  featured_image?: string;
  category: AnnouncementCategory;
  author: string;
  author_role: string;
  published_at: string;
  featured: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus = 'New' | 'Reviewed' | 'Accepted' | 'Rejected';

export interface JoinApplication {
  id: string;
  full_name: string;
  college_email?: string;
  email?: string;
  phone: string;
  department: string;
  year: string;
  roll_number: string;
  technical_interests?: string[];
  interested_domains?: string[];
  skills?: string;
  why_join?: string;
  reason?: string;
  github_url?: string;
  linkedin_url?: string;
  agreed_updates?: boolean;
  status: 'New' | 'Reviewed' | 'Accepted' | 'Rejected' | 'Pending' | 'Shortlisted';
  reviewer_notes?: string;
  created_at: string;
}

export type Application = JoinApplication;

export interface EventRegistration {
  id: string;
  event_id: string;
  event_title?: string;
  full_name: string;
  participant_name?: string;
  email: string;
  phone?: string;
  department: string;
  year: string;
  roll_number: string;
  status: 'Confirmed' | 'Waitlisted' | 'Cancelled';
  registered_at?: string;
  created_at: string;
}

export type Registration = EventRegistration;

export type TeamCategory = 
  | 'Faculty Coordinator' 
  | 'Club Lead' 
  | 'Vice Lead' 
  | 'Technical Team' 
  | 'Design Team' 
  | 'Management Team' 
  | 'Media Team' 
  | 'Event Team';

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  category: TeamCategory;
  bio: string;
  photo_url: string;
  linkedin?: string;
  github?: string;
  email?: string;
  featured: boolean;
  order: number;
}

export type ProjectCategory =
  | 'AI'
  | 'Machine Learning'
  | 'Web Development'
  | 'App Development'
  | 'Robotics'
  | 'Research'
  | 'Computer Vision'
  | 'NLP & LLMs'
  | 'Generative AI'
  | 'Autonomous Systems'
  | 'Healthcare AI'
  | 'Full-Stack AI'
  | 'Other';

export interface Project {
  id: string;
  name: string;
  slug?: string;
  description: string;
  short_description?: string;
  category: ProjectCategory | string;
  tech_stack?: string[];
  technologies?: string[];
  team_members?: string[];
  github_url?: string;
  demo_url?: string;
  image_url: string;
  featured: boolean;
  status: 'Completed' | 'In Progress' | 'Prototype' | 'Active Development' | 'Production' | string;
  date?: string;
}

export interface Achievement {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  award_rank?: string;
  organization: string;
  members: string[];
  image_url?: string;
  featured: boolean;
  proof_link?: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  album: string;
  event_name?: string;
  image_url: string;
  caption?: string;
  date: string;
  featured: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  responded?: boolean;
  is_responded?: boolean;
  created_at: string;
}

export interface SiteStats {
  students_reached?: string | number;
  students_impacted?: string | number;
  events_conducted?: string | number;
  projects_completed?: string | number;
  workshops_held?: string | number;
  active_members?: string | number;
  hackathon_wins?: string | number;
  awards_won?: string | number;
  [key: string]: any;
}

export interface SiteSettings {
  club_name: string;
  club_sub_name?: string;
  club_tagline?: string;
  department_name: string;
  college_name: string;
  tagline?: string;
  supporting_text?: string;
  official_email?: string;
  contact_email?: string;
  phone?: string;
  contact_phone?: string;
  campus_address?: string;
  contact_address?: string;
  instagram_url?: string;
  linkedin_url?: string;
  github_url?: string;
  social_links?: {
    github?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    discord?: string;
    [key: string]: any;
  };
  announcement_ticker?: string;
  is_recruitment_open: boolean;
  [key: string]: any;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'editor';
}

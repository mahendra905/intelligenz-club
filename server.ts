import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_SETTINGS,
  INITIAL_STATS,
  INITIAL_EVENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_TEAM,
  INITIAL_PROJECTS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_GALLERY,
} from './src/data/initialData';
import {
  Event,
  Announcement,
  TeamMember,
  Project,
  Achievement,
  GalleryImage,
  JoinApplication,
  EventRegistration,
  ContactMessage,
  SiteStats,
  SiteSettings,
} from './src/types';

export interface AdminUserRecord {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  salt: string;
  role: 'admin';
  created_at: string;
  updated_at: string;
}

interface DatabaseSchema {
  settings: SiteSettings;
  stats: SiteStats;
  events: Event[];
  announcements: Announcement[];
  team: TeamMember[];
  projects: Project[];
  achievements: Achievement[];
  gallery: GalleryImage[];
  join_applications: JoinApplication[];
  registrations: EventRegistration[];
  messages: ContactMessage[];
  admin_users: AdminUserRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function createDefaultAdmin(): AdminUserRecord {
  const salt = crypto.randomBytes(16).toString('hex');
  const defaultEmail = process.env.ADMIN_EMAIL || 'mahigamingzone2@gmail.com';
  const defaultPass = process.env.ADMIN_PASSWORD || 'intelligenz2026';
  return {
    id: 'usr-admin-master',
    username: 'admin',
    email: defaultEmail,
    password_hash: hashPassword(defaultPass, salt),
    salt,
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      const adminUsers: AdminUserRecord[] =
        Array.isArray(parsed.admin_users) && parsed.admin_users.length > 0
          ? parsed.admin_users
          : [createDefaultAdmin()];

      const loaded: DatabaseSchema = {
        settings: parsed.settings || INITIAL_SETTINGS,
        stats: parsed.stats || INITIAL_STATS,
        events: parsed.events || INITIAL_EVENTS,
        announcements: parsed.announcements || INITIAL_ANNOUNCEMENTS,
        team: parsed.team || INITIAL_TEAM,
        projects: parsed.projects || INITIAL_PROJECTS,
        achievements: parsed.achievements || INITIAL_ACHIEVEMENTS,
        gallery: parsed.gallery || INITIAL_GALLERY,
        join_applications: parsed.join_applications || [],
        registrations: parsed.registrations || [],
        messages: parsed.messages || [],
        admin_users: adminUsers,
      };
      return loaded;
    }
  } catch (err) {
    console.error('Error reading db.json, falling back to defaults:', err);
  }

  const initialDb: DatabaseSchema = {
    settings: INITIAL_SETTINGS,
    stats: INITIAL_STATS,
    events: INITIAL_EVENTS,
    announcements: INITIAL_ANNOUNCEMENTS,
    team: INITIAL_TEAM,
    projects: INITIAL_PROJECTS,
    achievements: INITIAL_ACHIEVEMENTS,
    gallery: INITIAL_GALLERY,
    join_applications: [],
    registrations: [],
    messages: [],
    admin_users: [createDefaultAdmin()],
  };
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(database: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

let db = loadDatabase();

// In-memory rate limiting map
const ipRateLimits = new Map<string, { count: number; lastReset: number }>();
function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const clientData = ipRateLimits.get(ip) || { count: 0, lastReset: now };

    if (now - clientData.lastReset > windowMs) {
      clientData.count = 1;
      clientData.lastReset = now;
    } else {
      clientData.count += 1;
    }

    ipRateLimits.set(ip, clientData);

    if (clientData.count > limit) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }
    next();
  };
}

// Active session storage
const activeSessions = new Map<string, { userId: string; email: string; expiresAt: number }>();
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'intelligenz_admin_secret_token_2026';

function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
    return;
  }
  const token = authHeader.split(' ')[1];

  // Check master secret or active valid session
  if (token === ADMIN_SECRET) {
    next();
    return;
  }

  const session = activeSessions.get(token);
  if (session && session.expiresAt > Date.now()) {
    next();
    return;
  }

  res.status(403).json({ error: 'Forbidden: Invalid or expired admin session' });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger for API calls
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });

  // ==========================================
  // PUBLIC & SHARED API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      club: 'INTELLIGENZ',
      department: 'Department of CSE (AIML) & AI',
      college: 'DR. K. V. SUBBA REDDY INSTITUTE OF TECHNOLOGY',
      timestamp: new Date().toISOString(),
    });
  });

  // Settings & Metadata
  app.get('/api/settings', (req, res) => {
    res.json(db.settings);
  });

  // Stats
  app.get('/api/stats', (req, res) => {
    res.json(db.stats);
  });

  // Global Search
  app.get('/api/search', (req, res) => {
    const query = (req.query.q as string || '').toLowerCase().trim();
    if (!query) {
      res.json({ events: [], announcements: [], projects: [] });
      return;
    }

    const matchedEvents = db.events.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.short_description.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query) ||
        (e.speaker && e.speaker.toLowerCase().includes(query))
    );

    const matchedAnnouncements = db.announcements.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.summary.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query)
    );

    const matchedProjects = db.projects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.short_description.toLowerCase().includes(query) ||
        p.tech_stack.some((t) => t.toLowerCase().includes(query))
    );

    res.json({
      events: matchedEvents,
      announcements: matchedAnnouncements,
      projects: matchedProjects,
    });
  });

  // EVENTS
  app.get('/api/events', (req, res) => {
    const category = req.query.category as string;
    const status = req.query.status as string;
    const featured = req.query.featured === 'true';

    let result = [...db.events];
    if (category && category !== 'All') {
      result = result.filter((e) => e.category === category);
    }
    if (status && status !== 'All') {
      result = result.filter((e) => e.status === status);
    }
    if (featured) {
      result = result.filter((e) => e.featured);
    }

    // Sort by date descending
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(result);
  });

  app.get('/api/events/:slug', (req, res) => {
    const event = db.events.find((e) => e.slug === req.params.slug || e.id === req.params.slug);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.json(event);
  });

  // Event Registration (Public)
  app.post('/api/events/:id/register', rateLimiter(30, 60000), (req, res) => {
    const eventId = req.params.id;
    const event = db.events.find((e) => e.id === eventId || e.slug === eventId);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.status !== 'Registration Open') {
      res.status(400).json({ error: 'Registrations are currently not open for this event.' });
      return;
    }

    const { full_name, participant_name, name, email, phone, department, year, roll_number, college } = req.body;
    const studentName = (full_name || participant_name || name || '').trim();
    const studentEmail = (email || '').trim().toLowerCase();
    const studentRoll = (roll_number || '').trim().toUpperCase();
    const studentDept = (department || '').trim();
    const studentYear = (year || '').trim();

    if (!studentName || !studentEmail || !studentRoll || !studentDept || !studentYear) {
      res.status(400).json({ error: 'Please provide all required registration fields (Name, Email, Roll Number, Department, and Year).' });
      return;
    }

    // Check duplicate
    const existing = db.registrations.find(
      (r) =>
        r.event_id === event.id &&
        (r.email.toLowerCase() === studentEmail ||
          r.roll_number.toUpperCase() === studentRoll)
    );
    if (existing) {
      res.status(400).json({ error: 'You have already registered for this event with this email or roll number.' });
      return;
    }

    const newReg: EventRegistration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      event_id: event.id,
      event_title: event.title,
      full_name: studentName,
      participant_name: studentName,
      email: studentEmail,
      phone: (phone || '').trim(),
      department: studentDept,
      year: studentYear,
      roll_number: studentRoll,
      status: event.current_participants < event.maximum_participants ? 'Confirmed' : 'Waitlisted',
      registered_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    db.registrations.unshift(newReg);
    event.current_participants += 1;
    saveDatabase(db);

    res.status(201).json({
      success: true,
      message: `Registration successful! Status: ${newReg.status}`,
      registration: newReg,
    });
  });

  // ANNOUNCEMENTS
  app.get('/api/announcements', (req, res) => {
    const category = req.query.category as string;
    const featured = req.query.featured === 'true';

    let result = [...db.announcements];
    if (category && category !== 'All') {
      result = result.filter((a) => a.category === category);
    }
    if (featured) {
      result = result.filter((a) => a.featured);
    }

    result.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    res.json(result);
  });

  app.get('/api/announcements/:slug', (req, res) => {
    const ann = db.announcements.find((a) => a.slug === req.params.slug || a.id === req.params.slug);
    if (!ann) {
      res.status(404).json({ error: 'Announcement not found' });
      return;
    }
    res.json(ann);
  });

  // TEAM
  app.get('/api/team', (req, res) => {
    const sorted = [...db.team].sort((a, b) => a.order - b.order);
    res.json(sorted);
  });

  // PROJECTS
  app.get('/api/projects', (req, res) => {
    const category = req.query.category as string;
    let result = [...db.projects];
    if (category && category !== 'All') {
      result = result.filter((p) => p.category === category);
    }
    res.json(result);
  });

  // ACHIEVEMENTS
  app.get('/api/achievements', (req, res) => {
    const sorted = [...db.achievements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    res.json(sorted);
  });

  // GALLERY
  app.get('/api/gallery', (req, res) => {
    const album = req.query.album as string;
    let result = [...db.gallery];
    if (album && album !== 'All') {
      result = result.filter((g) => g.album === album);
    }
    res.json(result);
  });

  // JOIN US SUBMISSION (Public)
  app.post('/api/join', rateLimiter(20, 60000), (req, res) => {
    const {
      full_name,
      name,
      college_email,
      email,
      phone,
      department,
      year,
      roll_number,
      technical_interests,
      interested_domains,
      skills,
      why_join,
      reason,
      github_url,
      linkedin_url,
      agreed_updates,
    } = req.body;

    const studentName = (full_name || name || '').trim();
    const studentEmail = (college_email || email || '').trim().toLowerCase();
    const studentRoll = (roll_number || '').trim().toUpperCase();
    const studentDept = (department || '').trim();
    const studentYear = (year || '').trim();
    const studentWhy = (why_join || reason || '').trim();
    const studentDomains = Array.isArray(interested_domains) && interested_domains.length > 0
      ? interested_domains
      : Array.isArray(technical_interests)
      ? technical_interests
      : [];

    if (!studentName || !studentEmail || !studentRoll || !studentDept || !studentYear) {
      res.status(400).json({ error: 'Please fill in all mandatory fields (Name, Email, Roll Number, Department, and Year).' });
      return;
    }

    // Check duplicate
    const existing = db.join_applications.find(
      (a) =>
        (a.college_email && a.college_email.toLowerCase() === studentEmail) ||
        (a.email && a.email.toLowerCase() === studentEmail) ||
        (a.roll_number && a.roll_number.toUpperCase() === studentRoll)
    );

    if (existing) {
      res.status(400).json({
        error: 'An application with this Roll Number or College Email has already been submitted.',
      });
      return;
    }

    const newApp: JoinApplication = {
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      full_name: studentName,
      email: studentEmail,
      college_email: studentEmail,
      phone: (phone || '').trim(),
      department: studentDept,
      year: studentYear,
      roll_number: studentRoll,
      interested_domains: studentDomains,
      technical_interests: studentDomains,
      skills: (skills || '').trim(),
      reason: studentWhy,
      why_join: studentWhy,
      github_url: (github_url || '').trim(),
      linkedin_url: (linkedin_url || '').trim(),
      agreed_updates: !!agreed_updates,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };

    db.join_applications.unshift(newApp);
    saveDatabase(db);

    res.status(201).json({
      success: true,
      message: 'Welcome to INTELLIGENZ! Your student membership application has been successfully saved to the club database.',
      application_id: newApp.id,
      application: newApp,
    });
  });

  // CONTACT MESSAGE (Public)
  app.post('/api/contact', rateLimiter(10, 60000), (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'All contact fields are required.' });
      return;
    }

    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      is_read: false,
      responded: false,
      created_at: new Date().toISOString(),
    };

    db.messages.unshift(newMsg);
    saveDatabase(db);

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! The IntelliGenZ team will get back to you shortly.',
    });
  });

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  app.post('/api/auth/login', rateLimiter(10, 60000), (req, res) => {
    const { username, email, password } = req.body;
    const identifier = (username || email || '').trim().toLowerCase();

    if (!identifier || !password) {
      res.status(400).json({ error: 'Please provide your email/username and password.' });
      return;
    }

    // Find admin user by username or email
    const adminUser = db.admin_users.find(
      (u) =>
        u.username.toLowerCase() === identifier ||
        u.email.toLowerCase() === identifier
    );

    let isAuthenticated = false;
    let matchedUser: AdminUserRecord | null = null;

    if (adminUser) {
      const calculatedHash = hashPassword(password, adminUser.salt);
      if (calculatedHash === adminUser.password_hash) {
        isAuthenticated = true;
        matchedUser = adminUser;
      }
    }

    // Master fallback if matching ADMIN_SECRET / master pass in dev
    const masterPass = process.env.ADMIN_PASSWORD || 'intelligenz2026';
    if (!isAuthenticated && (identifier === 'admin' || identifier === (process.env.ADMIN_EMAIL || 'mahigamingzone2@gmail.com').toLowerCase()) && password === masterPass) {
      isAuthenticated = true;
      matchedUser = db.admin_users[0] || createDefaultAdmin();
    }

    if (isAuthenticated && matchedUser) {
      const sessionToken = `session_${crypto.randomBytes(24).toString('hex')}`;
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      activeSessions.set(sessionToken, {
        userId: matchedUser.id,
        email: matchedUser.email,
        expiresAt,
      });

      res.json({
        success: true,
        token: sessionToken,
        user: {
          id: matchedUser.id,
          username: matchedUser.username,
          email: matchedUser.email,
          role: matchedUser.role,
        },
      });
      return;
    }

    res.status(401).json({ error: 'Invalid admin email, username, or password.' });
  });

  app.get('/api/auth/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ valid: false, error: 'No authorization token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (token === ADMIN_SECRET) {
      const defaultAdmin = db.admin_users[0] || createDefaultAdmin();
      res.json({
        valid: true,
        user: {
          id: defaultAdmin.id,
          username: defaultAdmin.username,
          email: defaultAdmin.email,
          role: defaultAdmin.role,
        },
      });
      return;
    }

    const session = activeSessions.get(token);
    if (session && session.expiresAt > Date.now()) {
      const user = db.admin_users.find((u) => u.id === session.userId) || db.admin_users[0];
      res.json({
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
      return;
    }

    res.status(401).json({ valid: false, error: 'Unauthorized or expired session' });
  });

  // ==========================================
  // ADMIN PROTECTED ROUTES
  // ==========================================
  const adminRouter = express.Router();
  adminRouter.use(adminAuthMiddleware);

  // Admin Profile & Account Management
  adminRouter.get('/profile', (req, res) => {
    const user = db.admin_users[0] || createDefaultAdmin();
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  });

  adminRouter.put('/profile', (req, res) => {
    const { email, username } = req.body;
    if (!db.admin_users[0]) {
      db.admin_users.push(createDefaultAdmin());
    }
    const user = db.admin_users[0];
    if (email && email.includes('@')) {
      user.email = email.trim().toLowerCase();
    }
    if (username && username.trim().length > 0) {
      user.username = username.trim();
    }
    user.updated_at = new Date().toISOString();
    saveDatabase(db);
    res.json({
      success: true,
      message: 'Admin profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  });

  adminRouter.post('/change-password', (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Both current password and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }

    const user = db.admin_users[0] || createDefaultAdmin();
    const currentHash = hashPassword(currentPassword, user.salt);
    const masterPass = process.env.ADMIN_PASSWORD || 'intelligenz2026';

    if (currentHash !== user.password_hash && currentPassword !== masterPass) {
      res.status(400).json({ error: 'Current password is incorrect.' });
      return;
    }

    // Update with new salt & hash
    const newSalt = crypto.randomBytes(16).toString('hex');
    user.salt = newSalt;
    user.password_hash = hashPassword(newPassword, newSalt);
    user.updated_at = new Date().toISOString();
    saveDatabase(db);

    res.json({
      success: true,
      message: 'Password changed successfully! You can now use your new password to sign in.',
    });
  });

  // Admin Overview
  adminRouter.get('/overview', (req, res) => {
    const upcomingEvents = db.events.filter((e) => e.status === 'Upcoming' || e.status === 'Registration Open').length;
    const completedEvents = db.events.filter((e) => e.status === 'Completed').length;
    res.json({
      total_events: db.events.length,
      upcoming_events: upcomingEvents,
      completed_events: completedEvents,
      total_announcements: db.announcements.length,
      total_applications: db.join_applications.length,
      new_applications: db.join_applications.filter((a) => a.status === 'New').length,
      total_registrations: db.registrations.length,
      total_projects: db.projects.length,
      total_team: db.team.length,
      total_achievements: db.achievements.length,
      total_gallery: db.gallery.length,
      unread_messages: db.messages.filter((m) => !m.is_read).length,
      recent_applications: db.join_applications.slice(0, 5),
      recent_registrations: db.registrations.slice(0, 5),
      recent_messages: db.messages.slice(0, 5),
    });
  });

  // Admin Events CRUD
  adminRouter.post('/events', (req, res) => {
    const body = req.body;
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newEvent: Event = {
      ...body,
      id: `evt-${Date.now()}`,
      slug,
      current_participants: body.current_participants || 0,
      maximum_participants: Number(body.maximum_participants) || 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.events.unshift(newEvent);
    saveDatabase(db);
    res.status(201).json(newEvent);
  });

  adminRouter.put('/events/:id', (req, res) => {
    const index = db.events.findIndex((e) => e.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    db.events[index] = {
      ...db.events[index],
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    saveDatabase(db);
    res.json(db.events[index]);
  });

  adminRouter.delete('/events/:id', (req, res) => {
    db.events = db.events.filter((e) => e.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, message: 'Event deleted' });
  });

  adminRouter.post('/events/:id/duplicate', (req, res) => {
    const original = db.events.find((e) => e.id === req.params.id);
    if (!original) {
      res.status(404).json({ error: 'Event to duplicate not found' });
      return;
    }
    const duplicated: Event = {
      ...original,
      id: `evt-${Date.now()}`,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      current_participants: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.events.unshift(duplicated);
    saveDatabase(db);
    res.status(201).json(duplicated);
  });

  // Admin Announcements CRUD
  adminRouter.post('/announcements', (req, res) => {
    const body = req.body;
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newAnn: Announcement = {
      ...body,
      id: `ann-${Date.now()}`,
      slug,
      published_at: body.published_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.announcements.unshift(newAnn);
    saveDatabase(db);
    res.status(201).json(newAnn);
  });

  adminRouter.put('/announcements/:id', (req, res) => {
    const index = db.announcements.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Announcement not found' });
      return;
    }
    db.announcements[index] = {
      ...db.announcements[index],
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    saveDatabase(db);
    res.json(db.announcements[index]);
  });

  adminRouter.delete('/announcements/:id', (req, res) => {
    db.announcements = db.announcements.filter((a) => a.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, message: 'Announcement deleted' });
  });

  // Admin Join Applications Management
  adminRouter.get('/join-applications', (req, res) => {
    res.json(db.join_applications);
  });

  adminRouter.patch('/join-applications/:id', (req, res) => {
    const app = db.join_applications.find((a) => a.id === req.params.id);
    if (!app) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    if (req.body.status) app.status = req.body.status;
    if (req.body.reviewer_notes) app.reviewer_notes = req.body.reviewer_notes;
    saveDatabase(db);
    res.json(app);
  });

  adminRouter.delete('/join-applications/:id', (req, res) => {
    db.join_applications = db.join_applications.filter((a) => a.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Admin Registrations Management
  adminRouter.get('/registrations', (req, res) => {
    const eventId = req.query.event_id as string;
    let list = db.registrations;
    if (eventId) {
      list = list.filter((r) => r.event_id === eventId);
    }
    res.json(list);
  });

  adminRouter.patch('/registrations/:id', (req, res) => {
    const reg = db.registrations.find((r) => r.id === req.params.id);
    if (!reg) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }
    if (req.body.status) reg.status = req.body.status;
    saveDatabase(db);
    res.json(reg);
  });

  adminRouter.delete('/registrations/:id', (req, res) => {
    db.registrations = db.registrations.filter((r) => r.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Admin Team Management
  adminRouter.post('/team', (req, res) => {
    const newMember: TeamMember = {
      ...req.body,
      id: `tm-${Date.now()}`,
      order: db.team.length + 1,
    };
    db.team.push(newMember);
    saveDatabase(db);
    res.status(201).json(newMember);
  });

  adminRouter.put('/team/:id', (req, res) => {
    const index = db.team.findIndex((t) => t.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }
    db.team[index] = { ...db.team[index], ...req.body };
    saveDatabase(db);
    res.json(db.team[index]);
  });

  adminRouter.delete('/team/:id', (req, res) => {
    db.team = db.team.filter((t) => t.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Admin Projects Management
  adminRouter.post('/projects', (req, res) => {
    const slug = req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProj: Project = {
      ...req.body,
      id: `proj-${Date.now()}`,
      slug,
      date: req.body.date || new Date().toISOString().slice(0, 7),
    };
    db.projects.unshift(newProj);
    saveDatabase(db);
    res.status(201).json(newProj);
  });

  adminRouter.put('/projects/:id', (req, res) => {
    const index = db.projects.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    db.projects[index] = { ...db.projects[index], ...req.body };
    saveDatabase(db);
    res.json(db.projects[index]);
  });

  adminRouter.delete('/projects/:id', (req, res) => {
    db.projects = db.projects.filter((p) => p.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Admin Achievements Management
  adminRouter.post('/achievements', (req, res) => {
    const newAch: Achievement = {
      ...req.body,
      id: `ach-${Date.now()}`,
    };
    db.achievements.unshift(newAch);
    saveDatabase(db);
    res.status(201).json(newAch);
  });

  adminRouter.put('/achievements/:id', (req, res) => {
    const index = db.achievements.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Achievement not found' });
      return;
    }
    db.achievements[index] = { ...db.achievements[index], ...req.body };
    saveDatabase(db);
    res.json(db.achievements[index]);
  });

  adminRouter.delete('/achievements/:id', (req, res) => {
    db.achievements = db.achievements.filter((a) => a.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Admin Gallery Management
  adminRouter.post('/gallery', (req, res) => {
    const newGal: GalleryImage = {
      ...req.body,
      id: `gal-${Date.now()}`,
    };
    db.gallery.unshift(newGal);
    saveDatabase(db);
    res.status(201).json(newGal);
  });

  adminRouter.put('/gallery/:id', (req, res) => {
    const index = db.gallery.findIndex((g) => g.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Gallery item not found' });
      return;
    }
    db.gallery[index] = { ...db.gallery[index], ...req.body };
    saveDatabase(db);
    res.json(db.gallery[index]);
  });

  adminRouter.delete('/gallery/:id', (req, res) => {
    db.gallery = db.gallery.filter((g) => g.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Admin Messages Management
  adminRouter.get('/messages', (req, res) => {
    res.json(db.messages);
  });

  adminRouter.patch('/messages/:id', (req, res) => {
    const msg = db.messages.find((m) => m.id === req.params.id);
    if (!msg) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    if (typeof req.body.is_read === 'boolean') msg.is_read = req.body.is_read;
    if (typeof req.body.responded === 'boolean') msg.responded = req.body.responded;
    saveDatabase(db);
    res.json(msg);
  });

  adminRouter.delete('/messages/:id', (req, res) => {
    db.messages = db.messages.filter((m) => m.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Admin Stats & Settings Update
  adminRouter.put('/stats', (req, res) => {
    db.stats = { ...db.stats, ...req.body };
    saveDatabase(db);
    res.json(db.stats);
  });

  adminRouter.put('/settings', (req, res) => {
    db.settings = { ...db.settings, ...req.body };
    saveDatabase(db);
    res.json(db.settings);
  });

  // Mount Admin Router
  app.use('/api/admin', adminRouter);

  // PostgreSQL / Supabase Schema Exporter
  app.get('/api/export-supabase-sql', (req, res) => {
    const sql = `
-- ====================================================================
-- INTELLIGENZ CLUB - PRODUCTION SUPABASE / POSTGRESQL SCHEMA
-- Official Technical Club of Department of CSE (AIML) & AI
-- DR. K. V. SUBBA REDDY INSTITUTE OF TECHNOLOGY
-- ====================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  event_image TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  venue TEXT NOT NULL,
  category TEXT NOT NULL,
  speaker TEXT,
  speaker_bio TEXT,
  speaker_avatar TEXT,
  registration_url TEXT,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  maximum_participants INTEGER DEFAULT 100,
  current_participants INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Upcoming',
  featured BOOLEAN DEFAULT false,
  highlights JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  results TEXT,
  winners JSONB DEFAULT '[]'::jsonb,
  certificates_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for performance (500+ concurrent visitors)
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(featured);

-- 3. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  featured_image TEXT,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  author_role TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  featured BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON public.announcements(published_at);
CREATE INDEX IF NOT EXISTS idx_announcements_slug ON public.announcements(slug);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON public.announcements(category);

-- 4. Join Applications Table
CREATE TABLE IF NOT EXISTS public.join_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  college_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  technical_interests JSONB DEFAULT '[]'::jsonb,
  skills TEXT NOT NULL,
  why_join TEXT NOT NULL,
  github_url TEXT,
  linkedin_url TEXT,
  agreed_updates BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'New',
  reviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_join_email ON public.join_applications(LOWER(college_email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_join_roll ON public.join_applications(UPPER(roll_number));
CREATE INDEX IF NOT EXISTS idx_join_status ON public.join_applications(status);

-- 5. Event Registrations Table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  status TEXT DEFAULT 'Confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_event_registration UNIQUE(event_id, email)
);

CREATE INDEX IF NOT EXISTS idx_reg_event ON public.event_registrations(event_id);

-- 6. Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  category TEXT NOT NULL,
  bio TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  linkedin TEXT,
  github TEXT,
  email TEXT,
  featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

-- 7. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  category TEXT NOT NULL,
  tech_stack JSONB DEFAULT '[]'::jsonb,
  team_members JSONB DEFAULT '[]'::jsonb,
  github_url TEXT,
  demo_url TEXT,
  image_url TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Completed',
  date TEXT NOT NULL
);

-- 8. Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  award_rank TEXT,
  organization TEXT NOT NULL,
  members JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  proof_link TEXT
);

-- 9. Gallery Images Table
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  album TEXT NOT NULL,
  event_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  date DATE NOT NULL,
  featured BOOLEAN DEFAULT false
);

-- 10. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  responded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Read policies for public tables
CREATE POLICY "Allow public read on events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public read on announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow public read on team" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Allow public read on projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public read on achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Allow public read on gallery" ON public.gallery_images FOR SELECT USING (true);

-- Insert policies for public submissions
CREATE POLICY "Allow public join application submit" ON public.join_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public event registration" ON public.event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public contact message submit" ON public.contact_messages FOR INSERT WITH CHECK (true);
`;
    res.setHeader('Content-Type', 'text/plain');
    res.send(sql);
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ INTELLIGENZ Club Server running on port ${PORT} [http://0.0.0.0:${PORT}]`);
    console.log(`🏛️ Institution: DR. K. V. SUBBA REDDY INSTITUTE OF TECHNOLOGY`);
    console.log(`🤖 Department: Department of CSE (AIML) & AI`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});

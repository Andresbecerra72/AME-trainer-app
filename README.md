# AME Exam Trainer - Social Edition

A comprehensive web-based exam training application for Aircraft Maintenance Engineers (AME) with social learning features, community question bank, and role-based access control.

## Features

### 📚 Core Exam System
- **Topic-based Study**: Organized question bank by aviation topics
- **Practice Exams**: Configurable exam setup with timer and question count
- **Question Review**: Detailed explanations and performance tracking
- **Progress Analytics**: Personal stats, study time tracking, and topic performance

### 👥 Social Learning Platform
- **Community Questions**: User-contributed question bank with voting system
- **Comments & Discussion**: Engage with peers on questions
- **Bookmarks**: Save questions for later review
- **Leaderboard**: Top contributors recognition
- **Reputation System**: Earn points for quality contributions

### 🛡️ Role-Based Access Control
- **Users**: Can contribute questions, vote, comment, and take exams
- **Admins**: Moderate questions and manage reports
- **Super Admins**: Full user management and system administration

### 🔐 Authentication & Security
- Supabase authentication with email/password
- Protected routes with middleware
- Row Level Security (RLS) policies
- Secure session management

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui
- **State Management**: React Server Components + Server Actions

## Project Structure

\`\`\`
├── app/
│   ├── (routes)/
│   │   ├── auth/login          # Authentication
│   │   ├── dashboard           # Main dashboard
│   │   ├── community           # Community questions
│   │   ├── topics              # Study topics
│   │   ├── exam                # Exam system
│   │   ├── analytics           # Progress tracking
│   │   ├── profile             # User profiles
│   │   ├── notifications       # Notification center
│   │   ├── bookmarks           # Saved questions
│   │   ├── leaderboard         # Top contributors
│   │   └── admin               # Admin panel
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── bottom-nav.tsx          # Bottom navigation
│   ├── vote-button.tsx         # Voting component
│   ├── comment-list.tsx        # Comments component
│   └── ...                     # Other components
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client (singleton)
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Middleware client
│   ├── db-actions.ts           # Server actions
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Utility functions
├── scripts/
│   ├── 001_create_tables.sql   # Database schema
│   ├── 002_seed_topics.sql     # Initial topics
│   └── 003_enable_rls.sql      # Security policies
└── middleware.ts               # Route protection

\`\`\`

## Database Schema

### Tables
- **profiles**: Extended user information with reputation and role
- **topics**: Study topics/subjects
- **questions**: Community-contributed questions
- **comments**: Discussion on questions
- **votes**: Upvote/downvote system
- **bookmarks**: User-saved questions
- **reports**: Content moderation reports
- **notifications**: User notifications
- **exam_history**: Exam results tracking
- **badges**: Achievement system (future)
- **user_badges**: User achievements (future)

## Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- Vercel account (for deployment)

### Installation

1. Clone the repository
2. Install dependencies (handled automatically by v0)
3. Set up Supabase integration in v0
4. Run database migration scripts from the `scripts/` folder
5. Start development server

### Environment Variables

All environment variables are automatically configured through v0's Supabase integration:
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Key Features Implementation

### Singleton Supabase Client
The browser client uses a singleton pattern to prevent multiple GoTrueClient instances:
\`\`\`typescript
// lib/supabase/client.ts
let browserClient: SupabaseClient | null = null

export function createClient() {
  if (typeof window === 'undefined') return createBrowserClient(...)
  if (!browserClient) {
    browserClient = createBrowserClient(...)
  }
  return browserClient
}
\`\`\`

### Server Actions
All database operations use Server Actions for security:
\`\`\`typescript
// lib/db-actions.ts
"use server"

export async function createQuestion(question: QuestionData) {
  const supabase = await createClient()
  // ... database operations
}
\`\`\`

### Protected Routes
Middleware handles authentication and route protection:
\`\`\`typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request)
  // ... authentication checks
}
\`\`\`

## User Roles & Permissions

### User
- Create and submit questions (pending approval)
- Vote and comment on approved questions
- Take exams and track progress
- Bookmark questions
- Report inappropriate content

### Admin
- Review and approve/reject pending questions
- Handle content reports
- View moderation dashboard
- All user permissions

### Super Admin
- Manage user roles
- Full system administration
- All admin permissions

## Navigation

The app uses a mobile-first bottom navigation bar:
- **Home**: Dashboard with quick actions
- **Community**: Browse and contribute questions
- **Notifications**: Activity and alerts
- **Profile**: User stats and settings
- **Admin** (conditional): Moderation tools

## Analytics & Progress Tracking

The analytics page provides:
- Reputation and contribution stats
- Study time over last 7 days
- Topic performance breakdown
- Weak/strong area identification
- Personalized recommendations

## Contributing

Questions submitted by users go through a moderation flow:
1. User submits question (status: "pending")
2. Admin reviews and approves/rejects
3. Approved questions appear in community feed
4. Rejected questions are removed from public view

## Design System

### Colors
- **Primary**: Navy blue (#003A63) - Aviation theme
- **Accent**: Yellow (#FFCC00) - High visibility
- **Background**: Clean white/dark mode support
- **Semantic tokens**: Defined in globals.css

### Typography
- Sans-serif for body text
- Clear hierarchy with font weights
- Optimal line-height for readability

### Layout
- Mobile-first responsive design
- Card-based UI components
- Touch-friendly 44px minimum tap targets
- Bottom navigation for easy thumb access

## Deployment

Deploy directly from v0 to Vercel:
1. Click "Publish" button in v0
2. Connect to GitHub (optional)
3. Deploy to production

## Future Enhancements

- [ ] Badge/achievement system
- [ ] Real-time notifications
- [ ] Study groups and collaboration
- [ ] Question difficulty algorithm
- [ ] Advanced analytics and insights
- [ ] Mobile app (React Native)
- [ ] Offline mode support
- [ ] Question attachments (images/diagrams)

## Support

For issues or questions, please open a support ticket at vercel.com/help

## License

Built with v0 by Vercel

---

**Note**: This application is built as a Progressive Web App (PWA) and works seamlessly on mobile browsers. For the best experience, add it to your home screen.

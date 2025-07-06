# Pet Health Journal 🐾

A mobile-first web app for pet owners to track their pets' health activities, including vaccinations, medications, weight, daily behavior, and reminders.

## Features

- 📱 **Mobile-first design** with responsive UI
- 🐕 **Pet profiles** with photos, breed, and birthday
- 💊 **Health records** tracking (vaccines, checkups, medications, weight)
- 📝 **Behavior logs** for daily activities and observations
- ⏰ **Reminders** with custom or repeating tasks
- 🔐 **Authentication** with Supabase Auth
- 📊 **Dashboard** showing current week's reminders and pet overview

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Components**: Custom components with Lucide React icons
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
cd pet-health-journal
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your project URL and anon key
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Database Setup

1. Go to your Supabase dashboard → SQL Editor
2. Run the schema SQL (see `database-schema.sql` in the project)
3. Enable Row Level Security (RLS) and add policies
4. (Optional) Add some seed data for testing

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Authentication

- Visit `/auth` to sign up/sign in
- Use any email/password for demo purposes
- The app will automatically redirect to the dashboard after authentication

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication page
│   ├── pets/              # Pet management pages
│   ├── reminders/         # Reminders page
│   ├── add/               # Add new records
│   ├── profile/           # User profile
│   └── layout.tsx         # Root layout with navigation
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── BottomNav.tsx     # Bottom navigation
│   └── PetCard.tsx       # Pet display card
└── lib/                  # Utilities and configurations
    ├── supabase.ts       # Supabase client and types
    └── utils.ts          # Utility functions
```

## Database Schema

### Tables

- **users** - User accounts (handled by Supabase Auth)
- **pets** - Pet profiles with basic information
- **health_records** - Vaccinations, checkups, medications, weight
- **behavior_logs** - Daily behavior observations
- **reminders** - Health tasks and reminders

### Relationships

- All tables have proper foreign key relationships
- Row Level Security (RLS) ensures users only see their own data
- Automatic timestamps (`created_at`, `updated_at`)

## Key Features Implementation

### Mobile-First Design
- Responsive layout with max-width container
- Bottom navigation for easy thumb access
- Card-based UI for touch-friendly interactions
- Proper spacing and typography for mobile screens

### Authentication Flow
- Supabase Auth integration
- Protected routes (implement auth guards as needed)
- User session management
- Sign up/sign in forms with validation

### Data Management
- Real-time data fetching with Supabase
- Optimistic updates for better UX
- Error handling and loading states
- Form validation and user feedback

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Adding New Features

1. **New Pages**: Add to `src/app/` directory
2. **Components**: Create in `src/components/`
3. **Database**: Add tables via Supabase dashboard
4. **Types**: Update `src/lib/supabase.ts`

### Styling

- Uses Tailwind CSS for styling
- Custom components in `src/components/ui/`
- Consistent color scheme and spacing
- Mobile-first responsive design

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

- Netlify: Similar to Vercel setup
- Railway: Add environment variables and deploy
- Self-hosted: Build and serve static files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own pet health tracking needs!

## Support

For issues or questions:
- Check the Supabase documentation
- Review Next.js and Tailwind CSS docs
- Open an issue in the repository

---

Made with ❤️ for pet lovers everywhere! 🐕🐱

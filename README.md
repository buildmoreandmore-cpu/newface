# NEWFACE

Premium fashion talent scouting platform with AI-powered analysis. Discover tomorrow's faces today.

## Features

- **AI-Powered Analysis**: Automatically analyze candidate profiles with GPT-4 to get marketability scores, strengths, and recommendations
- **CSV Upload**: Bulk import talent profiles from CSV files
- **Pipeline Management**: Kanban-style board to track candidates through discovery, contact, and signing stages
- **Outreach Templates**: Create and manage reusable message templates with variable substitution
- **Dark Luxury UI**: Premium dark theme with gold accents

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: OpenAI GPT-4
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### 1. Clone and Install

```bash
cd newface
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Enable Email Auth in Authentication settings
4. (Optional) Enable Google OAuth provider

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
newface/
├── app/
│   ├── (auth)/           # Login/signup pages
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── dashboard/    # Main dashboard
│   │   ├── upload/       # CSV upload page
│   │   ├── pipeline/     # Kanban pipeline
│   │   ├── templates/    # Outreach templates
│   │   └── candidates/   # Candidate detail pages
│   └── api/              # API routes
├── components/
│   ├── ui/               # shadcn/ui components
│   └── candidates/       # Candidate components
├── lib/
│   ├── supabase/         # Supabase clients
│   └── ai/               # OpenAI integration
└── types/                # TypeScript types
```

## CSV Format

Upload CSV files with the following columns (only `name` is required):

```csv
name,handle,platform,bio,followers,engagement_rate,location,profile_url
Jane Doe,janedoe,instagram,Fashion enthusiast,50000,3.5,New York,https://instagram.com/janedoe
```

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## License

MIT

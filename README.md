# RosterXPro

A modern roster management system built with React, TypeScript, and Supabase.

## Features

- 🔐 **User Authentication** - Secure login/registration with Supabase Auth
- 👤 **User Profiles** - Complete user profile management
- 🎨 **Modern UI** - Built with TailwindCSS and ShadCN UI
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Real-time Updates** - Live data synchronization

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, ShadCN UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Development**: ESLint, Hot Reload

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd enterprise-roster
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Start the development server:
```bash
npm run dev
```

## Database Schema

The application uses a simple schema with:
- `user_profiles` - User profile information

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and services
├── pages/              # Page components
└── App.tsx             # Main app component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License

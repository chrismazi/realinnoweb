<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# WellVest - Your Holistic Wealth & Wellness Companion

A comprehensive progressive web app that integrates financial wellness, mental health support, and sexual health education in one beautiful interface.

## 🚀 Features

- **Financial Management**: Track expenses, income, and savings goals
- **Mental Health**: AI-powered chat companion with crisis support
- **Sexual Health**: Comprehensive health tracking and education
- **Learning Hub**: Curated articles on wellness and personal growth
- **Dark Mode**: Beautiful dark/light themes
- **Offline Support**: Works without internet connection

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Authentication)
- **State Management**: Zustand with persist middleware
- **Styling**: Tailwind CSS
- **AI**: Google Gemini for mental health chat
- **Charts**: Recharts for data visualization

## 📦 Installation

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Supabase account (free tier works!)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd realworke
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase Backend** (REQUIRED)
   
   📖 **[Follow the detailed Supabase setup guide](./SUPABASE_SETUP.md)**
   
   Quick summary:
   - Create a Supabase project at [app.supabase.com](https://app.supabase.com)
   - Run the SQL schema from `supabase/schema.sql`
   - Get your API keys from Supabase dashboard

4. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration (REQUIRED)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   
   # Gemini AI (Optional - for mental health chat)
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 🔐 Authentication

The app now uses **real Supabase authentication**:

- ✅ Secure email/password signup and login
- ✅ Password strength validation
- ✅ Email verification (optional)
- ✅ Password reset functionality
- ✅ Session management with JWT
- ✅ Auto token refresh
- ✅ Row Level Security for data protection

## 🗄️ Database Structure

All user data is securely stored in Supabase PostgreSQL:

- **profiles**: User account information
- **transactions**: Financial transactions
- **savings_goals**: Savings goals with progress
- **health_data**: Health tracking data (encrypted)
- **chat_messages**: Mental health chat history

See `supabase/schema.sql` for complete schema.

## 📱 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## 🎨 Design Philosophy

WellVest follows a premium design aesthetic with:

- Glassmorphism effects
- Smooth animations and transitions
- Vibrant gradient backgrounds
- Dark mode optimized
- Mobile-first responsive design

## 🔒 Security & Privacy

- End-to-end encryption for sensitive health data
- Row Level Security (RLS) in Supabase
- No third-party analytics tracking
- GDPR compliant data export
- Secure password hashing (bcrypt)
- JWT-based authentication

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with ❤️ using React and Supabase
- AI powered by Google Gemini
- Icons and illustrations are custom designed

---

**Need Help?** Check out [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed backend setup instructions.

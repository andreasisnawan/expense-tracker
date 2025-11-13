# Expense Tracker

A personal expense tracking application built with modern web technologies.

## Tech Stack

- **SvelteKit** - Web framework (using Svelte 5 syntax)
- **Tailwind CSS v3** - Styling
- **Firebase Auth** - Authentication
- **Google Spreadsheet** - Data storage

## Features

- 🔐 Secure authentication with Firebase
- 📊 Track expenses and income
- 📈 Visual dashboard with charts
- 💾 Data backed up to Google Sheets
- 📱 Responsive design
- 🎨 Clean, modern UI

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Firebase account
- Google Cloud account (for Sheets API)

### Installation

1. Clone the repository

```bash
git clone https://github.com/andreasisnawan/expense-tracker.git
cd expense-tracker
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
# Fill in your Firebase and Google Sheets credentials
```

4. Run the development server

```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173)

## Project Structure

See `PROJECT_STRUCTURE.md` for detailed project organization.

## Configuration

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google Sign-in
3. Copy your Firebase config to `.env`

### Google Sheets Setup

1. Create a new project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Sheets API
3. Create a service account and download credentials
4. Share your Google Sheet with the service account email
5. Copy the spreadsheet ID and credentials to `.env`

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT

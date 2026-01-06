# Frontend (React + Vite)

Money Lover Clone - Frontend Application

## Tech Stack

- **React 18.3** - UI Framework
- **Vite 7** - Build tool & dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Authentication (optional)

## Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `VITE_API_URL` - Backend API URL (default: http://localhost:4000/api)
- `VITE_FIREBASE_*` - Firebase configuration (optional, for Firebase auth)

### 3. Run Development Server

```bash
npm run dev
```

The app will start at: **http://localhost:5174**

### 4. Build for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Sidebar.jsx
│   │   ├── MoreMenu.jsx
│   │   └── common/
│   ├── pages/          # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Transactions.jsx
│   │   └── ...
│   ├── services/       # API services
│   │   ├── api.js
│   │   └── tokenResolver.js
│   ├── context/        # React Context
│   │   └── AuthContext.jsx
│   ├── lib/           # Utilities
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # App entry point
│   └── styles.css     # Global styles
├── public/            # Static assets
├── index.html         # HTML template
├── vite.config.js     # Vite configuration
├── tailwind.config.js # Tailwind CSS config
└── package.json

```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

### Core Pages
- 🔐 Authentication (Login/Register)
- 📊 Dashboard
- 💰 Transactions Management
- 🏦 Wallets
- 📑 Categories
- 💵 Budgets
- 🎯 Savings Goals
- 📈 Reports & Analytics
- 👤 User Profile

### Key Features
- Real-time transaction tracking
- Multi-wallet support
- Budget monitoring
- Savings goal tracking
- Category-based expense analysis
- Wallet-based reports
- Responsive design (mobile-friendly)

## API Integration

The frontend communicates with the backend via Axios with:
- Automatic token injection for authenticated requests
- Request/Response interceptors
- Error handling

Base API URL is configured via `VITE_API_URL` environment variable.

## Authentication

The app supports two authentication methods:
1. **JWT Authentication** - Standard backend JWT tokens
2. **Firebase Authentication** - Optional Firebase integration

User session is stored in localStorage with the key `ml_user`.

## Development Tips

### Hot Module Replacement (HMR)
Vite provides fast HMR - changes appear instantly without full page reload.

### Port Configuration
Default port is 5174. Change it in `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 5174,
  },
})
```

### Tailwind CSS
Use Tailwind utility classes for styling. Configuration is in `tailwind.config.js`.

## Troubleshooting

### Port Already in Use
If port 5174 is taken, Vite will automatically try the next available port (strictPort: false).

### API Connection Issues
- Ensure backend is running at the URL specified in `.env`
- Check CORS settings in backend
- Verify `VITE_API_URL` is correct

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Private project for educational purposes.

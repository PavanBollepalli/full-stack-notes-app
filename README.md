# Full-Stack Notes App

A modern, mobile-friendly note-taking application built with React (TypeScript) on the frontend and Node.js (TypeScript) on the backend, using MongoDB for data storage.

## Features

- **User Authentication**: Sign up and login with email/OTP or Google OAuth
- **Notes Management**: Create, view, and delete personal notes
- **JWT Authorization**: Secure API access with JSON Web Tokens
- **Responsive Design**: Mobile-friendly UI using Tailwind CSS
- **Real-time Updates**: Instant feedback on user actions

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Authentication**: JWT, Google OAuth
- **Email**: Nodemailer for OTP delivery

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Gmail account for OTP emails (or configure another email service)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd full-stack-notes-app
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration**

   Create a `.env` file in the `server` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/notesapp
   JWT_SECRET=your_jwt_secret_here
   GOOGLE_CLIENT_ID=your_google_client_id
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   PORT=5000
   ```

## Running the Application

1. **Start MongoDB**
   Make sure MongoDB is running on your system.

2. **Start the Backend**
   ```bash
   cd server
   npm run dev
   ```

3. **Start the Frontend**
   ```bash
   cd ../client
   npm run dev
   ```

4. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/google` - Google OAuth login

### Notes
- `GET /api/notes` - Get all user notes (requires auth)
- `POST /api/notes` - Create a new note (requires auth)
- `DELETE /api/notes/:id` - Delete a note (requires auth)

## Project Structure

```
full-stack-notes-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.tsx
│   │   │   └── Notes.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Note.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── notes.ts
│   │   ├── utils/
│   │   │   └── email.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider

### Backend (Render/Railway/Heroku)
1. Set environment variables in your hosting platform
2. Deploy the server code
3. Ensure MongoDB is accessible from your deployment environment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Configure the OAuth consent screen if prompted
   - Set application type to "Web application"
   - Add authorized origins: `http://localhost:5000` (for development) and your production domain
   - Add authorized redirect URIs: `http://localhost:5000/auth/google/callback` (adjust as needed)
5. Copy the Client ID and add it to your `.env` file as `GOOGLE_CLIENT_ID`

## Email Setup (Gmail)

1. Use a Gmail account for sending OTP emails
2. Enable 2-Factor Authentication (2FA) on your Google account
3. Generate an App Password:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security > 2-Step Verification > App passwords
   - Generate a password for "Mail" and your device
4. Add to `.env`:
   - `EMAIL_USER=your-gmail@gmail.com`
   - `EMAIL_PASS=your-16-character-app-password`

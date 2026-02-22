'use client';

import '@/styles/globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <title>Bilo Chess - Apprendre les échecs</title>
        <meta name="description" content="Plateforme francophone pour apprendre et progresser aux échecs" />
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

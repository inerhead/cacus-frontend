import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';

// Helper function to decode JWT and get expiration time
function getTokenExpiration(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    return decoded.exp || null;
  } catch {
    return null;
  }
}

// Check if token is expired
function isTokenExpired(accessToken: string | undefined): boolean {
  if (!accessToken) return true;
  const exp = getTokenExpiration(accessToken);
  if (!exp) return true;
  // Token is expired if current time is past expiration
  return Date.now() >= exp * 1000;
}

const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Use INTERNAL_API_URL for server-side calls (Docker), NEXT_PUBLIC_API_URL for client-side
          const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
          
          const res = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            return null;
          }

          const data = await res.json();

          if (data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim(),
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              role: data.user.role,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // When OAuth provider is used (Google or Facebook)
      if (account && (account.provider === 'google' || account.provider === 'facebook')) {
        try {
          // Use internal API URL for server-side calls (from Docker) or external for client-side
          // INTERNAL_API_URL already includes /api at the end (http://backend:3000/api)
          // NEXT_PUBLIC_API_URL also includes /api at the end (http://localhost:3001/api)
          let backendUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
          
          console.log('[OAuth Sync] ============================================');
          console.log('[OAuth Sync] Starting sync for provider:', account.provider);
          console.log('[OAuth Sync] Backend URL (before cleanup):', backendUrl);
          
          // Remove trailing /api if present to avoid duplication
          // Trim any whitespace and remove trailing /api
          backendUrl = backendUrl.trim().replace(/\/api\/?$/, '');
          
          console.log('[OAuth Sync] Backend URL (after cleanup):', backendUrl);
          console.log('[OAuth Sync] User email:', user.email);
          console.log('[OAuth Sync] Provider Account ID:', account.providerAccountId);
          console.log('[OAuth Sync] Has access_token:', !!account.access_token);
          console.log('[OAuth Sync] Has refresh_token:', !!account.refresh_token);
          
          // Extract name parts from profile or user.name
          const nameParts = user.name?.split(' ') || [];
          const firstName = profile?.given_name || profile?.first_name || nameParts[0] || '';
          const lastName = profile?.family_name || profile?.last_name || nameParts.slice(1).join(' ') || '';
          
          // Extract avatar URL from profile or user.image
          // Google: profile.picture, Facebook: profile.picture?.data?.url, NextAuth: user.image
          const avatarUrl = profile?.picture || (profile as any)?.picture?.data?.url || user.image || undefined;

          const syncData = {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            email: user.email!,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            avatarUrl: avatarUrl,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at 
              ? new Date(account.expires_at * 1000).toISOString() 
              : null,
          };

          console.log('[OAuth Sync] Sync data prepared:', { 
            ...syncData, 
            accessToken: syncData.accessToken ? '***' : undefined, 
            refreshToken: syncData.refreshToken ? '***' : undefined 
          });

          // Sync OAuth account with backend - add /api/auth/oauth/sync
          const syncUrl = `${backendUrl}/api/auth/oauth/sync`;
          console.log('[OAuth Sync] Calling:', syncUrl);
          
          const syncResponse = await fetch(syncUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(syncData),
          });

          console.log('[OAuth Sync] Response status:', syncResponse.status);
          console.log('[OAuth Sync] Response ok:', syncResponse.ok);

          if (!syncResponse.ok) {
            const errorText = await syncResponse.text();
            console.error('[OAuth Sync] ❌ Failed to sync OAuth account:', errorText);
            console.error('[OAuth Sync] Status:', syncResponse.status);
            // Don't block sign in, but log the error
          } else {
            const result = await syncResponse.json();
            console.log('[OAuth Sync] ✅ OAuth account synced successfully:', result);
          }
          console.log('[OAuth Sync] ============================================');
        } catch (error: any) {
          console.error('[OAuth Sync] ❌ Error syncing OAuth account:', error);
          console.error('[OAuth Sync] Error message:', error?.message);
          console.error('[OAuth Sync] Error stack:', error?.stack);
          // Don't block sign in on error
        }
      }

      // Always allow sign in
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (account && user) {
        // Extract avatar URL for OAuth providers
        const avatarUrl = user.image || user.avatarUrl;
        
        // Extract firstName from profile or user.name
        const nameParts = user.name?.split(' ') || [];
        const firstName = profile?.given_name || profile?.first_name || nameParts[0] || undefined;
        
        // If OAuth provider, get tokens from backend
        if (account.provider === 'google' || account.provider === 'facebook') {
          try {
            // Use internal API URL for server-side calls
            let backendUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            
            console.log('[OAuth Login] Getting tokens for provider:', account.provider);
            console.log('[OAuth Login] Backend URL (before cleanup):', backendUrl);
            
            // Remove trailing /api if present to avoid duplication
            backendUrl = backendUrl.trim().replace(/\/api\/?$/, '');
            
            console.log('[OAuth Login] Backend URL (after cleanup):', backendUrl);
            
            const loginResponse = await fetch(`${backendUrl}/api/auth/oauth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                email: user.email!,
              }),
            });

            if (loginResponse.ok) {
              const data = await loginResponse.json();
              return {
                ...token,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                userId: data.user.id,
                firstName: data.user.firstName || firstName,
                avatarUrl: avatarUrl || data.user.avatarUrl,
                role: data.user.role || 'customer',
                preferredLanguage: data.user.preferredLanguage || 'es',
                preferredCurrency: data.user.preferredCurrency || 'COP',
              };
            } else {
              console.error('Failed to get tokens from backend:', await loginResponse.text());
            }
          } catch (error) {
            console.error('Error getting tokens from backend:', error);
          }
        }

        // Fallback to user data from credentials provider
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          userId: user.id,
          firstName: firstName || user.firstName,
          avatarUrl: avatarUrl,
          role: user.role || 'customer',
          preferredLanguage: user.preferredLanguage || 'es',
          preferredCurrency: user.preferredCurrency || 'COP',
        };
      }

      // Subsequent requests - check if token is expired
      if (isTokenExpired(token.accessToken as string)) {
        // Token expired, return empty token to force logout
        return {};
      }
      return token;
    },
    async session({ session, token }) {
      // If token is empty (expired), return null to invalidate session
      if (!token.accessToken) {
        return null as any;
      }

      session.user.id = token.userId as string;
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.user.firstName = token.firstName as string;
      session.user.avatarUrl = token.avatarUrl as string;
      session.user.role = token.role as string;
      session.user.preferredLanguage = token.preferredLanguage as string;
      session.user.preferredCurrency = token.preferredCurrency as string;
      // Also set image for compatibility
      if (token.avatarUrl && !session.user.image) {
        session.user.image = token.avatarUrl as string;
      }

      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      email: string;
      name?: string;
      firstName?: string;
      image?: string;
      avatarUrl?: string;
      role?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    image?: string;
    avatarUrl?: string;
    accessToken?: string;
    refreshToken?: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    firstName?: string;
    avatarUrl?: string;
    role?: string;
  }
}

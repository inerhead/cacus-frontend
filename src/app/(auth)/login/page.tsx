'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t.login.invalidCredentials);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError(t.login.error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      setError(t.login.error);
    }
  };

  const socialButtons = [
    {
      id: 'facebook',
      label: t.login.loginWithFacebook,
      provider: 'facebook' as const,
      icon: 'f',
      styleClass: styles.facebookButton
    },
    {
      id: 'google',
      label: t.login.loginWithGoogle,
      provider: 'google' as const,
      icon: 'g',
      styleClass: styles.googleButton
    }
  ];

  return (
    <div className={styles.loginContent}>
      <div className={styles.loginFormWrapper}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1 className={styles.loginTitle}>{t.login.title}</h1>
          </div>

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                {t.login.email}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.formInput}
                placeholder={t.login.email}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                {t.login.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.formInput}
                placeholder={t.login.password}
              />
            </div>

            <div className={styles.buttonLinksWrapper}>
              <button
                type="submit"
                disabled={loading}
                className={styles.primaryButton}
              >
                {loading ? t.login.loggingIn : t.login.loginButton}
              </button>

              <div className={styles.linksSection}>
                <Link href="/register" className={styles.link}>
                  {t.login.newCustomer}
                </Link>
                <Link href="/forgot-password" className={styles.link}>
                  {t.login.forgotPassword}
                </Link>
              </div>
            </div>
          </form>

          <div className={styles.divider}>{t.login.continueWith}</div>

          <div className={styles.oauthSection}>
            {socialButtons.map((button) => (
              <button
                key={button.id}
                type="button"
                onClick={() => button.provider && handleOAuthSignIn(button.provider)}
                disabled={!button.provider}
                className={`${styles.oauthButton} ${button.styleClass}`}
              >
                <span>{button.label}</span>
                <span className={styles.oauthIcon}>{button.icon}</span>
              </button>
            ))}
          </div>

          <div className={styles.registerSection}>
            {t.login.noAccount}{' '}
            <Link href="/register" className={styles.link}>
              {t.login.registerHere}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

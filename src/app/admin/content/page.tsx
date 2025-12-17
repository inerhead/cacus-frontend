'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';
import { useToastContext } from '@/contexts/ToastContext';
import Button from '@/components/ui/Button';
import styles from './admin.module.css';

interface HomeHeroContent {
  title: { es: string; en: string };
  subtitle: { es: string; en: string };
  featuredTitle: { es: string; en: string };
}

export default function AdminContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslation();
  const { showToast } = useToastContext();

  const [content, setContent] = useState<HomeHeroContent>({
    title: { es: '', en: '' },
    subtitle: { es: '', en: '' },
    featuredTitle: { es: '', en: '' },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    // Load current content
    loadContent();
  }, [session, status, router]);

  const loadContent = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/content/home-hero`);
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      showToast(t.account.admin.content.loadError, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      titleEs: content.title.es,
      titleEn: content.title.en,
      subtitleEs: content.subtitle.es,
      subtitleEn: content.subtitle.en,
      featuredTitleEs: content.featuredTitle.es,
      featuredTitleEn: content.featuredTitle.en,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/settings/content/home-hero`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        showToast(t.account.admin.content.saveSuccess, 'success');
      } else {
        throw new Error(`Failed to update: ${response.status}`);
      }
    } catch (error) {
      console.error('Error guardando contenido:', error);
      showToast(t.account.admin.content.saveError, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>{t.common.loading}</div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button 
          variant="ghost"
          size="small"
          onClick={() => router.push('/account')}
        >
          ← {t.account.backToProfile}
        </Button>
        <h1 className={styles.title}>{t.account.admin.content.pageTitle}</h1>
      </div>

      <form onSubmit={handleSave} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.column}>
            <h3 className={styles.languageTitle}>🇪🇸 Español</h3>
            
            <div className={styles.field}>
              <label htmlFor="title-es" className={styles.label}>
                Título Principal
              </label>
              <input
                id="title-es"
                type="text"
                className={styles.input}
                value={content.title.es}
                onChange={(e) =>
                  setContent({
                    ...content,
                    title: { ...content.title, es: e.target.value },
                  })
                }
                placeholder="SORPRENDE EN ESTA NAVIDAD"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="subtitle-es" className={styles.label}>
                Subtítulo
              </label>
              <input
                id="subtitle-es"
                type="text"
                className={styles.input}
                value={content.subtitle.es}
                onChange={(e) =>
                  setContent({
                    ...content,
                    subtitle: { ...content.subtitle, es: e.target.value },
                  })
                }
                placeholder="CON NUESTRAS NOVEDADES"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="featured-title-es" className={styles.label}>
                Título Productos Destacados
              </label>
              <input
                id="featured-title-es"
                type="text"
                className={styles.input}
                value={content.featuredTitle.es}
                onChange={(e) =>
                  setContent({
                    ...content,
                    featuredTitle: { ...content.featuredTitle, es: e.target.value },
                  })
                }
                placeholder="SORPRENDE EN ESTA NAVIDAD CON NUESTRAS NOVEDADES"
              />
            </div>
          </div>

          <div className={styles.column}>
            <h3 className={styles.languageTitle}>🇺🇸 English</h3>
            
            <div className={styles.field}>
              <label htmlFor="title-en" className={styles.label}>
                Main Title
              </label>
              <input
                id="title-en"
                type="text"
                className={styles.input}
                value={content.title.en}
                onChange={(e) =>
                  setContent({
                    ...content,
                    title: { ...content.title, en: e.target.value },
                  })
                }
                placeholder="SURPRISE THIS CHRISTMAS"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="subtitle-en" className={styles.label}>
                Subtitle
              </label>
              <input
                id="subtitle-en"
                type="text"
                className={styles.input}
                value={content.subtitle.en}
                onChange={(e) =>
                  setContent({
                    ...content,
                    subtitle: { ...content.subtitle, en: e.target.value },
                  })
                }
                placeholder="WITH OUR LATEST PRODUCTS"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="featured-title-en" className={styles.label}>
                Featured Products Title
              </label>
              <input
                id="featured-title-en"
                type="text"
                className={styles.input}
                value={content.featuredTitle.en}
                onChange={(e) =>
                  setContent({
                    ...content,
                    featuredTitle: { ...content.featuredTitle, en: e.target.value },
                  })
                }
                placeholder="SURPRISE THIS CHRISTMAS WITH OUR LATEST PRODUCTS"
              />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
          >
            {isSaving ? t.account.admin.content.saving : t.account.admin.content.saveButton}
          </Button>
        </div>
      </form>
    </div>
  );
}

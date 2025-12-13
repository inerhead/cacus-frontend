import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async () => {
  // Get locale from headers or use default
  const headersList = headers();
  const locale = headersList.get('x-locale') || 'es';

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});


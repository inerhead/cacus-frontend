/**
 * Configuración centralizada de la aplicación
 * Aquí se definen estilos, tamaños, colores y configuraciones generales
 */

export const appSettings = {
  // Información general de la aplicación
  app: {
    name: 'CACUS GIFT',
    description: 'Tienda de juguetes educativos para niños',
    defaultLocale: 'es' as const,
    supportedLocales: ['es', 'en'] as const,
  },

  // Configuración de envío gratis
  shipping: {
    freeShippingThreshold: 299900, // COP
    currency: 'COP',
    showBanner: false, // Cambiar a true para mostrar banner de envío
  },

  // Configuración de estilos de botones
  buttons: {
    primary: {
      backgroundColor: '#FFEB3B', // Amarillo LEGO
      textColor: '#000000',
      hoverColor: '#FFD700',
      fontSize: '1rem',
      fontWeight: 'bold',
      padding: {
        small: '0.5rem 1rem',
        medium: '0.75rem 1.5rem',
        large: '1rem 2rem',
      },
      borderRadius: '0px', // Estilo LEGO sin bordes redondeados
      textTransform: 'uppercase' as const,
    },
    secondary: {
      backgroundColor: '#0066CC', // Azul LEGO
      textColor: '#FFFFFF',
      hoverColor: '#00A8E8',
      fontSize: '1rem',
      fontWeight: 'bold',
      padding: {
        small: '0.5rem 1rem',
        medium: '0.75rem 1.5rem',
        large: '1rem 2rem',
      },
      borderRadius: '0px',
      textTransform: 'uppercase' as const,
    },
    black: {
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      hoverColor: '#424242',
      fontSize: '1rem',
      fontWeight: 'bold',
      padding: {
        small: '0.5rem 1rem',
        medium: '0.75rem 1.5rem',
        large: '1rem 2rem',
      },
      borderRadius: '0px',
      textTransform: 'uppercase' as const,
    },
  },

  // Configuración de colores de marca
  colors: {
    primary: '#FFEB3B',      // Amarillo LEGO
    secondary: '#0066CC',    // Azul LEGO
    accent: '#FF6B35',       // Naranja (wishlist)
    danger: '#E60012',       // Rojo LEGO
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    black: '#000000',
    white: '#FFFFFF',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },

  // Configuración de tamaños
  sizes: {
    // Espaciado
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    // Fuentes
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    // Contenedores
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },

  // Configuración de productos
  products: {
    itemsPerPage: 20,
    maxItemsPerPage: 100,
    showDeliveryOptions: true,
    showStockQuantity: false,
    maxRelatedProducts: 4,
  },

  // Configuración de home/página principal
  home: {
    maxFeaturedProducts: 8,
    maxNewProducts: 8,
    categoryIconsCount: 5, // Número de iconos de categoría a mostrar
  },

  // Configuración de navegación
  navigation: {
    showSearchBar: true,
    showWishlist: true,
    showCart: true,
    showUserMenu: true,
  },

  // Configuración de footer
  footer: {
    showSocialLinks: true,
    showNewsletter: true,
    year: new Date().getFullYear(),
    companyName: 'CACUS GIFT COLOMBIA',
    location: 'Barranquilla, Colombia',
  },

  // Configuración de badges de productos
  badges: {
    new: {
      text: 'Nuevo',
      backgroundColor: '#4CAF50',
      textColor: '#FFFFFF',
    },
    freeShipping: {
      text: 'Envío gratis',
      backgroundColor: '#FFEB3B',
      textColor: '#000000',
    },
    discount: {
      backgroundColor: '#E60012',
      textColor: '#FFFFFF',
    },
    featured: {
      text: 'Destacado',
      backgroundColor: '#FF6B35',
      textColor: '#FFFFFF',
    },
  },

  // Configuración de animaciones
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Configuración de imágenes
  images: {
    // Using data URLs to avoid external dependencies
    productPlaceholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3EProducto%3C/text%3E%3C/svg%3E',
    avatarPlaceholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="72" fill="%236b7280"%3E%3F%3C/text%3E%3C/svg%3E',
    quality: 85,
    formats: ['image/webp', 'image/avif'],
  },
} as const;

// Tipos derivados de la configuración
export type AppLocale = typeof appSettings.app.supportedLocales[number];
export type ButtonVariant = keyof typeof appSettings.buttons;
export type ColorKey = keyof typeof appSettings.colors;

// Helper functions
export const getButtonStyle = (variant: ButtonVariant = 'primary', size: 'small' | 'medium' | 'large' = 'medium') => {
  const config = appSettings.buttons[variant];
  return {
    backgroundColor: config.backgroundColor,
    color: config.textColor,
    fontSize: config.fontSize,
    fontWeight: config.fontWeight,
    padding: config.padding[size],
    borderRadius: config.borderRadius,
    textTransform: config.textTransform,
    ':hover': {
      backgroundColor: config.hoverColor,
    },
  };
};

export const isFreeShipping = (price: number): boolean => {
  return price >= appSettings.shipping.freeShippingThreshold;
};

export default appSettings;


import { useMemo } from 'react';
import appSettings from '@/config/settings';

/**
 * Hook personalizado para acceder a la configuración de la aplicación
 */
export function useSettings() {
  return useMemo(() => appSettings, []);
}

/**
 * Hook para obtener estilos de botón
 */
export function useButtonStyles(
  variant: keyof typeof appSettings.buttons = 'primary',
  size: 'small' | 'medium' | 'large' = 'medium'
) {
  const settings = useSettings();
  const config = settings.buttons[variant];

  return useMemo(
    () => ({
      backgroundColor: config.backgroundColor,
      color: config.textColor,
      fontSize: config.fontSize,
      fontWeight: config.fontWeight,
      padding: config.padding[size],
      borderRadius: config.borderRadius,
      textTransform: config.textTransform,
    }),
    [config, size]
  );
}

/**
 * Hook para verificar si un precio califica para envío gratis
 */
export function useFreeShipping(price: number): boolean {
  const settings = useSettings();
  return useMemo(
    () => price >= settings.shipping.freeShippingThreshold,
    [price, settings.shipping.freeShippingThreshold]
  );
}

export default useSettings;


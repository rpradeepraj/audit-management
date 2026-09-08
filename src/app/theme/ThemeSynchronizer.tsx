"use client";

import { useEffect } from 'react';
import { useSettingsContext } from '../components/settings';

export default function ThemeSynchronizer() {
  const {
    themeMode,
    themeDirection,
    themeContrast,
    themeLayout,
    themeStretch,
    themeColorPresets,
    presetsColor,
  } = useSettingsContext();

  useEffect(() => {
    const root = document.documentElement;

    // 1. Dark / Light class & color-scheme
    if (themeMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }

    // 2. Data attributes for styling selectors
    root.setAttribute('data-theme-mode', themeMode);
    root.setAttribute('data-theme-preset', themeColorPresets);
    root.setAttribute('data-theme-layout', themeLayout);
    root.setAttribute('data-theme-stretch', String(themeStretch));
    root.setAttribute('data-theme-contrast', themeContrast);
    root.setAttribute('dir', themeDirection);

    // 3. Contrast class
    if (themeContrast === 'bold') {
      root.classList.add('theme-contrast-bold');
    } else {
      root.classList.remove('theme-contrast-bold');
    }

    // 4. Color preset CSS custom properties
    if (presetsColor && presetsColor.main) {
      const main = presetsColor.main;
      const light = presetsColor.light || main;
      const lighter = presetsColor.lighter || light;
      const dark = presetsColor.dark || main;
      const darker = presetsColor.darker || dark;
      const contrast = presetsColor.contrastText || '#FFFFFF';

      // Primary tokens
      root.style.setProperty('--color-primary', main);
      root.style.setProperty('--color-primary-main', main);
      root.style.setProperty('--color-primary-light', light);
      root.style.setProperty('--color-primary-lighter', lighter);
      root.style.setProperty('--color-primary-dark', dark);
      root.style.setProperty('--color-primary-darker', darker);
      root.style.setProperty('--color-primary-contrast', contrast);
      root.style.setProperty('--color-primary-lighter-bg', `${lighter}25`);
      root.style.setProperty('--color-primary-alpha-12', `${main}1f`);
      root.style.setProperty('--color-primary-alpha-24', `${main}3d`);
      root.style.setProperty('--color-primary-alpha-48', `${main}7a`);

      // Override Tailwind's default indigo palette
      root.style.setProperty('--color-indigo-50', `${lighter}25`);
      root.style.setProperty('--color-indigo-100', `${lighter}50`);
      root.style.setProperty('--color-indigo-200', lighter);
      root.style.setProperty('--color-indigo-300', light);
      root.style.setProperty('--color-indigo-400', light);
      root.style.setProperty('--color-indigo-500', main);
      root.style.setProperty('--color-indigo-600', main);
      root.style.setProperty('--color-indigo-700', dark);
      root.style.setProperty('--color-indigo-800', dark);
      root.style.setProperty('--color-indigo-900', darker);
      root.style.setProperty('--color-indigo-950', darker);
    }
  }, [
    themeMode,
    themeDirection,
    themeContrast,
    themeLayout,
    themeStretch,
    themeColorPresets,
    presetsColor,
  ]);

  return null;
}

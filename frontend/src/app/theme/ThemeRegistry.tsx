"use client";

import React from 'react';
import EmotionRegistry from './EmotionRegistry';
import ThemeProvider from './index';
import { SettingsProvider, ThemeSettings } from '../components/settings';
import ThemeSynchronizer from './ThemeSynchronizer';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <SettingsProvider>
        <ThemeProvider>
          <ThemeSettings>
            <ThemeSynchronizer />
            {children}
          </ThemeSettings>
        </ThemeProvider>
      </SettingsProvider>
    </EmotionRegistry>
  );
}

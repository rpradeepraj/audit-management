"use client";

import { useState, useEffect } from 'react';
// utils
import localStorageAvailable from '../utils/localStorageAvailable';

// ----------------------------------------------------------------------

export default function useLocalStorage(key, defaultValue) {
  const storageAvailable = localStorageAvailable();

  const [value, setValue] = useState(() => {
    if (!storageAvailable) {
      return defaultValue;
    }
    const storedValue = localStorage.getItem(key);
    return storedValue === null ? defaultValue : JSON.parse(storedValue);
  });

  useEffect(() => {
    const listener = (e) => {
      if (e.storageArea === localStorage && e.key === key) {
        setValue(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', listener);

    return () => {
      window.removeEventListener('storage', listener);
    };
  }, [key, defaultValue]);

  const setValueInLocalStorage = (newValue) => {
    setValue((currentValue) => {
      const result = typeof newValue === 'function' ? newValue(currentValue) : newValue;

      if (storageAvailable) {
        localStorage.setItem(key, JSON.stringify(result));
      }

      return result;
    });
  };

  return [value, setValueInLocalStorage];
}

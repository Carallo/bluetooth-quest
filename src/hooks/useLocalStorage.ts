import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener valor inicial
  useEffect(() => {
    const getValue = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const { value } = await Preferences.get({ key });
          if (value !== null) {
            setStoredValue(JSON.parse(value));
          }
        } else {
          // Fallback para web
          const item = window.localStorage.getItem(key);
          if (item !== null) {
            setStoredValue(JSON.parse(item));
          }
        }
      } catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    getValue();
  }, [key]);

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (Capacitor.isNativePlatform()) {
        await Preferences.set({
          key,
          value: JSON.stringify(valueToStore),
        });
      } else {
        // Fallback para web
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  };

  const removeValue = async () => {
    try {
      setStoredValue(initialValue);
      
      if (Capacitor.isNativePlatform()) {
        await Preferences.remove({ key });
      } else {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  };

  return [storedValue, setValue, removeValue, isLoading] as const;
}
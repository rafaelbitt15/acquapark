import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCookieConsent = create(
  persist(
    (set) => ({
      hasConsent: false,
      consentDate: null,
      preferences: {
        necessary: true, // Always true
        analytics: false,
        marketing: false
      },
      
      acceptAll: () => set({
        hasConsent: true,
        consentDate: new Date().toISOString(),
        preferences: {
          necessary: true,
          analytics: true,
          marketing: true
        }
      }),
      
      acceptNecessary: () => set({
        hasConsent: true,
        consentDate: new Date().toISOString(),
        preferences: {
          necessary: true,
          analytics: false,
          marketing: false
        }
      }),
      
      setPreferences: (prefs) => set({
        hasConsent: true,
        consentDate: new Date().toISOString(),
        preferences: { necessary: true, ...prefs }
      }),
      
      revokeConsent: () => set({
        hasConsent: false,
        consentDate: null,
        preferences: {
          necessary: true,
          analytics: false,
          marketing: false
        }
      })
    }),
    {
      name: 'cookie-consent-storage',
    }
  )
);
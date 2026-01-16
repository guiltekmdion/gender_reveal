/**
 * Hook personnalisé pour le formatage des dates
 * Simplifie l'usage du formatage de dates avec la configuration
 */

import { useState, useEffect } from 'react';
import { formatDate, formatDateLong, formatDateShort, formatDateTime } from '../date-utils';
import type { AppConfig } from '../storage';

/**
 * Hook pour formater les dates selon la configuration
 * Charge automatiquement la config depuis l'API
 * 
 * @returns Fonctions de formatage pré-configurées
 */
export function useDateFormat() {
  const [config, setConfig] = useState<AppConfig>({});

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const configData = await res.json();
          setConfig(configData);
        }
      } catch (error) {
        console.error('Error loading config for date formatting:', error);
      }
    };

    loadConfig();
  }, []);

  return {
    formatDate: (date: string | Date, format?: Parameters<typeof formatDate>[1]) => 
      formatDate(date, format, config),
    formatDateLong: (date: string | Date, format?: Parameters<typeof formatDateLong>[1]) => 
      formatDateLong(date, format, config),
    formatDateShort: (date: string | Date, format?: Parameters<typeof formatDateShort>[1]) => 
      formatDateShort(date, format, config),
    formatDateTime: (date: string | Date | number, format?: Parameters<typeof formatDateTime>[1]) => 
      formatDateTime(date, format, config),
    config,
  };
}

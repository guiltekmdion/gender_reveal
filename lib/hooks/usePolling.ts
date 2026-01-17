/**
 * Hook de polling robuste avec backoff exponentiel et gestion d'erreurs
 * Évite les requêtes empilées et gère les erreurs API gracieusement
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions<T> {
  fetchFn: () => Promise<T>;
  interval?: number; // Intervalle initial en ms (défaut: 10000)
  enabled?: boolean; // Si false, ne poll pas (défaut: true)
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  compareFn?: (oldData: T | null, newData: T) => boolean; // Retourne true si identique
}

interface UsePollingResult<T> {
  data: T | null;
  error: Error | null;
  isRefreshing: boolean;
  lastUpdate: number | null;
  retryCount: number;
  manualRefresh: () => Promise<void>;
}

/**
 * Hook de polling avec backoff exponentiel
 * @param options - Options de configuration
 * @returns État du polling et fonction de refresh manuel
 */
export function usePolling<T>({
  fetchFn,
  interval = 10000,
  enabled = true,
  onSuccess,
  onError,
  compareFn,
}: UsePollingOptions<T>): UsePollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isInFlightRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIntervalRef = useRef(interval);

  // Fonction de fetch avec guard in-flight
  const performFetch = useCallback(async (): Promise<void> => {
    // Guard : éviter les requêtes empilées
    if (isInFlightRef.current) {
      return;
    }

    isInFlightRef.current = true;
    setIsRefreshing(true);
    setError(null);

    try {
      const newData = await fetchFn();
      
      // Comparer avec les données précédentes si compareFn fournie
      if (compareFn && compareFn(data, newData)) {
        // Données identiques, ne pas mettre à jour
        setLastUpdate(Date.now());
        setIsRefreshing(false);
        isInFlightRef.current = false;
        return;
      }

      setData(newData);
      setLastUpdate(Date.now());
      setRetryCount(0); // Reset retry count on success
      currentIntervalRef.current = interval; // Reset interval on success
      
      if (onSuccess) {
        onSuccess(newData);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setRetryCount(prev => prev + 1);
      
      // Backoff exponentiel : 10s → 20s → 40s → 80s (max 80s)
      currentIntervalRef.current = Math.min(
        interval * Math.pow(2, retryCount),
        80000
      );
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsRefreshing(false);
      isInFlightRef.current = false;
    }
  }, [fetchFn, compareFn, data, interval, onSuccess, onError, retryCount]);

  // Refresh manuel
  const manualRefresh = useCallback(async (): Promise<void> => {
    // Reset retry count et interval pour refresh manuel
    setRetryCount(0);
    currentIntervalRef.current = interval;
    await performFetch();
  }, [performFetch, interval]);

  // Effet principal de polling
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Fetch initial
    performFetch();

    // Fonction de scheduling avec backoff
    const scheduleNext = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        performFetch().then(() => {
          scheduleNext();
        });
      }, currentIntervalRef.current);
    };

    // Démarrer le polling
    scheduleNext();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, performFetch]);

  return {
    data,
    error,
    isRefreshing,
    lastUpdate,
    retryCount,
    manualRefresh,
  };
}

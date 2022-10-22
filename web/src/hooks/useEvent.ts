import { useCallback, useLayoutEffect, useRef } from 'react';

export function useEvent<T extends (...args: any[]) => void>(handler: T): T {
  const handlerRef = useRef<T>();

  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback((...args: Parameters<T>) => {
    // In a real implementation, this would throw if called during render
    const fn = handlerRef.current;
    // @ts-ignore
    return fn?.(...args);
  }, []) as T;
}

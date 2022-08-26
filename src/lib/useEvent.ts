import { useCallback, useLayoutEffect, useRef } from 'react';


function useEvent<T extends Function>(handler: T) {
  const handlerRef = useRef<T | null>(null);

  handlerRef.current = handler;

  return useCallback((...args) => {
    const fn = handlerRef.current;
    return fn?.(...args);
  }, []) as unknown as T;
}

export default useEvent;

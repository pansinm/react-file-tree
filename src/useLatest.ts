import { useCallback, useRef } from 'react';


function useLatest<T extends Function>(handler: T) {
  const handlerRef = useRef<T | null>(null);

  handlerRef.current = handler;

  return useCallback((...args) => {
    const fn = handlerRef.current;
    return fn?.(...args);
  }, []) as unknown as T;
}

export default useLatest;

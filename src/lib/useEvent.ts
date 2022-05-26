import { useCallback, useLayoutEffect, useRef } from 'react';


function useEvent<T extends Function>(handler: T) {
  const handlerRef = useRef<T | null>(null);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback((...args) => {
    const fn = handlerRef.current;
    return fn?.(...args);
  }, []);
}

export default useEvent;

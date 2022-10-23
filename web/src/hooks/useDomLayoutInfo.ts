import { useState, useEffect, RefObject } from 'react';

export function useDomLayoutInfo(domRef: RefObject<HTMLElement>) {
  const [layoutInfo, setLayoutInfo] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!domRef.current) {
      return;
    }

    const { clientWidth, clientHeight } = domRef.current;

    setLayoutInfo({ width: clientWidth, height: clientHeight });
  }, []);

  return { layoutInfo };
}

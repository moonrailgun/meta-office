import { useState, useEffect, RefObject } from 'react';
import { useEvent } from './useEvent';

export function useDomLayoutInfo(domRef: RefObject<HTMLElement>) {
  const [layoutInfo, setLayoutInfo] = useState({
    width: 0,
    height: 0,
  });

  const init = useEvent(() => {
    if (!domRef.current) {
      return setTimeout(() => {
        init();
      }, 100);
    }

    const { clientWidth, clientHeight } = domRef.current;

    setLayoutInfo({ width: clientWidth, height: clientHeight });
  });

  useEffect(() => {
    init();
  }, [init]);

  return { layoutInfo };
}

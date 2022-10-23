import { useCallback, useRef } from 'react';
import { PositionType } from '../const';
import { Position } from '../type';
import { useDomLayoutInfo } from './useDomLayoutInfo';
import { useEvent } from './useEvent';

export type PositionTransformer = (
  position: Position,
  positionType: PositionType
) => Position;

export function usePlayground() {
  const playgroundRef = useRef(null);
  const { layoutInfo } = useDomLayoutInfo(playgroundRef);

  const positionTransformer = useEvent(
    ({ x, y }: Position = { x: 0, y: 0 }, transformType: PositionType) => {
      const { width, height } = layoutInfo;

      const halfWith = width / 2;
      const halfHeight = height / 2;

      if (transformType === PositionType.Absolute) {
        return {
          x: x + halfWith,
          y: y + halfHeight,
        };
      } else {
        return {
          x: x - halfWith,
          y: y - halfHeight,
        };
      }
    }
  );

  return {
    playgroundRef,
    layoutInfo,
    positionTransformer,
  };
}

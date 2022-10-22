import { debounce } from 'lodash-es';
import { RefObject, useEffect, useRef, useState } from 'react';
import { MoveDirection, MoveType, PositionType } from '../const';
import { Position } from '../type';
import { useEvent } from './useEvent';

// 按Alt键快速移动倍速
const AltMoveMultiple = 5;

// 每次移动增量
const BaseMoveIncrement = 3;

const MoveValueMap: Record<MoveDirection, Position> = {
  [MoveDirection.ArrowUp]: { x: 0, y: -BaseMoveIncrement },
  [MoveDirection.ArrowDown]: { x: 0, y: +BaseMoveIncrement },
  [MoveDirection.ArrowLeft]: { x: -BaseMoveIncrement, y: 0 },
  [MoveDirection.ArrowRight]: { x: +BaseMoveIncrement, y: 0 },
};

export type PositionTransformer = (
  position: Position,
  positionType: PositionType
) => Position;

export function useMoveControl({
  containerRef,
  position = { x: 0, y: 0 },
  onPositionChange,
}: {
  containerRef: RefObject<HTMLElement>;
  position?: Position;
  onPositionChange: (position: Position) => void;
}) {
  const [{ width, height }, setContainerLayoutInfo] = useState({
    width: 0,
    height: 0,
  });

  const [inKeyboardMove, setInKeyboardMove] = useState(false);

  const resetInKeyboardMove = useEvent(
    debounce(() => {
      setInKeyboardMove(false);
    }, 500)
  );

  const positionTransformer = useEvent(
    ({ x, y }: Position = { x: 0, y: 0 }, transformType: PositionType) => {
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

  const handleKeyboardMove = useEvent((e: KeyboardEvent) => {
    const move = MoveValueMap[e.key as MoveDirection];
    if (!move) return;

    const { x, y } = move;

    const isPressAlt = e.altKey;

    setInKeyboardMove(true);
    resetInKeyboardMove();

    onPositionChange({
      x: position.x + (isPressAlt ? x * AltMoveMultiple : x),
      y: position.y + (isPressAlt ? y * AltMoveMultiple : y),
    });
  });

  const handleMousedown = useEvent((e: MouseEvent) => {
    if (e.target !== containerRef.current) return;

    // 将本地绝对位置转为相对位置再发送出去
    onPositionChange(
      positionTransformer(
        {
          x: e.offsetX,
          y: e.offsetY,
        },
        PositionType.Relative
      )
    );
  });

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const { clientWidth, clientHeight } = containerRef.current;

    setContainerLayoutInfo({ width: clientWidth, height: clientHeight });

    window.addEventListener('keydown', handleKeyboardMove);
    containerRef.current.addEventListener('click', handleMousedown);

    return () => {
      if (!containerRef.current) {
        return;
      }

      window.removeEventListener('keydown', handleKeyboardMove);
      containerRef.current.removeEventListener('click', handleMousedown);
    };
  }, []);

  return { position, positionTransformer, inKeyboardMove };
}

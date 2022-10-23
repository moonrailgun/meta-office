import { debounce } from 'lodash-es';
import { RefObject, useEffect, useState } from 'react';
import { MoveDirection } from '../const';
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

export function useMoveControl({
  containerRef,
  position = { x: 0, y: 0 },
  onPositionChange,
}: {
  containerRef: RefObject<HTMLElement>;
  position?: Position;
  onPositionChange: (position: Position) => void;
}) {
  const [inKeyboardMove, setInKeyboardMove] = useState(false);

  const resetInKeyboardMove = useEvent(
    debounce(() => {
      setInKeyboardMove(false);
    }, 500)
  );

  const handleKeyboardMove = useEvent((e: KeyboardEvent) => {
    const move = MoveValueMap[e.key as MoveDirection];
    if (!move) return;

    const { x, y } = move;

    const isPressAlt = e.shiftKey;

    setInKeyboardMove(true);
    resetInKeyboardMove();

    onPositionChange({
      x: position.x + (isPressAlt ? x * AltMoveMultiple : x),
      y: position.y + (isPressAlt ? y * AltMoveMultiple : y),
    });
  });

  const handleMousedown = useEvent((e: MouseEvent) => {
    if (e.target !== containerRef.current) return;

    onPositionChange({
      x: e.offsetX,
      y: e.offsetY,
    });
  });

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

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

  return { position, inKeyboardMove };
}

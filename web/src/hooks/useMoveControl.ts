import { RefObject, useEffect, useRef, useState } from 'react';
import { MoveDirection, MoveType } from '../const';
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

export function useMoveControl(containerRef: RefObject<HTMLElement>) {
  const [layoutInfo, setContainerLayoutInfo] = useState({
    width: 0,
    height: 0,
  });

  const [moveType, setMoveType] = useState<MoveType>(MoveType.Keyboard);

  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const handleKeyboardMove = useEvent((e: KeyboardEvent) => {
    const move = MoveValueMap[e.key as MoveDirection];
    if (!move) return;

    const { x, y } = move;

    const isPressAlt = e.altKey;

    setMoveType(MoveType.Keyboard);

    setPosition({
      x: position.x + (isPressAlt ? x * AltMoveMultiple : x),
      y: position.y + (isPressAlt ? y * AltMoveMultiple : y),
    });
  });

  const handleMousedown = useEvent((e: MouseEvent) => {
    if (e.target !== containerRef.current) return;

    setMoveType(MoveType.Mouse);

    setPosition({
      x: e.offsetX,
      y: e.offsetY,
    });
  });

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const { clientWidth, clientHeight } = containerRef.current;

    setContainerLayoutInfo({ width: clientWidth, height: clientHeight });

    setPosition({ x: clientWidth / 2, y: clientHeight / 2 });

    window.addEventListener('keydown', handleKeyboardMove);
    containerRef.current.addEventListener('mousedown', handleMousedown);

    return () => {
      if (!containerRef.current) {
        return;
      }

      window.removeEventListener('keydown', handleKeyboardMove);
      containerRef.current.removeEventListener('mousedown', handleMousedown);
    };
  }, []);

  return { position, moveType };
}

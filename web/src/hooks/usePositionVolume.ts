import { Position } from '../type';
import { useEvent } from './useEvent';

const DistanceVolume: [[number, number], [number, number]][] = [
  [
    // Distance Area
    [0, 200],
    // Volume Area
    [1, 0.8],
  ],
  [
    [200, 300],
    [0.8, 0.6],
  ],
  [
    [300, 400],
    [0.6, 0.4],
  ],
  [
    [400, 450],
    [0.4, 0.2],
  ],
  [
    [450, 500],
    [0.2, 0.1],
  ],
  [
    [500, Infinity],
    [0, 0],
  ],
];

export function usePositionVolume(selfPosition: Position) {
  const calcPositionVolume = useEvent(({ x: xB, y: yB }: Position) => {
    const { x: xA, y: yA } = selfPosition;

    const distance = Math.sqrt(Math.pow(xA - xB, 2) + Math.pow(yA - yB, 2));

    const target = DistanceVolume.find(
      ([dis]) => distance >= dis[0] && distance < dis[1]
    )!;

    const [[minDis, maxDis], [maxVolume, minVolume]] = target;

    const over = distance - minDis;
    const percent = over / (maxDis - minDis);

    const volume = minVolume + percent * (maxVolume - minVolume);

    return volume;
  });

  return { calcPositionVolume };
}

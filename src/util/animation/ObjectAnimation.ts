import { IAnimationTicker } from "../../interfaces/IAnimationTicker";
import { RoomPosition } from "../../types/RoomPosition";

export class ObjectAnimation {
  private current: RoomPosition | undefined;
  private diff: RoomPosition | undefined;
  private currentFrame: number = 0;
  private enqueued: {
    currentPosition: RoomPosition;
    newPosition: RoomPosition;
    direction: number;
  }[] = [];

  constructor(
    private animationTicker: IAnimationTicker,
    private callbacks: {
      onUpdatePosition: (position: RoomPosition, direction: number) => void;
      onStart: (direction: number) => void;
      onStop: () => void;
    },
    private frameDuration: number = 12
  ) {}

  walk(
    currentPos: { roomX: number; roomY: number; roomZ: number },
    newPos: { roomX: number; roomY: number; roomZ: number },
    direction: number
  ) {
    if (this.diff != null) {
      this.enqueued.push({
        currentPosition: currentPos,
        newPosition: newPos,
        direction: direction,
      });
      return;
    }

    this.callbacks.onStart(direction);

    this.current = currentPos;
    this.diff = {
      roomX: newPos.roomX - currentPos.roomX,
      roomY: newPos.roomY - currentPos.roomY,
      roomZ: newPos.roomZ - currentPos.roomZ,
    };
    this.currentFrame = 0;

    const handleFinish = () => {
      this.diff = undefined;
      this.current = undefined;

      const next = this.enqueued.shift();
      if (next != null) {
        this.walk(next.currentPosition, next.newPosition, next.direction);
      } else {
        this.callbacks.onStop();
      }

      cancel();
    };

    const cancel = this.animationTicker.subscribe(() => {
      const factor = this.currentFrame / (this.frameDuration - 1);
      const current = this.current;
      const diff = this.diff;

      if (current != null && diff != null) {
        this.callbacks.onUpdatePosition(
          {
            roomX: current.roomX + diff.roomX * factor,
            roomY: current.roomY + diff.roomY * factor,
            roomZ: current.roomZ + diff.roomZ * factor,
          },
          direction
        );
      }

      if (factor >= 1) {
        handleFinish();
        return;
      }

      this.currentFrame++;
    });
  }
}
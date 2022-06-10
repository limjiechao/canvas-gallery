import { Coordinates } from './indexed.db';
import { SelectionCoordinates } from './canvas.render';
import { log } from './logging';

type MouseButtonState = 'up' | 'down';

const mouseButton = {
  _state: 'up' as MouseButtonState,
  get isUp(): boolean {
    return this._state === 'up';
  },
  set state(upOrDown: MouseButtonState) {
    this._state = upOrDown;
  },
};

const mouseMove = {
  _start: NaN as number,
  _end: NaN as number,
  get isMoving(): boolean {
    return !Number.isNaN(this._start);
  },
  get duration(): number {
    if (Number.isNaN(this._start) && Number.isNaN(this._end)) {
      return 0;
    }

    return this._end - this._start;
  },
  get rejectionThreshold(): number {
    return 250;
  },
  get durationExceedsRejectionThreshold(): boolean {
    return this.duration > this.rejectionThreshold;
  },
  begin() {
    if (this.isMoving) return;

    this._start = performance.now();
  },
  stop() {
    if (!this.isMoving) return;

    this._end = performance.now();
  },
  reset() {
    this._start = NaN;
    this._end = NaN;
  },
};

interface Delta {
  dx: number;
  dy: number;
}

const selection = {
  _start: { x: NaN, y: NaN } as Coordinates,
  _end: { x: NaN, y: NaN } as Coordinates,
  set start({ x, y }: Coordinates) {
    this._start.x = x;
    this._start.y = y;
  },
  set end({ x, y }: Coordinates) {
    this._end.x = x;
    this._end.y = y;
  },
  get coordinates(): SelectionCoordinates {
    return {
      start: this._start,
      end: this._end,
    };
  },
  get delta(): Delta {
    return {
      dx: Math.abs(this._end.x - this._start.x),
      dy: Math.abs(this._end.y - this._start.y),
    };
  },
  get rejectionThreshold(): Delta {
    return {
      dx: 20,
      dy: 20,
    };
  },
  get deltaExceedsRejectionThreshold(): boolean {
    return (
      this.delta.dx > this.rejectionThreshold.dx &&
      this.delta.dy > this.rejectionThreshold.dy
    );
  },
  reset() {
    this.start = { x: NaN, y: NaN };
    this.end = { x: NaN, y: NaN };
  },
};

export function updateMouseButtonIsUp() {
  log(updateMouseButtonIsUp.name);
  mouseButton.state = 'up';
}

export function updateMouseButtonIsDown() {
  log(updateMouseButtonIsDown.name);
  mouseButton.state = 'down';
}

export function mouseButtonIsUp() {
  log(mouseButtonIsUp.name);
  return mouseButton.isUp;
}

export function updateMouseMoveHasBegun() {
  log(updateMouseMoveHasBegun.name);
  mouseMove.begin();
}

export function updateMouseMoveHasStopped() {
  log(updateMouseMoveHasStopped.name);
  mouseMove.stop();
}

export function mouseMoveDurationExceedsRejectionThreshold() {
  log(mouseMoveDurationExceedsRejectionThreshold.name);
  return mouseMove.durationExceedsRejectionThreshold;
}

export function resetMouseMoveTracking() {
  log(resetMouseMoveTracking.name);
  mouseMove.stop();
}

export function updateSelectionStart(event: MouseEvent) {
  log(updateSelectionStart.name);
  selection.start = { x: event.offsetX, y: event.offsetY };
}

export function updateSelectionEnd(event: MouseEvent) {
  log(updateSelectionEnd.name);
  selection.end = { x: event.offsetX, y: event.offsetY };
}

export function resetSelectionTracking() {
  log(resetSelectionTracking.name);
  selection.reset();
}

export function selectionCoordinates() {
  log(selectionCoordinates.name);
  return selection.coordinates;
}

export function selectionDeltaExceedsRejectionThreshold() {
  log(selectionDeltaExceedsRejectionThreshold.name);
  return selection.deltaExceedsRejectionThreshold;
}

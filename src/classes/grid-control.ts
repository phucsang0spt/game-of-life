import { Point } from "react-simple-game-engine/lib/export-types";
import { genId } from "utils";

type J = number; // x-axis
type I = number; // y-axis
export type CellIndex = [J, I];

const ZOOM_SPEED = 0.01;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.1;

export class GridControl {
  private _generationCount = 0;
  private _scale = 1;

  private resetZoomTimer: NodeJS.Timeout;
  private readonly edge: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  public readonly lines: { pt1: Point; pt2: Point }[] = [];
  public readonly cells: Cell[][] = [];
  public readonly vCellAmount: number;
  public readonly hCellAmount: number;
  constructor(
    public readonly cellSize: number,
    public readonly width: number,
    public readonly height: number
  ) {
    const position = {
      x: 0,
      y: 0,
    };
    this.vCellAmount = Math.ceil(width / cellSize);
    this.hCellAmount = Math.ceil(height / cellSize);
    this.edge = {
      left: position.x - width / 2,
      right: position.x + width / 2,
      top: position.y - height / 2,
      bottom: position.y + height / 2,
    };
    this.setup();
  }

  get generationCount() {
    return this._generationCount;
  }

  get scale() {
    return this._scale;
  }

  clearResetZoom() {
    clearInterval(this.resetZoomTimer);
    this.resetZoomTimer = undefined;
  }

  async resetZoom() {
    if (this.resetZoomTimer) {
      return;
    }
    const dir = 1 > this._scale ? 1 : -1;
    return new Promise((res) => {
      this.resetZoomTimer = setInterval(() => {
        this._scale =
          dir > 0
            ? Renderer.constrainMax(this._scale + dir * 0.05, 1)
            : Renderer.constrainMin(this._scale + dir * 0.05, 1);
        if (this._scale === 1) {
          this.clearResetZoom();
          res(null);
        }
      }, 10);
    });
  }

  zoomIn() {
    this.clearResetZoom();
    this._scale = Renderer.constrainMax(this._scale + ZOOM_SPEED, MAX_ZOOM);
  }

  zoomOut() {
    this.clearResetZoom();
    this._scale = Renderer.constrainMin(this._scale - ZOOM_SPEED, MIN_ZOOM);
  }

  private setupLines() {
    const { left, top, right, bottom } = this.edge;
    Array.from({ length: this.vCellAmount }).forEach((_, i) => {
      if (i !== 0) {
        const x = left + i * this.cellSize;
        this.lines.push({
          pt1: { x, y: top },
          pt2: { x, y: bottom },
        });
      }
    });
    Array.from({ length: this.hCellAmount }).forEach((_, i) => {
      if (i !== 0) {
        const y = top + i * this.cellSize;
        this.lines.push({
          pt1: { x: left, y },
          pt2: { x: right, y },
        });
      }
    });
  }

  private setupCells() {
    const { left, top } = this.edge;
    Array.from({ length: this.hCellAmount }).forEach((_, iRow) => {
      const y = top + iRow * this.cellSize;
      const cellRows: Cell[] = [];
      Array.from({ length: this.vCellAmount }).forEach((_, iCol) => {
        const x = left + iCol * this.cellSize;
        const c = new Cell({ x, y }, this.cellSize, [iCol, iRow]);
        cellRows.push(c);
      });
      this.cells.push(cellRows);
    });
  }

  public setPattern(pattern: CellIndex[], override = true) {
    if (override) {
      this.cells.forEach((cells) =>
        cells.forEach((cell) => (cell.isLive = false))
      );
      this._generationCount = 0;
    }
    const newLiveCells: Cell[] = [];
    for (const [j, i] of pattern) {
      const cell = this.cells[i]?.[j];
      if (cell) {
        cell.isLive = true;
        newLiveCells.push(cell);
      }
    }
    return newLiveCells;
  }

  setup() {
    this.setupLines();
    this.setupCells();
  }

  private getNeighborCount([j, i]: CellIndex) {
    let count = 0;

    const currentRow = this.cells[i];
    const aboveRow = this.cells[i - 1];
    const underRow = this.cells[i + 1];

    if (aboveRow) {
      // top neighbor
      if (aboveRow[j]?.isLive) {
        count++;
      }
      // top-left neighbor
      if (aboveRow[j - 1]?.isLive) {
        count++;
      }
      // top-right neighbor
      if (aboveRow[j + 1]?.isLive) {
        count++;
      }
    }

    if (underRow) {
      // bottom neighbor
      if (underRow[j]?.isLive) {
        count++;
      }

      // bottom-left neighbor
      if (underRow[j - 1]?.isLive) {
        count++;
      }
      // bottom-right neighbor
      if (underRow[j + 1]?.isLive) {
        count++;
      }
    }

    if (currentRow) {
      // left neighbor
      if (currentRow[j - 1]?.isLive) {
        count++;
      }
      // right neighbor
      if (currentRow[j + 1]?.isLive) {
        count++;
      }
    }

    return count;
  }

  pointToIndex(point: Point): CellIndex | null {
    let targetI: number, targetJ: number;
    this.cells.forEach((cells, i) => {
      if (cells[0].top < point.y && point.y <= cells[0].bottom) {
        targetI = i;
      }
      cells.forEach((cell, j) => {
        if (cell.left < point.x && point.x <= cell.right) {
          targetJ = j;
        }
      });
    });
    return targetI != null ? [targetJ, targetI] : null;
  }

  getCell([j, i]: CellIndex) {
    const cell = this.cells[i]?.[j];
    return cell;
  }

  turnOnCell(index: CellIndex) {
    const cell = this.getCell(index);
    if (cell && !cell.isLive) {
      cell.isLive = true;
      cell.isFresh = true;
      return true;
    }
    return false;
  }

  nextGeneration() {
    this._generationCount++;
    const nextGeneration: [CellIndex, boolean][] = [];
    this.cells.forEach((cells, i) => {
      cells.forEach((cell, j) => {
        //skip fresh cell;
        if (cell.isFresh) {
          return;
        }
        const neighborCount = this.getNeighborCount([j, i]);

        // is dead
        if (neighborCount < 2 || neighborCount > 3) {
          nextGeneration.push([[j, i], false]);
        } else if (
          // is birth
          !cell.isLive &&
          neighborCount === 3
        ) {
          nextGeneration.push([[j, i], true]);
        }
      });
    });
    const cellsChange: Cell[] = [];
    for (const [[j, i], isLive] of nextGeneration) {
      const cell = this.cells[i][j];
      cell.isLive = isLive;
      cellsChange.push(cell);
    }
    return cellsChange;
  }
}

export class Cell {
  public readonly left: number;
  public readonly top: number;
  public readonly right: number;
  public readonly bottom: number;
  public readonly id = genId(24);
  public isLive: boolean = false;
  private _isFresh: boolean = false;
  private freshTimer: NodeJS.Timeout;

  constructor(
    point: Point,
    public readonly size: number,
    public readonly index: CellIndex
  ) {
    this.left = point.x;
    this.top = point.y;
    this.right = this.left + size;
    this.bottom = this.top + size;
  }

  get isFresh() {
    return this._isFresh;
  }

  set isFresh(value: boolean) {
    clearTimeout(this.freshTimer);
    this._isFresh = value;
    if (value) {
      this.freshTimer = setTimeout(() => {
        this._isFresh = false;
      }, 100);
    }
  }
}

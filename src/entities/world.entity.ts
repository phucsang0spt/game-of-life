import { Cell, CellIndex, GridControl } from "classes/grid-control";
import {
  ColorSprite,
  LogicComponent,
  RectEntity,
} from "react-simple-game-engine";
import { JoystickActionType } from "react-simple-game-engine/lib/export-enums";

import {
  EntityPrepare,
  Vector,
} from "react-simple-game-engine/lib/export-types";

type Props = {
  gridControl: GridControl;
};

enum ZoomState {
  IN,
  OUT,
  NONE,
}

export class WorldEntity extends RectEntity<Props> {
  private _isGenerating = false;
  private gridControl: GridControl;
  private initialPattern: CellIndex[];
  private drawingCells: Cell[] = [];
  private lastMove: Vector;
  private zoomState = ZoomState.NONE;
  private fixedEdge: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  public canSpawn = true;
  public liveCellColor = [51, 153, 204];

  protected onPrepare(): EntityPrepare<this> {
    this.gridControl = this.props.gridControl;
    return {
      sprite: new LogicComponent([
        ColorSprite,
        {
          source: [62, 87, 112, 0],
        },
      ]),
      transform: {
        x: 0,
        y: 0,
        width: this.gridControl.width,
        height: this.gridControl.height,
      },
      enabledPhysicBody: false,
    };
  }

  get zoomValue() {
    return this.gridControl.scale;
  }
  set isGenerating(value: boolean) {
    this._isGenerating = value;
    this.scene.emitEntityPropsChangeEvent("isGenerating", value);
  }

  private emitGenerationCount() {
    this.scene.emitEntityPropsChangeEvent(
      "generationCount",
      this.gridControl.generationCount
    );
  }

  private emitLiveCellCount() {
    this.scene.emitEntityPropsChangeEvent(
      "liveCellCount",
      this.drawingCells.length
    );
  }

  private emitZoomValue() {
    this.scene.emitEntityPropsChangeEvent("zoom", this.gridControl.scale);
  }

  private rememberInitialPattern() {
    this.initialPattern = [];
    for (const cell of this.drawingCells) {
      this.initialPattern.push(cell.index);
    }
  }

  async resetZoom() {
    await this.gridControl.resetZoom();
    this.emitZoomValue();
  }

  stopZoom() {
    this.zoomState = ZoomState.NONE;
  }

  zoomIn() {
    this.zoomState = ZoomState.IN;
  }

  zoomOut() {
    this.zoomState = ZoomState.OUT;
  }

  startGenerating() {
    if (!this.initialPattern) {
      this.rememberInitialPattern();
    }
    this.isGenerating = true;
  }

  stopGenerating() {
    this.isGenerating = false;
  }

  clearPattern() {
    this.setInitPattern([], true);
  }

  resetPattern() {
    this.setInitPattern(this.initialPattern || []);
  }

  setInitPattern(pattern: CellIndex[], isClear = false) {
    // reset camera to center
    this.renderer.simpleCamera.x = 0;
    this.renderer.simpleCamera.y = 0;

    this.drawingCells = [];
    const newLiveCells = this.gridControl.setPattern(pattern, true);
    this.drawingCells.push(...newLiveCells);
    this.emitGenerationCount();
    this.emitLiveCellCount();

    // if is clear action then not set initial pattern
    if (!isClear) {
      this.initialPattern = pattern;
    }
  }

  private handleSpawnCell() {
    if (!this.canSpawn) {
      return;
    }
    const target = this.gridControl.pointToIndex({
      x: this.renderer.realMouseX / this.gridControl.scale,
      y: this.renderer.realMouseY / this.gridControl.scale,
    });
    if (target) {
      const isOk = this.gridControl.turnOnCell(target);
      if (isOk) {
        // add live cell to drawing list
        const cell = this.gridControl.getCell(target);
        this.drawingCells.push(cell);
        this.emitLiveCellCount();
      }
    }
  }

  private handleGenerating() {
    if (!this._isGenerating) {
      return;
    }
    const cellsChange = this.gridControl.nextGeneration();

    const existDrawingCells = this.drawingCells.reduce<Record<string, Cell>>(
      (hs, cell) => ({ ...hs, [cell.id]: cell }),
      {}
    );
    for (const cell of cellsChange) {
      if (!existDrawingCells[cell.id] && cell.isLive) {
        this.drawingCells.push(cell);
      }
    }
    this.drawingCells = this.drawingCells.filter((cell) => cell.isLive);
    this.emitGenerationCount();
    this.emitLiveCellCount();
  }

  private constrainCamera() {
    const edge = this.fixedEdge;
    const viewport = this.renderer.scaler.viewport;
    const scale = this.gridControl.scale;
    const viewportPartWidth = viewport.width / 2;
    const viewportPartHeight = viewport.height / 2;

    this.simpleCamera.x = this.renderer.constrain(
      this.simpleCamera.x,
      (edge.left + viewportPartWidth) * scale,
      (edge.right - viewportPartWidth) * scale
    );
    this.simpleCamera.y = this.renderer.constrain(
      this.simpleCamera.y,
      (edge.top + viewportPartHeight) * scale,
      (edge.bottom - viewportPartHeight) * scale
    );
  }

  private handleMoveCamera() {
    this.simpleCamera.x += this.lastMove.x;
    this.simpleCamera.y += this.lastMove.y;
    this.constrainCamera();
  }

  private handleJoystickMovement() {
    this.scene.onJoystickAction((data) => {
      if (data.type === JoystickActionType.MOVE) {
        this.lastMove = data.vector.mult(0.9 * (data.length / 10));
      } else {
        this.lastMove = undefined;
      }
    });
  }

  private handleZoom() {
    if (this.zoomState === ZoomState.IN) {
      this.gridControl.zoomIn();
      this.emitZoomValue();
      this.constrainCamera();
    } else if (this.zoomState === ZoomState.OUT) {
      this.gridControl.zoomOut();
      this.emitZoomValue();
      this.constrainCamera();
    }
  }

  private promptToPattern(prompt: string) {
    const matrix = prompt
      .trim()
      .split("\n")
      .map((row) => row.split(""));

    if (!matrix.length) {
      return [];
    }

    function isDeadCell(char: string) {
      return char === "-" || char === ".";
    }

    const pattern: CellIndex[] = [];
    for (const iRow in matrix) {
      for (const iCol in matrix[iRow]) {
        const col = matrix[iRow][iCol];
        if (!isDeadCell(col)) {
          pattern.push([+iCol, +iRow]);
        }
      }
    }

    // max col
    const maxColAmount = matrix.reduce(
      (max, row) => (row.length > max ? row.length : max),
      matrix[0].length
    );

    const { vCellAmount, hCellAmount } = this.gridControl;
    return pattern.map(
      (items) =>
        [
          items[0] + Math.ceil(vCellAmount / 2 - maxColAmount / 2),
          items[1] + Math.ceil(hCellAmount / 2 - matrix.length / 2),
        ] as CellIndex
    );
  }

  setPatternFromPrompt(prompt: string) {
    if (prompt?.trim()) {
      const pattern = this.promptToPattern(prompt);
      this.setInitPattern(pattern);
    }
  }

  // private handleSpawnState() {
  //   const { left, top, bottom, right } = this.playBtnEl.getBoundingClientRect();
  //   const { x: mouseX, y: mouseY } = this.renderer.mouseScreen;
  //   if (
  //     left <= mouseX &&
  //     mouseX <= right &&
  //     top <= mouseY &&
  //     mouseY <= bottom
  //   ) {
  //     this._canSpawn = false;
  //   } else {
  //     this._canSpawn = true;
  //   }
  // }

  onActive() {
    this.fixedEdge = this.edge;
    this.onTimer(50, () => {
      this.handleGenerating();
    });
    this.handleJoystickMovement();
    // this.setInitPattern(getTestPattern());
  }

  onUpdate(): void {
    if (this.renderer.mouseIsPressed) {
      this.handleSpawnCell();
    }
    if (this.lastMove) {
      this.handleMoveCamera();
    }

    this.handleZoom();
  }

  onDraw() {
    const [r, g, b] = this.liveCellColor;
    this.renderer.rectMode(Renderer.CORNER);
    this.renderer.drawHandle(this.position, () => {
      this.renderer.scale(this.gridControl.scale);

      this.renderer.stroke(70, 74, 79);
      this.renderer.noFill();
      for (const line of this.gridControl.lines) {
        const { pt1, pt2 } = line;
        this.renderer.line(pt1.x, pt1.y, pt2.x, pt2.y);
      }

      this.renderer.noStroke();
      for (const cell of this.drawingCells) {
        if (cell.isFresh) {
          this.renderer.fill(r, g, b, 100);
        } else {
          this.renderer.fill(r, g, b);
        }
        this.renderer.rect(cell.left, cell.top, cell.size, cell.size);
      }
    });
  }
}

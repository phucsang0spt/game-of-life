import {
  LogicComponent,
  Scene,
  SceneTag,
  SceneUI,
} from "react-simple-game-engine";

import { MainUI } from "./ui/main.ui";

import { WorldEntity } from "entities/world.entity";
import { GridControl } from "classes/grid-control";

@SceneTag("main")
@SceneUI(MainUI)
export class MainScene extends Scene<{}> {
  private readonly gridControl = new GridControl(15, 2400, 2400);
  onBootstrapDone() {
    //
  }

  getInitialData() {
    return {
      joystick: true,
    };
  }

  getComponents() {
    return [
      new LogicComponent([
        WorldEntity,
        {
          props: {
            gridControl: this.gridControl,
          },
        },
      ]),
    ];
  }
}

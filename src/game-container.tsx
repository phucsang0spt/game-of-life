import styled from "styled-components";
import { GameBootstrap } from "react-simple-game-engine";
import { useWindowSize } from "react-simple-game-engine/lib/utils";

import { toCorrectPixel } from "px";

import { MainScene } from "scenes/main.scene";
import { AssetLoader } from "components/asset-loader";
import joystickImage from "assets/joystick.svg";
import joystickContainerImage from "assets/circle.svg";

const Root = styled.div`
  width: 100%;
  height: 100vh;
`;

export function GameContainer() {
  const size = useWindowSize();
  const isDesktop = size.width >= 520 && size.width >= size.height;
  const resolution = isDesktop
    ? {
        width: size.width,
        height: size.height,
      }
    : {
        width: 720,
        height: 1280,
      };

  const joystickSize = toCorrectPixel(100, true);
  return (
    <Root>
      <GameBootstrap
        assetsLoader={<AssetLoader />}
        scenes={[MainScene]}
        joystick={{
          bottom: 40,
          left: 40,
          props: {
            size: joystickSize,
            baseImage: joystickContainerImage,
            stickImage: joystickImage,
          },
        }}
        {...resolution}
      />
    </Root>
  );
}

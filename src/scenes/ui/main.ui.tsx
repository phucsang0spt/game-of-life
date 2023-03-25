import styled from "styled-components";
import {
  Control,
  ControlContainer,
  useEntity,
  Watcher,
} from "react-simple-game-engine/lib/utilities";
import { useRef } from "react";

import { FiCpu } from "@react-icons/all-files/fi/FiCpu";
import { FiPlay } from "@react-icons/all-files/fi/FiPlay";
import { FiPause } from "@react-icons/all-files/fi/FiPause";
import { FiZoomIn } from "@react-icons/all-files/fi/FiZoomIn";
import { FiZoomOut } from "@react-icons/all-files/fi/FiZoomOut";
import { MdRefresh } from "@react-icons/all-files/md/MdRefresh";
import { MdClear } from "@react-icons/all-files/md/MdClear";

import { WorldEntity } from "entities/world.entity";

import { toCorrectPixel } from "px";
import { LiveColorPicker } from "components/cell-color-picker";
import { PatternPrompt, PatternPromptFuncs } from "components/pattern-prompt";

const iconSize = toCorrectPixel(30, true);
const distance = toCorrectPixel(30);

const Root = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  color: #fff;
`;

const Info = styled.p`
  font-size: ${toCorrectPixel(18)}px;
  line-height: ${toCorrectPixel(18)}px;
`;

const ZoomInfo = styled.div`
  width: ${iconSize}px;
  height: ${iconSize}px;
  position: relative;

  > div {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      position: absolute;
      top: calc(50% + 2px);
      right: 10px;

      opacity: 0;
      transform: translate(-100%, -50%);
      transition: opacity 200ms ease-in-out;

      &[data-visibility="true"] {
        opacity: 1;
      }
    }
  }
`;

export function MainUI() {
  const refPlayBtn = useRef<HTMLElement>(null);
  const [world] = useEntity(WorldEntity);
  const refPrompt = useRef<PatternPromptFuncs>(null);

  const spawnStateGuard = ({
    onDown,
    onUp,
  }: {
    onDown?: () => void;
    onUp?: () => void;
  } = {}) => {
    return {
      onPointerDown: (event: any) => {
        event.target.setPointerCapture(event.pointerId);
        world.canSpawn = false;
        onDown?.();
      },
      onPointerUp: (event: any) => {
        event.target.releasePointerCapture(event.pointerId);
        world.canSpawn = true;
        onUp?.();
      },
      onMouseLeave: () => {
        world.canSpawn = true;
        onUp?.();
      },
    };
  };

  return (
    <Root>
      <Control bottom={60} right={10}>
        <ControlContainer stack>
          <Control alignment="flex-end">
            <LiveColorPicker
              onSelected={(rgb) => {
                world.liveCellColor = rgb;
              }}
            />
          </Control>
          <Control top={20}>
            <FiCpu
              onClick={() => refPrompt.current.toggle()}
              size={iconSize * 2}
              {...spawnStateGuard()}
            />
          </Control>
        </ControlContainer>
      </Control>
      <Control top={60} right={10}>
        <ControlContainer stack>
          <Control top={0}>
            <Watcher
              names="isGenerating"
              initialValues={{
                isGenerating: 0,
              }}
            >
              {({ isGenerating }) => (
                <span ref={refPlayBtn} {...spawnStateGuard()}>
                  {isGenerating ? (
                    <FiPause
                      onClick={() => world.stopGenerating()}
                      size={iconSize}
                    />
                  ) : (
                    <FiPlay
                      onClick={() => world.startGenerating()}
                      size={iconSize}
                    />
                  )}
                </span>
              )}
            </Watcher>
          </Control>
          <Control top={distance}>
            <ControlContainer stack>
              <Control top={0}>
                <FiZoomIn
                  size={iconSize}
                  {...spawnStateGuard({
                    onDown: () => world.zoomIn(),
                    onUp: () => world.stopZoom(),
                  })}
                />
              </Control>
              <Control top={10}>
                <ZoomInfo>
                  <div>
                    <Watcher
                      names="zoom"
                      initialValues={{
                        zoom: world.zoomValue,
                      }}
                    >
                      {({ zoom }) => {
                        const value = +zoom.toFixed(1);
                        return (
                          <>
                            <MdRefresh
                              onClick={() => world.resetZoom()}
                              aria-label={zoom.toString()}
                              data-visibility={value > 1 || value < 1}
                              size={iconSize / 1.2}
                              {...spawnStateGuard()}
                            />
                            <Info>x{value}</Info>
                          </>
                        );
                      }}
                    </Watcher>
                  </div>
                </ZoomInfo>
              </Control>
              <Control top={10}>
                <FiZoomOut
                  size={iconSize}
                  {...spawnStateGuard({
                    onDown: () => world.zoomOut(),
                    onUp: () => world.stopZoom(),
                  })}
                />
              </Control>
            </ControlContainer>
          </Control>
          <Control top={distance}>
            <MdRefresh
              onClick={() => world.resetPattern()}
              size={iconSize}
              {...spawnStateGuard()}
            />
          </Control>
          <Control top={distance}>
            <MdClear
              onClick={() => world.clearPattern()}
              size={iconSize}
              {...spawnStateGuard()}
            />
          </Control>
        </ControlContainer>
      </Control>
      <Control top={65} left={10}>
        <ControlContainer stack>
          <Control top={0}>
            <Watcher
              names="generationCount"
              initialValues={{
                generationCount: 0,
              }}
            >
              {({ generationCount }) => (
                <Info>Generation: {generationCount}</Info>
              )}
            </Watcher>
          </Control>
          <Control top={10}>
            <Watcher
              names="liveCellCount"
              initialValues={{
                liveCellCount: 0,
              }}
            >
              {({ liveCellCount }) => <Info>Live cells: {liveCellCount}</Info>}
            </Watcher>
          </Control>
        </ControlContainer>
      </Control>
      <PatternPrompt
        ref={refPrompt}
        {...spawnStateGuard()}
        onApplyPattern={(text) => world.setPatternFromPrompt(text)}
      />
    </Root>
  );
}

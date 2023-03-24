import styled from "styled-components";
import {
  Control,
  ControlContainer,
  useEntity,
  Watcher,
} from "react-simple-game-engine/lib/utilities";
import { useRef, useState } from "react";

import { FiCpu } from "@react-icons/all-files/fi/FiCpu";
import { FiPlay } from "@react-icons/all-files/fi/FiPlay";
import { FiPause } from "@react-icons/all-files/fi/FiPause";
import { FiZoomIn } from "@react-icons/all-files/fi/FiZoomIn";
import { FiZoomOut } from "@react-icons/all-files/fi/FiZoomOut";
import { MdRefresh } from "@react-icons/all-files/md/MdRefresh";
import { MdClear } from "@react-icons/all-files/md/MdClear";
import { MdCheck } from "@react-icons/all-files/md/MdCheck";

import { WorldEntity } from "entities/world.entity";

import { toCorrectPixel } from "px";
import { LiveColorPicker } from "components/cell-color-picker";

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

const PatternPrompt = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  textarea {
    width: ${toCorrectPixel(300)}px;
    height: ${toCorrectPixel(300)}px;
    outline: none;
    padding: 10px;
    resize: none;
    background-color: #0000004d;
    box-shadow: 5px 5px 20px 1px #00000069;
    border-radius: 4px;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    svg {
      + svg {
        margin-left: ${toCorrectPixel(5)}px;
      }
    }
  }

  footer {
    margin-top: 5px;

    font-size: ${toCorrectPixel(16)}px;
    line-height: ${toCorrectPixel(16)}px;

    p {
      color: #a3a3a3;

      a {
        color: #39c;
      }
    }
  }
`;

const PromptPlaceholder = `Paste pattern here, example:

O.O........
.OO........
.O.........
...........
........OOO
........O..
...OOO...O.
...O.......
....O......
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
  const refPrompt = useRef<HTMLTextAreaElement>(null);
  const [showPrompt, setShowPrompt] = useState(false);

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

  const handleApplyPattern = () => {
    const text = refPrompt.current.value;
    world.setPatternFromPrompt(text);
    setShowPrompt(false);
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
              onClick={() => setShowPrompt(true)}
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
      {showPrompt && (
        <PatternPrompt {...spawnStateGuard()}>
          <header>
            <MdClear
              onClick={() => setShowPrompt(false)}
              color="#e74c3c"
              size={iconSize}
            />
            <MdCheck
              onClick={handleApplyPattern}
              color="#3498db"
              size={iconSize}
            />
          </header>
          <textarea ref={refPrompt} placeholder={PromptPlaceholder} />
          <footer>
            <p>
              List pattern{" "}
              <a
                rel="noreferrer"
                target="_blank"
                href="https://conwaylife.com/wiki/Oscillator"
              >
                Oscillator - LifeWiki
              </a>
            </p>
          </footer>
        </PatternPrompt>
      )}
    </Root>
  );
}

import {
  forwardRef,
  HTMLAttributes,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { MdClear } from "@react-icons/all-files/md/MdClear";
import { MdCheck } from "@react-icons/all-files/md/MdCheck";

import * as patterns from "patterns";
import { toCorrectPixel } from "px";

const patternOptions = Object.values(patterns).sort((a, b) =>
  a.name.localeCompare(b.name)
);
const iconSize = toCorrectPixel(30, true);
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

const Root = styled.div`
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
    margin-bottom: 5px;

    [aria-label="left"] {
      flex: 1;
      min-width: 0;
      margin-right: 10px;

      select {
        width: 100%;
        height: ${toCorrectPixel(25, true)}px;
        outline: none;
        text-align: center;
      }
    }

    [aria-label="right"] {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    svg {
      + svg {
        margin-left: ${toCorrectPixel(3)}px;
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

type PatternPromptProps = HTMLAttributes<HTMLDivElement> & {
  onApplyPattern?: (text: string) => void;
};

export type PatternPromptFuncs = {
  toggle: () => void;
};

export const PatternPrompt = forwardRef<PatternPromptFuncs, PatternPromptProps>(
  function PatternPrompt({ onApplyPattern, ...props }, ref) {
    const refPrompt = useRef<HTMLTextAreaElement>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        toggle: () => setShowPrompt((prev) => !prev),
      }),
      []
    );

    const handleApplyPattern = () => {
      const text = refPrompt.current.value;
      onApplyPattern?.(text);
      setShowPrompt(false);
    };

    const handleSelectPattern = (e: any) => {
      const value = e.target.value;
      if (value) {
        refPrompt.current.value = (patterns as any)[`P${value}`].pattern.trim();
      } else {
        refPrompt.current.value = "";
      }
      onApplyPattern?.(refPrompt.current.value);
    };

    return (
      showPrompt && (
        <Root {...props}>
          <header>
            <div aria-label="left">
              <select onChange={handleSelectPattern}>
                <option value="">---Available patterns---</option>
                {patternOptions.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
            <div aria-label="right">
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
            </div>
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
        </Root>
      )
    );
  }
);

import { toCorrectPixel } from "px";
import styled from "styled-components";
import { BlockPicker } from "react-color";
import { HTMLAttributes, useState } from "react";

const size = toCorrectPixel(30, true);
const colorList = [
  "#3399cc",
  "#D9E3F0",
  "#F47373",
  "#697689",
  "#37D67A",
  "#2CCCE4",
  "#555555",
  "#dce775",
  "#ff8a65",
  "#ba68c8",
];

const Root = styled.div<{
  color: string;
}>`
  width: ${size}px;
  height: ${size}px;
  background-color: ${({ color }) => color};
  border: 2px solid #fff;
  position: relative;

  > div {
    position: absolute;
    bottom: 0;
    right: ${size}px;
  }
`;

type LiveColorPickerProps = HTMLAttributes<HTMLDivElement> & {
  onSelected?: (rgb: [number, number, number]) => void;
};

export function LiveColorPicker({
  onSelected,
  ...props
}: LiveColorPickerProps) {
  const [visible, setVisible] = useState(false);
  const [color, setColor] = useState(colorList[0]);
  return (
    <Root onClick={() => setVisible(!visible)} color={color} {...props}>
      {visible && (
        <div onClick={(e) => e.stopPropagation()}>
          <BlockPicker
            color={color}
            onChangeComplete={(color) => {
              setColor(color.hex);
              onSelected?.([color.rgb.r, color.rgb.g, color.rgb.b]);
            }}
            triangle="hide"
            styles={{
              default: {
                input: {
                  backgroundColor: "#fff",
                },
              },
            }}
            colors={colorList}
          />
        </div>
      )}
    </Root>
  );
}

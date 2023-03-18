const STANDARD_DPR = 2; // standard device pixel ratio
const isSmallView = window.devicePixelRatio > STANDARD_DPR;
export function toCorrectPixel(value: number, needTouch = false) {
  let extraSize: number = 0; //so small for touching by finger
  if (needTouch && isSmallView) {
    extraSize = 10;
  }
  return (value * STANDARD_DPR) / window.devicePixelRatio + extraSize;
}

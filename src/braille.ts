export function canvasToBraille(canvas: HTMLCanvasElement, threshold: number) {
  const context = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const columns = Math.ceil(width / 2);
  const rows = Math.ceil(height / 4);
  let result = "";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const topLeft = getPixel(x * 2, y * 4);
      const topRight = getPixel(x * 2 + 1, y * 4);
      const upperLeft = getPixel(x * 2, y * 4 + 1);
      const upperRight = getPixel(x * 2 + 1, y * 4 + 1);
      const lowerLeft = getPixel(x * 2, y * 4 + 2);
      const lowerRight = getPixel(x * 2 + 1, y * 4 + 2);
      const bottomLeft = getPixel(x * 2, y * 4 + 3);
      const bottomRight = getPixel(x * 2 + 1, y * 4 + 3);
      result += braille([
        [topLeft, topRight],
        [upperLeft, upperRight],
        [lowerLeft, lowerRight],
        [bottomLeft, bottomRight],
      ]);
    }
    result += "\n";
  }
  function getPixel(x: number, y: number) {
    const [r, g, b, a] = context.getImageData(x, y, 1, 1).data;
    const score = r + g + b + a;
    return score > threshold;
  }
  return result;
}

function braille(mask: [boolean, boolean][]) {
  let code = 0b10100000000000;
  if (mask[0][0]) code |= 0b00000001;
  if (mask[1][0]) code |= 0b00000010;
  if (mask[2][0]) code |= 0b00000100;
  if (mask[0][1]) code |= 0b00001000;
  if (mask[1][1]) code |= 0b00010000;
  if (mask[2][1]) code |= 0b00100000;
  if (mask[3][0]) code |= 0b01000000;
  if (mask[3][1]) code |= 0b10000000;
  return String.fromCharCode(code);
}

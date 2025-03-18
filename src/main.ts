import "./style.css";

const root = document.getElementById("root")!;
const input = (() => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  root.append(input);
  return input;
})();
const output = (() => {
  const output = document.createElement("pre");
  output.style.background = "black";
  output.style.color = "white";
  root.append(output);
  return output;
})();

input.addEventListener("change", async () => {
  const file = input.files && input.files[0];
  if (!file) return;
  const url = await fileToDataUrl(file);
  const image = await dataUrlToImage(url);
  const ratio = image.width / image.height;
  const width = 80;
  const height = width / ratio;
  const canvas = imageToCanvas(image, { width, height });
  const braille = canvasToBraille(canvas, 512);
  output.textContent = braille;
});

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.onabort = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function imageToCanvas(
  image: HTMLImageElement,
  size?: { width: number; height: number },
) {
  const canvas = document.createElement("canvas");
  canvas.width = size?.width ?? image.width;
  canvas.height = size?.height ?? image.height;
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToBraille(canvas: HTMLCanvasElement, threshold: number) {
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

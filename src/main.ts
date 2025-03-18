import "./style.css";
import { fileToDataUrl, dataUrlToImage, imageToCanvas } from "./image";
import { canvasToBraille } from "./braille";

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
  output.style.fontFamily = `"Roboto Mono", monospace`;
  output.style.width = "min-content";
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

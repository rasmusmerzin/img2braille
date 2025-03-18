import "./style.css";
import { fileToDataUrl, dataUrlToImage, imageToCanvas } from "./image";
import { canvasToBraille } from "./braille";

const root = document.getElementById("root")!;
const input = (() => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  return input;
})();
const uploadButton = (() => {
  const button = document.createElement("button");
  button.id = "upload";
  button.textContent = "Upload Image";
  root.append(button);
  return button;
})();
const output = (() => {
  const output = document.createElement("pre");
  output.id = "output";
  root.append(output);
  return output;
})();

uploadButton.onclick = () => input.click();
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

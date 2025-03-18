import "./style.css";
import { fileToDataUrl, dataUrlToImage, imageToCanvas } from "./image";
import { canvasToBraille } from "./braille";
import { readable } from "./store";

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
const controls = (() => {
  const controls = document.createElement("div");
  controls.id = "controls";
  root.append(controls);
  return controls;
})();
const clipboardButton = (() => {
  const button = document.createElement("button");
  button.id = "clipboard";
  button.textContent = "Copy to Clipboard";
  controls.append(button);
  return button;
})();

const file = readable<File | null>(input.files && input.files[0], (set) => {
  const onchange = () => set(input.files && input.files[0]);
  input.addEventListener("change", onchange);
  return () => input.removeEventListener("change", onchange);
});

uploadButton.onclick = () => input.click();
clipboardButton.onclick = () => navigator.clipboard.writeText(output.innerText);

file.subscribe(async (file) => {
  controls.style.display = file ? "" : "none";
  output.textContent = "";
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

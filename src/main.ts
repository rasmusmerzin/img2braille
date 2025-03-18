import "./style.css";
import { fileToDataUrl, dataUrlToImage, imageToCanvas } from "./image";
import { canvasToBraille } from "./braille";
import { derived, readable } from "./store";

const root = document.getElementById("root")!;
const fileInput = (() => {
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
const [widthInput, widthLabel] = (() => {
  const label = document.createElement("label");
  label.textContent = "Width";
  controls.append(label);
  const input = document.createElement("input");
  input.type = "range";
  input.step = "2";
  input.min = "8";
  input.max = "100";
  input.value = "80";
  controls.append(input);
  return [input, label];
})();
const [thresholdInput, thresholdLabel] = (() => {
  const label = document.createElement("label");
  label.textContent = "Threshold";
  controls.append(label);
  const input = document.createElement("input");
  input.type = "range";
  input.min = "1";
  input.max = "1024";
  input.value = "512";
  controls.append(input);
  return [input, label];
})();
const invertInput = (() => {
  const label = document.createElement("label");
  label.textContent = "Invert";
  controls.append(label);
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = true;
  controls.append(input);
  return input;
})();

const file = readable<File | null>(
  fileInput.files && fileInput.files[0],
  (set) => {
    const onchange = () => set(fileInput.files && fileInput.files[0]);
    fileInput.addEventListener("change", onchange);
    return () => fileInput.removeEventListener("change", onchange);
  },
);
const image = readable<HTMLImageElement | null>(null, (set) =>
  file.subscribe(async (file) =>
    set(file ? await dataUrlToImage(await fileToDataUrl(file)) : null),
  ),
);
const width = readable(widthInput.valueAsNumber, (set) => {
  const onchange = () => set(widthInput.valueAsNumber);
  widthInput.addEventListener("input", onchange);
  return () => widthInput.removeEventListener("input", onchange);
});
const threshold = readable(thresholdInput.valueAsNumber, (set) => {
  const onchange = () => set(thresholdInput.valueAsNumber);
  thresholdInput.addEventListener("input", onchange);
  return () => thresholdInput.removeEventListener("input", onchange);
});
const invert = readable(invertInput.checked, (set) => {
  const onchange = () => set(invertInput.checked);
  invertInput.addEventListener("change", onchange);
  return () => invertInput.removeEventListener("change", onchange);
});

uploadButton.onclick = () => fileInput.click();
clipboardButton.onclick = () => navigator.clipboard.writeText(output.innerText);

width.subscribe((width) => (widthLabel.textContent = `Width (${width})`));
threshold.subscribe(
  (threshold) => (thresholdLabel.textContent = `Threshold (${threshold})`),
);

derived([image, width, threshold, invert], (pair) => pair).subscribe((async ([
  image,
  width,
  threshold,
  invert,
]: [HTMLImageElement, number, number, boolean]) => {
  controls.style.display = image ? "" : "none";
  output.textContent = "";
  output.style.filter = invert ? "invert(1)" : "";
  if (!image) return;
  const ratio = image.width / image.height;
  const height = width / ratio;
  const canvas = imageToCanvas(image, { width, height });
  const braille = canvasToBraille(canvas, threshold, invert);
  output.textContent = braille;
}) as any);

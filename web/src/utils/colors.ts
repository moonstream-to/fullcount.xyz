const colors: string[] = ["#2f38c0", "#5f64cf", "#8c91dc", "#e38b87", "#d65c5a"];

function interpolateColor(color1: string, color2: string, factor = 0.5): string {
  const color1Match = color1.slice(1).match(/.{2}/g);
  const color2Match = color2.slice(1).match(/.{2}/g);

  if (!color1Match || !color2Match) {
    throw new Error("Invalid color format");
  }

  const result: string[] = color1Match.map((hexNum, index) => {
    const color1Num: number = parseInt(hexNum, 16);
    const color2Num: number = parseInt(color2Match[index], 16);
    const diff: number = color2Num - color1Num;
    const newNum: number = color1Num + Math.round(diff * factor);
    return newNum.toString(16).padStart(2, "0");
  });

  return `#${result.join("")}`;
}

export function valueToColor(value: number, values: number[]): string {
  const normValue = value / Math.max(...values);
  const segment: number = 1 / (colors.length - 1);
  const index: number = Math.min(Math.floor(normValue / segment), colors.length - 2);
  const factor: number = (normValue % segment) / segment;
  return interpolateColor(colors[index], colors[index + 1], factor);
}

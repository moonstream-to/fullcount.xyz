function interpolateColor(color1: string, color2: string, factor = 0.5): string {
  const hexToRgb = (hex: string): number[] => hex.match(/.{2}/g)!.map((hex) => parseInt(hex, 16));

  const lerp = (start: number, end: number, t: number): number =>
    Math.round(start + t * (end - start));

  const [r1, g1, b1] = hexToRgb(color1.slice(1));
  const [r2, g2, b2] = hexToRgb(color2.slice(1));

  const r = lerp(r1, r2, factor).toString(16).padStart(2, "0");
  const g = lerp(g1, g2, factor).toString(16).padStart(2, "0");
  const b = lerp(b1, b2, factor).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
}

const colors = [
  "#261c3d",
  "#4a3572",
  "#3d448b",
  "#235aa6",
  "#2a7cbe",
  "#0ca5cf",
  "#0ed1df",
  "#26d6a7",
  "#34ea74",
];

export function getColorByFactor(array: number[], factor: number): string {
  const sortedArray = [...array].sort((a, b) => a - b);
  const bracketIndices = [2, 5, 8, 11, 14, 17, 21, 24];
  const brackets = bracketIndices.map((index) => sortedArray[index]);

  let bracketTopIndex = brackets.findIndex((b) => b >= factor);
  bracketTopIndex = bracketTopIndex === -1 ? 7 : bracketTopIndex;
  const top = brackets[bracketTopIndex];
  const bottom = bracketTopIndex === 0 ? sortedArray[0] : brackets[bracketTopIndex - 1];
  const placeInBracket = top === bottom ? 1 : (factor - bottom) / (top - bottom);
  const endColorIndex = bracketTopIndex + 1;
  return interpolateColor(colors[endColorIndex - 1], colors[endColorIndex], placeInBracket);
}

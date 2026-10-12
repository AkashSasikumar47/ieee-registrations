function channels(hex: string) {
  return [1, 3, 5].map(
    (start) => parseInt(hex.slice(start, start + 2), 16) / 255,
  ) as [number, number, number];
}

export function isLight(hex: string) {
  const [r, g, b] = channels(hex).map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.36;
}

export function popOf(hex: string) {
  const [r, g, b] = channels(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  if (max !== min) {
    const delta = max - min;
    hue =
      max === r
        ? ((g - b) / delta) % 6
        : max === g
          ? (b - r) / delta + 2
          : (r - g) / delta + 4;
  }
  const turned = (((hue * 60 + 150) % 360) + 360) % 360;
  return `hsl(${Math.round(turned)} 85% 72%)`;
}

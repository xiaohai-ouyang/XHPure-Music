declare module 'tinycolor2' {
  interface TinyColor {
    toRgb(): { r: number; g: number; b: number };
    isLight(): boolean;
    darken(amount: number): TinyColor;
    lighten(amount: number): TinyColor;
    toString(): string;
  }

  interface ColorInput {
    r: number;
    g: number;
    b: number;
  }

  function tinycolor(color: string | ColorInput): TinyColor;

  export default tinycolor;
}
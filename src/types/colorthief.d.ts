declare module 'colorthief' {
  type RGBColor = [number, number, number]

  export default class ColorThief {
    getColor: (img: HTMLImageElement | null) => RGBColor
    getPalette: (img: HTMLImageElement | null, colorCount?: number) => RGBColor[]
  }
}

export enum FontId {
  SankofaDisplay = "SankofaDisplay",
  Roboto = "Roboto",
}

export type FontInfo = {
  id: FontId;
  name: string;
  url: string;
};

export type OpentypeFont = any;

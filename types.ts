export enum ViewAngle {
  FRONT = 'Front View',
  SIDE = 'Side View',
  ANGLE_45 = '45 Degree View',
  BACK = 'Back View'
}

export interface StockItem {
  id: string;
  url: string;
  name: string;
}

export interface GenerationResult {
  angle: ViewAngle;
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
}

export interface ImageSelection {
  file: File | null;
  previewUrl: string | null;
  isStock: boolean;
}

export interface TemplateImage {
  id: string;
  url: string;
  label: string;
  type: 'person' | 'cloth';
}

export interface GeneratedResult {
  angle: string;
  imageUrl: string;
  loading: boolean;
  error?: string;
}

export enum ViewAngle {
  FRONT = '0° Front',
  SIDE_45 = '45° Side',
  SIDE_90 = '90° Profile',
  BACK = '180° Back'
}

export type TryOnState = 'idle' | 'generating' | 'complete' | 'error';

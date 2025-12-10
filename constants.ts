import { StockItem, ViewAngle, GenerationResult } from './types';

export const STOCK_PEOPLE: StockItem[] = [
  { id: 'p1', name: 'Model A', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop' },
  { id: 'p2', name: 'Model B', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop' },
  { id: 'p3', name: 'Model C', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop' },
  { id: 'p4', name: 'Model D', url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1000&auto=format&fit=crop' },
  { id: 'p5', name: 'Model E', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop' },
  { id: 'p6', name: 'Model F', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop' },
];

export const STOCK_CLOTHES: StockItem[] = [
  { id: 'c1', name: 'Summer Dress', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop' },
  { id: 'c2', name: 'Denim Jacket', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop' },
  { id: 'c3', name: 'Red Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop' },
  { id: 'c4', name: 'Classic Suit', url: 'https://images.unsplash.com/photo-1594938298603-c8148c47e356?q=80&w=1000&auto=format&fit=crop' },
  { id: 'c5', name: 'Leather Jacket', url: 'https://images.unsplash.com/photo-1551028919-ac66c9a3d683?q=80&w=1000&auto=format&fit=crop' },
  { id: 'c6', name: 'Floral Blouse', url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=1000&auto=format&fit=crop' },
  { id: 'c7', name: 'Casual T-Shirt', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop' },
  { id: 'c8', name: 'Winter Coat', url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop' },
];

export const INITIAL_RESULTS: GenerationResult[] = [
  { angle: ViewAngle.FRONT, imageUrl: null, loading: false, error: null },
  { angle: ViewAngle.SIDE, imageUrl: null, loading: false, error: null },
  { angle: ViewAngle.ANGLE_45, imageUrl: null, loading: false, error: null },
  { angle: ViewAngle.BACK, imageUrl: null, loading: false, error: null },
];
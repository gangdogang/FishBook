export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type FishSort = 'popular' | 'name';

export interface FishListParams {
  search?: string;
  season?: Season;
  taste?: string;
  priceLevel?: number;
  month?: number;
  featured?: boolean;
  sort?: FishSort;
}

export interface FishSummary {
  id: number;
  name: string;
  imageUrl: string | null;
  description: string | null;
  priceLevel: number | null;
  tasteTags: string[];
  seasonMonths: number[];
  featured: boolean;
  avgRating: number;
  reviewCount: number;
}

export interface SimilarFish {
  id: number;
  name: string;
  imageUrl: string | null;
  priceLevel: number | null;
  avgRating: number;
  seasonMonths: number[];
}

export type RatingDistribution = Record<'1' | '2' | '3' | '4' | '5', number>;

export interface FishDetail extends FishSummary {
  nameEn: string | null;
  images: string[];
  tasteDesc: string | null;
  ratingDistribution: RatingDistribution;
  tips: string[];
  similarFishes: SimilarFish[];
}

export interface FishPriceObservation {
  observedAt: string;
  priceMinKrw: number;
  priceMaxKrw: number;
  unit: string | null;
  origin: string | null;
  sizeGrade: string | null;
  sourceLabel: string;
  shopName: string | null;
}

export interface FishPriceTrendPoint {
  observedDate: string;
  priceMinKrw: number;
  priceMaxKrw: number;
  avgPriceKrw: number;
  observationCount: number;
}

export interface FishShopPriceSeries {
  shopName: string;
  observationCount: number;
  latest: FishPriceObservation;
  graph: FishPriceTrendPoint[];
}

export interface FishVariantPriceSeries {
  variantKey: string;
  variantLabel: string;
  farming: string;
  origin: string;
  unit: string;
  observationCount: number;
  latest: FishPriceObservation;
  graph: FishPriceTrendPoint[];
}

export interface FishPriceSummary {
  fishId: number;
  days: number;
  observationCount: number;
  latest: FishPriceObservation | null;
  recent: FishPriceObservation[];
  dailyAverage: FishPriceTrendPoint[];
  byShop: FishShopPriceSeries[];
  byVariant: FishVariantPriceSeries[];
}

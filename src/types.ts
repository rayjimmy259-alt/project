export interface StoreOffer {
  store: string;
  logo: string;
  price: number;
  oldPrice?: number;
  inStock: boolean;
  freeShipping: boolean;
  url: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  gallery?: string[];
  price: number;
  oldPrice?: number;
  qualityPriceScore?: number;
  rating: number;
  reviews: number;
  specs: { label: string; value: string }[];
  store: string;
  inStock: boolean;
  badge?: string;
  description: string;
  offers: StoreOffer[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

import { useMemo } from "react";
import { useProducts } from "./ProductsContext";
import type { Product } from "../types";
import { getProductStartingPrice } from "../utils";

const COMPLEMENTARY_CATEGORIES: Record<string, string[]> = {
  smartphones: ["audio-auriculares", "audio", "wearables"],
  laptops: ["perifericos-pc", "accesorios-computadora", "audio-auriculares", "audio"],
  audio: ["wearables", "perifericos-pc", "accesorios-computadora"],
  "audio-auriculares": ["wearables", "perifericos-pc", "accesorios-computadora"],
  wearables: ["audio-auriculares", "accesorios-computadora", "perifericos-pc"],
  "perifericos-pc": ["accesorios-computadora", "audio-auriculares", "wearables"],
  "accesorios-computadora": ["perifericos-pc", "audio-auriculares", "wearables"],
};

export function useRelatedProducts(articleId: string, limit = 4): Product[] {
  const { products } = useProducts();

  return useMemo(() => {
    const currentProduct = products.find(
      (product) => product.id === articleId || product.slug === articleId
    );
    if (!currentProduct) return [];

    const preferredCategories = COMPLEMENTARY_CATEGORIES[currentProduct.category] ?? [];
    return products
      .filter(
        (product) =>
          product.id !== currentProduct.id &&
          product.slug !== currentProduct.slug &&
          preferredCategories.includes(product.category)
      )
      .sort((a, b) => {
        const categoryOrder =
          preferredCategories.indexOf(a.category) - preferredCategories.indexOf(b.category);
        if (categoryOrder !== 0) return categoryOrder;
        return getProductStartingPrice(a) - getProductStartingPrice(b);
      })
      .slice(0, Math.max(0, limit));
  }, [articleId, limit, products]);
}

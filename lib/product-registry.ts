import productRegistryData from "../data/product-registry.json";
export type DirectoryBrand = "Microsoft" | "Seqrite" | "Cisco" | "Other";

export type DeploymentType = "Cloud" | "On-Prem" | "Hybrid";

export type ProductRegistryProduct = {
  name: string;
  description: string;
  licenseModel: string;
  deploymentOptions: DeploymentType[];
};

export type ProductRegistryCategory = {
  name: string;
  description: string;
  products: ProductRegistryProduct[];
};

export type ProductRegistryBrand = {
  brand: DirectoryBrand;
  categories: ProductRegistryCategory[];
};

export type ProductDirectoryMap = Record<DirectoryBrand, ProductRegistryBrand>;

type FlatProductOption = {
  category: string;
  product: string;
  description: string;
  licenseModel: string;
  deploymentOptions: DeploymentType[];
};

const parsed = productRegistryData as ProductDirectoryMap;

export const PRODUCT_DIRECTORY: ProductDirectoryMap = parsed;

export function getRegistryBrands() {
  return Object.keys(PRODUCT_DIRECTORY) as DirectoryBrand[];
}

export function getBrandDirectory(brand: DirectoryBrand) {
  return PRODUCT_DIRECTORY[brand];
}

export function getBrandCategories(brand: DirectoryBrand) {
  return PRODUCT_DIRECTORY[brand]?.categories ?? [];
}

export function getBrandProducts(brand: DirectoryBrand): FlatProductOption[] {
  const categories = getBrandCategories(brand);
  return categories.flatMap((category) =>
    category.products.map((product) => ({
      category: category.name,
      product: product.name,
      description: product.description,
      licenseModel: product.licenseModel,
      deploymentOptions: product.deploymentOptions
    }))
  );
}

export function findDirectoryProduct(brand: DirectoryBrand, categoryName: string, productName: string) {
  const category = getBrandCategories(brand).find((item) => item.name === categoryName);
  if (!category) {
    return null;
  }

  const product = category.products.find((item) => item.name === productName);
  if (!product) {
    return null;
  }

  return {
    category,
    product
  };
}

export function getDeploymentOptionsForProduct(brand: DirectoryBrand, categoryName: string, productName: string) {
  const match = findDirectoryProduct(brand, categoryName, productName);
  return match?.product.deploymentOptions ?? [];
}

export function hasProduct(brand: DirectoryBrand, categoryName: string, productName: string) {
  return Boolean(findDirectoryProduct(brand, categoryName, productName));
}

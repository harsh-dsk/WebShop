export type ProductImage = {
  url: string;
  publicId: string;
  alt?: string;
};

export type AttributeFieldType = "text" | "number" | "select";

export type AttributeField = {
  key: string;
  label: string;
  type: AttributeFieldType;
  options?: string[];
  required?: boolean;
};

export type ProductMetadata = Record<string, string | number | boolean>;

export type ProductVariantInput = {
  id?: string;
  name: string;
  sku?: string | null;
  price?: number | null;
  stock: number;
  attributes?: Record<string, string>;
  isActive?: boolean;
  sortOrder?: number;
};

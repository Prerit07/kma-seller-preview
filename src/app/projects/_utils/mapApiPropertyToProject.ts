import type { EndUserPropertySummary } from "@/api/actions/propertyActions";
import type { Project } from "../_types";

const parseBedrooms = (value?: string) => {
  if (!value) return undefined;
  const match = value.match(/\d+/);
  if (!match) return undefined;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : undefined;
};

const formatIndianNumber = (value: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);

const normalizeProjectType = (value?: string): Project["propertyType"] | undefined => {
  const raw = (value ?? "").trim().toLowerCase();
  const key = raw.replace(/\s+/g, "_").replace(/\//g, "_");
  const map: Record<string, Project["propertyType"]> = {
    villa: "villa",
    plot: "plot",
    apartment: "apartment",
    flat_apartment: "apartment",
    penthouse: "penthouse",
    independent_floor: "ind_floor",
    independent_house: "ind_floor",
    ind_floor: "ind_floor",
    retail_shop: "retail_shop",
    office_space: "office_space",
  };
  return map[key] ?? map[raw];
};

const normalizeFurnishing = (value?: string): "furnished" | "unfurnished" | "semi-furnished" | undefined => {
  const key = (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (key === "furnished") return "furnished";
  if (key === "unfurnished") return "unfurnished";
  if (key === "semi_furnished") return "semi-furnished";
  return undefined;
};

const normalizePostedBy = (value?: string): "owner" | "channel_partner" => {
  const key = (value ?? "").trim().toLowerCase();
  return key === "channel_partner" || key === "channel partner" ? "channel_partner" : "owner";
};

const formatRoleBadge = (value?: string) => {
  if (!value) return undefined;
  const cleaned = value.trim();
  if (!cleaned) return undefined;
  return cleaned
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const normalizeListingIntent = (value?: string): "sale" | "rent" =>
  (value ?? "").trim().toLowerCase() === "rent" ? "rent" : "sale";

const resolveListingType = (item: { listingType?: string | { name?: string; code?: string } }) => {
  const lt = item.listingType;
  if (typeof lt === "string") return lt;
  if (lt && typeof lt === "object" && "code" in lt) return lt.code ?? lt.name ?? "";
  return "";
};

const resolveCategory = (item: { category?: string | { name?: string; code?: string } }) => {
  const c = item.category;
  if (typeof c === "string") return c;
  if (c && typeof c === "object" && "name" in c) return c.name ?? c.code ?? "";
  return "";
};

const resolvePropertyType = (item: { propertyType?: string | { name?: string; code?: string } }) => {
  const pt = item.propertyType;
  if (typeof pt === "string") return pt;
  if (pt && typeof pt === "object" && "name" in pt) return pt.name ?? pt.code ?? "";
  return "";
};

const resolveBhkType = (item: { bhkType?: string | { name?: string; code?: string } }) => {
  const b = item.bhkType;
  if (typeof b === "string") return b;
  if (b && typeof b === "object" && "name" in b) return b.name ?? b.code ?? "";
  return "";
};

const resolveCity = (item: { city?: string | { name?: string } }) => {
  const c = item.city;
  if (typeof c === "string") return c;
  if (c && typeof c === "object" && "name" in c) return c.name ?? "";
  return "";
};

const resolveLocality = (item: { locality?: string | { name?: string } }) => {
  const l = item.locality;
  if (typeof l === "string") return l;
  if (l && typeof l === "object" && "name" in l) return l.name ?? "";
  return "";
};

const getImageUrlsFromItem = (
  item: {
    photos?: Array<{ fileKey?: string; isCoverImage?: boolean | string }>;
    images?: Array<{ fileKey?: string }>;
    imageUrl?: string | null;
  },
  toFullUrl: (v?: string | null) => string,
  fallback: string
): string[] => {
  const list = item.photos ?? item.images ?? [];
  const withCoverFirst = [...list].sort((a, b) => {
    const aCover = Boolean((a as { isCoverImage?: boolean | string }).isCoverImage);
    const bCover = Boolean((b as { isCoverImage?: boolean | string }).isCoverImage);
    if (aCover && !bCover) return -1;
    if (!aCover && bCover) return 1;
    return 0;
  });
  const urls = withCoverFirst.map((m) => toFullUrl(m?.fileKey)).filter(Boolean) as string[];
  if (urls.length) return urls;
  const single = toFullUrl(item.imageUrl);
  return single ? [single] : [fallback];
};

const getStringProp = (value: unknown, key: string) => {
  if (!value || typeof value !== "object") return undefined;
  const property = (value as Record<string, unknown>)[key];
  return typeof property === "string" && property.trim() ? property : undefined;
};

const normalizeBuildingType = (value?: string): "residential" | "commercial" | undefined => {
  const key = (value ?? "").trim().toLowerCase();
  if (key === "commercial") return "commercial";
  if (key.length > 0) return "residential";
  return undefined;
};

export interface MapApiPropertyToProjectOptions {
  toFullAssetUrl: (value?: string | null) => string;
  fallbackImage: string;
}

/** Map API EndUserPropertySummary to Project for list/card display. */
export function mapApiPropertyToProject(
  item: EndUserPropertySummary,
  options: MapApiPropertyToProjectOptions
): Project {
  const { toFullAssetUrl, fallbackImage } = options;
  const listingIntent = normalizeListingIntent(resolveListingType(item));
  const salePrice = Number(item.price ?? 0);
  const monthlyRent = Number(item.monthlyRent ?? 0);
  const priceValue =
    listingIntent === "rent"
      ? monthlyRent > 0
        ? monthlyRent / 100_000
        : 0
      : salePrice > 0
        ? salePrice / 10_000_000
        : 0;

  const priceLabel =
    listingIntent === "rent"
      ? monthlyRent > 0
        ? `₹ ${formatIndianNumber(monthlyRent)} / month`
        : "Price on request"
      : salePrice > 0
        ? `₹ ${formatIndianNumber(salePrice)}`
        : "Price on request";

  const imageUrls = getImageUrlsFromItem(item, toFullAssetUrl, fallbackImage);
  const localityStr = resolveLocality(item);
  const cityStr = resolveCity(item);
  const society = item.society;
  const address =
    (typeof society === "object" && society?.address) ||
    (typeof item.address === "string" ? item.address : "") ||
    "";

  const titleParts = [
    resolveBhkType(item),
    resolvePropertyType(item),
    typeof society === "object" && society?.name,
    localityStr,
  ].filter(Boolean);
  const title =
    (typeof item.propertyName === "string" && item.propertyName.trim()) ||
    (typeof item.title === "string" && item.title.trim()) ||
    (titleParts.length ? titleParts.join(" in ") : "Property");

  const postedByRole =
    getStringProp(item.user, "role") ??
    getStringProp(item.owner, "role") ??
    (typeof item.postedBy === "string" ? item.postedBy : undefined);
  const ownerName =
    getStringProp(item.owner, "name") ?? getStringProp(item.user, "name");
  const ownerProfileImage =
    getStringProp(item.owner, "profileImage") ??
    getStringProp(item.user, "profileImage") ??
    getStringProp(item.user, "avatar");
  const furnishingRaw =
    typeof item.furnishType === "string"
      ? item.furnishType
      : (item.furnishingType as string | undefined);

  const imageCount = typeof (item as Record<string, unknown>).imageCount === "number"
    ? (item as Record<string, unknown>).imageCount as number
    : imageUrls.length || 1;
  const videoCount = typeof (item as Record<string, unknown>).videoCount === "number"
    ? (item as Record<string, unknown>).videoCount as number
    : Array.isArray(item.videos) ? item.videos.length : 0;

  return {
    id: item.id,
    title,
    address,
    city: cityStr,
    isFavorite: Boolean(item.isFavorite),
    postedBy: normalizePostedBy(postedByRole as string | undefined),
    listingIntent,
    priceValue,
    priceLabel,
    plotAreaSqYd: typeof item.plotArea === "number" ? item.plotArea : undefined,
    bedrooms: parseBedrooms(resolveBhkType(item)),
    view: typeof item.facing === "string" ? item.facing : undefined,
    furnishing: normalizeFurnishing(furnishingRaw),
    locality: localityStr,
    propertyType: normalizeProjectType(resolvePropertyType(item)),
    buildingType: normalizeBuildingType(resolveCategory(item)),
    possessionStatus:
      item.constructionStatus === "under_construction"
        ? "under_construction"
        : item.constructionStatus
          ? "ready_to_move"
          : undefined,
    images: imageUrls,
    mediaCounts: {
      photos: imageCount,
      videos: videoCount,
    },
    agent:
      ownerName || postedByRole || ownerProfileImage
        ? {
            name: ownerName ?? "KMA Expert",
            badge: formatRoleBadge(postedByRole),
            avatarUrl: toFullAssetUrl(ownerProfileImage),
          }
        : undefined,
  };
}

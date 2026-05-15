export type PostedByTab = "all" | "owner" | "channel_partner";

export type SortOption = "price_low_high" | "price_high_low";

export type BuildingType = "all" | "residential" | "commercial";

export type Furnishing =
  | "furnished"
  | "unfurnished"
  | "semi-furnished"
  | "any";

export type PossessionStatus = "ready_to_move" | "under_construction";

export type ListingIntent = "sale" | "rent";

export type ProjectTag =
  | "prime_location"
  | "reputed_builder"
  | "safe_secure_locality";

export type Amenity = "security_24x7" | "power_backup" | "attached_market";

export type PropertyType =
  | "villa"
  | "plot"
  | "ind_floor"
  | "penthouse"
  | "apartment"
  | "retail_shop"
  | "office_space";

export interface ProjectAgent {
  name: string;
  badge?: string;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  address: string;
  city: string;
  isFavorite?: boolean;

  postedBy: Exclude<PostedByTab, "all">;
  listingIntent: ListingIntent;

  priceValue: number; // raw number
  priceLabel: string; // pre-formatted display label (e.g. "₹ 1.91 Cr", "₹ 1 lakh/month")

  plotAreaSqYd?: number;
  bedrooms?: number;
  view?: string;
  furnishing?: Exclude<Furnishing, "any">;

  images: string[];
  mediaCounts?: {
    photos: number;
    videos: number;
  };

  agent?: ProjectAgent;
  tags?: ProjectTag[];
  buildingType?: Exclude<BuildingType, "all">;
  propertyType?: PropertyType;
  locality?: string;
  possessionStatus?: PossessionStatus;
  amenities?: Amenity[];
}

export interface ProjectsFilters {
  searchText: string;
  searchLocality: string;

  /** Selected category id (building type) from filters API */
  categoryId: string | null;
  /** Selected property type ids from filters API */
  propertyTypeIds: string[];
  /** Selected BHK type ids from filters API */
  bhkTypeIds: string[];
  /** Selected furnishing type id from filters API */
  furnishingTypeId: string | null;
  /** Selected amenity ids from filters API */
  amenityIds: string[];

  minBudget: number | null;
  maxBudget: number | null;

  minSizeSqYd: number | null;
  maxSizeSqYd: number | null;

  possessionStatuses: PossessionStatus[];
}


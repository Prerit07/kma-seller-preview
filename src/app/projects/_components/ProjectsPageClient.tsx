"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { Project } from "../_types";
import FiltersSidebar from "./FiltersSidebar";
import ProjectsToolbar from "./ProjectsToolbar";
import ProjectCard from "./ProjectCard";
import { useProjectsStore } from "../_store/useProjectsStore";
import {
  useEndUserProperties,
  useEndUserPropertiesCount,
} from "@/api/hooks/useEndUserProperties";
import ProjectsPagination from "./ProjectsPagination";
import { getUserCoordinates } from "@/api/hooks/useGeoloaction";

const awsBaseUrl = process.env.NEXT_PUBLIC_AWS_URL ?? "";
const fallbackProjectImage = "/assets/properties_pic_1.png";
const PAGE_SIZE = 20;

const toFullAssetUrl = (value?: string | null) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (!awsBaseUrl) return value;
  return `${awsBaseUrl}${value}`;
};

const parseBedrooms = (value?: string) => {
  if (!value) return undefined;
  const match = value.match(/\d+/);
  if (!match) return undefined;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : undefined;
};

const formatIndianNumber = (value: number) => {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
};

const normalizeProjectType = (value?: string) => {
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
  return map[key] ?? map[raw] ?? undefined;
};

const normalizeFurnishing = (value?: string) => {
  const key = (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (key === "furnished") return "furnished";
  if (key === "unfurnished") return "unfurnished";
  if (key === "semi_furnished") return "semi-furnished";
  return undefined;
};

const normalizePostedBy = (value?: string) => {
  const key = (value ?? "").trim().toLowerCase();
  if (key === "owner") return "owner";
  if (key === "channel_partner" || key === "channel partner") {
    return "channel_partner";
  }
  return "owner";
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

const normalizeListingIntent = (value?: string) => {
  const key = (value ?? "").trim().toLowerCase();
  return key === "rent" ? "rent" : "sale";
};

/** Resolve listing type string from API (nested object or string). */
const resolveListingType = (item: { listingType?: string | { name?: string; code?: string } }) => {
  const lt = item.listingType;
  if (typeof lt === "string") return lt;
  if (lt && typeof lt === "object" && "code" in lt) return lt.code ?? lt.name ?? "";
  return "";
};

/** Resolve category string from API (nested object or string). */
const resolveCategory = (item: { category?: string | { name?: string; code?: string } }) => {
  const c = item.category;
  if (typeof c === "string") return c;
  if (c && typeof c === "object" && "name" in c) return c.name ?? c.code ?? "";
  return "";
};

/** Resolve property type string from API (nested object or string). */
const resolvePropertyType = (item: { propertyType?: string | { name?: string; code?: string } }) => {
  const pt = item.propertyType;
  if (typeof pt === "string") return pt;
  if (pt && typeof pt === "object" && "name" in pt) return pt.name ?? pt.code ?? "";
  return "";
};

/** Resolve BHK string from API (nested object or string). */
const resolveBhkType = (item: { bhkType?: string | { name?: string; code?: string } }) => {
  const b = item.bhkType;
  if (typeof b === "string") return b;
  if (b && typeof b === "object" && "name" in b) return b.name ?? b.code ?? "";
  return "";
};

/** Resolve city string from API (nested object or string). */
const resolveCity = (item: { city?: string | { name?: string } }) => {
  const c = item.city;
  if (typeof c === "string") return c;
  if (c && typeof c === "object" && "name" in c) return c.name ?? "";
  return "";
};

/** Resolve locality string from API (nested object or string). */
const resolveLocality = (item: { locality?: string | { name?: string } }) => {
  const l = item.locality;
  if (typeof l === "string") return l;
  if (l && typeof l === "object" && "name" in l) return l.name ?? "";
  return "";
};

/** Build image URLs from photos (prefer cover) or images, then fallback imageUrl. */
const getImageUrlsFromItem = (
  item: {
    photos?: Array<{ fileKey?: string; isCoverImage?: boolean | string }>;
    images?: Array<{ fileKey?: string }>;
    imageUrl?: string | null;
  },
  toFullUrl: (v?: string | null) => string,
  fallback: string
) => {
  const list = item.photos ?? item.images ?? [];
  const withCoverFirst = [...list].sort((a, b) => {
    const aCover = Boolean((a as { isCoverImage?: boolean | string }).isCoverImage);
    const bCover = Boolean((b as { isCoverImage?: boolean | string }).isCoverImage);
    if (aCover && !bCover) return -1;
    if (!aCover && bCover) return 1;
    return 0;
  });
  const urls = withCoverFirst
    .map((m) => toFullUrl(m?.fileKey))
    .filter(Boolean) as string[];
  if (urls.length) return urls;
  const single = toFullUrl(item.imageUrl);
  return single ? [single] : [fallback];
};

const uniqueNonEmpty = (values: string[]) =>
  Array.from(new Set(values.filter((value) => Boolean(value?.trim()))));

const getStringProp = (value: unknown, key: string) => {
  if (!value || typeof value !== "object") return undefined;
  const property = (value as Record<string, unknown>)[key];
  return typeof property === "string" && property.trim() ? property : undefined;
};

const normalizeBuildingType = (value?: string) => {
  const key = (value ?? "").trim().toLowerCase();
  if (key === "commercial") return "commercial";
  if (key.length > 0) return "residential";
  return undefined;
};

export default function ProjectsPageClient({ cityId }: { cityId?: string }) {
  const tab = useProjectsStore((s) => s.tab);
  const sort = useProjectsStore((s) => s.sort);
  const filters = useProjectsStore((s) => s.filters);
  const setFilters = useProjectsStore((s) => s.setFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [nearMeCoords, setNearMeCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [listingTypeId, setListingTypeId] = useState<string | null>(null);

  // Apply filters from URL query params (from homepage search / header dropdown)
  const searchParams = useSearchParams();
  const cityNameFromQuery = searchParams.get("cityName")?.trim();
  const appliedQueryRef = useRef<string | null>(null);
  useEffect(() => {
    const queryKey = searchParams.toString();
    if (!queryKey || appliedQueryRef.current === queryKey) return;
    appliedQueryRef.current = queryKey;

    const ltId = searchParams.get('listingTypeId') || searchParams.get('listingType');
    if (ltId) {
      // If it's a name like "rent"/"sale" instead of UUID, ignore it (backend expects UUID)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ltId);
      if (isUuid) setListingTypeId(ltId);
    }

    const patch: Partial<typeof filters> = {};

    const propertyTypeId = searchParams.get('propertyTypeId');
    const propertyTypeIds = searchParams.get('propertyTypeIds');
    if (propertyTypeId) {
      patch.propertyTypeIds = [propertyTypeId];
    } else if (propertyTypeIds) {
      patch.propertyTypeIds = propertyTypeIds.split(',').filter(Boolean);
    }

    const search = searchParams.get('search');
    if (search) patch.searchText = search;

    const minPrice = searchParams.get('minPrice');
    if (minPrice) patch.minBudget = Number(minPrice) / 10_000_000 || null;

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) patch.maxBudget = Number(maxPrice) / 10_000_000 || null;

    const constructionStatuses = searchParams.get('constructionStatuses');
    if (constructionStatuses) {
      patch.possessionStatuses = constructionStatuses.split(',').filter(Boolean) as typeof filters.possessionStatuses;
    }

    const furnishingTypes = searchParams.get('furnishingTypes');
    if (furnishingTypes) {
      patch.furnishingTypeId = furnishingTypes.split(',')[0] || null;
    }

    const categoryIds = searchParams.get('categoryIds');
    if (categoryIds) {
      patch.categoryId = categoryIds.split(',')[0] || null;
    }

    if (Object.keys(patch).length > 0) {
      setFilters(patch);
    }
  }, [searchParams, setFilters]);

  const deferredFilters = useDeferredValue(filters);
  const deferredSort = useDeferredValue(sort);
  const deferredTab = useDeferredValue(tab);

  const baseQueryParams = useMemo(() => {
    const searchParts = [
      deferredFilters.searchText?.trim(),
      deferredFilters.searchLocality?.trim(),
    ].filter(Boolean);
    const search = searchParts.length ? searchParts.join(" ") : undefined;

    return {
      search,
      cityId,
      postedBy:
        deferredTab === "all"
          ? undefined
          : deferredTab === "owner"
            ? "OWNER"
            : "CHANNEL_PARTNER",
      minPrice:
        deferredFilters.minBudget != null
          ? Math.round(deferredFilters.minBudget * 10_000_000)
          : undefined,
      maxPrice:
        deferredFilters.maxBudget != null
          ? Math.round(deferredFilters.maxBudget * 10_000_000)
          : undefined,
      categoryIds:
        deferredFilters.categoryId != null
          ? [deferredFilters.categoryId]
          : undefined,
      propertyTypeIds:
        deferredFilters.propertyTypeIds.length > 0
          ? uniqueNonEmpty(deferredFilters.propertyTypeIds)
          : undefined,
      bhkTypeIds:
        deferredFilters.bhkTypeIds.length > 0
          ? uniqueNonEmpty(deferredFilters.bhkTypeIds)
          : undefined,
      furnishingTypes:
        deferredFilters.furnishingTypeId != null
          ? [deferredFilters.furnishingTypeId]
          : undefined,
      constructionStatuses:
        deferredFilters.possessionStatuses.length > 0
          ? deferredFilters.possessionStatuses
          : undefined,
      listingTypeIds:
        listingTypeId ? [listingTypeId] : undefined,
      sortBy: "price",
      sortOrder: deferredSort === "price_low_high" ? "ASC" : "DESC",
      latitude: nearMeCoords?.latitude,
      longitude: nearMeCoords?.longitude,
    };
  }, [cityId, deferredFilters, deferredSort, deferredTab, nearMeCoords, listingTypeId]);

  const apiQueryParams = useMemo(
    () => ({
      ...baseQueryParams,
      page: currentPage,
      limit: PAGE_SIZE,
    }),
    [baseQueryParams, currentPage]
  );

  const paginationResetKey = useMemo(
    () => JSON.stringify(baseQueryParams),
    [baseQueryParams]
  );

  const { data: apiProperties = [], isPending, isError } =
    useEndUserProperties(apiQueryParams);
  const { data: totalCount = 0 } = useEndUserPropertiesCount(baseQueryParams);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [paginationResetKey]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const initialProjects = useMemo<Project[]>(() => {
    return apiProperties.map((item) => {
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

      const imageUrls = getImageUrlsFromItem(item, toFullAssetUrl, fallbackProjectImage);
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
          photos: imageUrls.length || 1,
          videos: Array.isArray(item.videos) ? item.videos.length : 0,
        },
        agent:
          ownerName || postedByRole || ownerProfileImage
            ? {
                name: ownerName ?? "KMA Expert",
                badge: formatRoleBadge(postedByRole),
                avatarUrl: toFullAssetUrl(ownerProfileImage),
              }
            : undefined,
      } satisfies Project;
    });
  }, [apiProperties]);

  const handleNearMeClick = async () => {
    if (isLocating) return;

    setIsLocating(true);
    const coordinates = await getUserCoordinates();
    setIsLocating(false);

    if (!coordinates) return;

    setNearMeCoords({
      latitude: coordinates.lat,
      longitude: coordinates.lng,
    });
    setCurrentPage(1);
  };

  return (
    <div className="w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-xs font-medium text-text-light-gray">
          Home <span className="px-1">/</span>
          <span className="text-white"> New Properties in {cityNameFromQuery || initialProjects[0]?.city}</span>
        </div>
      </div>

      <section className="mt-7 w-full px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            All Properties List
          </h1>

          <div className="mt-4 flex flex-row space-between gap-3 rounded-[28px]  bg-white p-4  sm:p-5 lg:absolute lg:right-0 lg:top-15 lg:mt-0 lg:w-[73%] lg:max-w-[73%] lg:rounded-[34px_34px_0_0] lg:border-b-0">
            <div className="relative w-[74%]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-gray" />

              <input
                value={filters.searchText}
                onChange={(e) => setFilters({ searchText: e.target.value })}
                placeholder="Search by Neighborhood...."
                className="h-12 w-full rounded-full border border-border bg-white px-12 pr-4 text-sm text-text-black outline-none transition focus:border-blue"
              />
            </div>

            {/* <button
              type="button"
              onClick={handleNearMeClick}
              disabled={isLocating}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border px-6 text-sm font-medium text-text-gray transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/20"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1_12821)">
                  <path d="M12 7.63635C9.5891 7.63635 7.6364 9.5891 7.6364 12C7.6364 14.4109 9.5891 16.3636 12 16.3636C14.411 16.3636 16.3636 14.4109 16.3636 12C16.3636 9.58915 14.4109 7.63635 12 7.63635ZM21.7528 10.9091C21.2509 6.35999 17.64 2.74909 13.0909 2.24729V0H10.9091V2.24729C6.35999 2.74909 2.74909 6.35999 2.24729 10.9091H0V13.0909H2.24729C2.74909 17.64 6.36004 21.2509 10.9091 21.7528V24H13.0909V21.7528C17.64 21.2509 21.2509 17.64 21.7528 13.0909H24V10.9091H21.7528ZM12 19.6364C7.78368 19.6364 4.36367 16.2164 4.36367 12C4.36367 7.78368 7.78368 4.36367 12 4.36367C16.2164 4.36367 19.6364 7.78362 19.6364 12C19.6364 16.2164 16.2164 19.6364 12 19.6364Z" fill="#888888" />
                </g>
                <defs>
                  <clipPath id="clip0_1_12821">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>

              {isLocating ? "Locating..." : "Near Me Properties"}
            </button> */}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 rounded-xl bg-white p-4 lg:mt-20 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-xl bg-[#f5f5f5] py-4 px-5 lg:sticky lg:top-6 lg:mt-0 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain">
            <FiltersSidebar />
          </aside>

          <main className="min-w-0 mt-2">
            <div className="rounded-2xl p-4  sm:p-5">
              <div>
                <ProjectsToolbar total={initialProjects.length} />

              </div>

              <div className="mt-4 flex flex-col gap-4">
                {isPending && (
                  <div className="rounded-xl border border-border bg-white p-8 text-center text-text-gray">
                    Loading properties...
                  </div>
                )}
                {isError && !isPending && (
                  <div className="rounded-xl border border-border bg-white p-8 text-center text-red-600">
                    Could not load properties. Please try again.
                  </div>
                )}
                {initialProjects.map((p, idx) => (
                  <div
                    key={p.id}
                    style={{
                      contentVisibility: "auto",
                      containIntrinsicSize: "260px",
                    }}
                  >
                    <ProjectCard project={p} priority={idx < 2} />
                  </div>
                ))}

                {!isPending && !isError && initialProjects.length === 0 && (
                  <div className="rounded-xl border border-border bg-white p-8 text-center text-text-gray">
                    No projects match your filters.
                  </div>
                )}

                {!isPending && !isError && totalPages > 0 && (
                  <div className="flex justify-end">
                    <ProjectsPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}


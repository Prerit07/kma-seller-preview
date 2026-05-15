import type { Project, ProjectsFilters, SortOption, PostedByTab } from "../_types";

function includesAny<T extends string>(haystack: T[] | undefined, needles: T[]) {
  if (!needles.length) return true;
  const set = new Set(haystack ?? []);
  return needles.some((n) => set.has(n));
}

export function applyProjectsQuery({
  projects,
  tab,
  filters,
  sort,
}: {
  projects: Project[];
  tab: PostedByTab;
  filters: ProjectsFilters;
  sort: SortOption;
}) {
  let out = projects;

  if (filters.searchText.trim()) {
    const q = filters.searchText.trim().toLowerCase();
    out = out.filter((p) =>
      `${p.title} ${p.address} ${p.locality ?? ""} ${p.city}`.toLowerCase().includes(q)
    );
  }

  if (tab !== "all") {
    out = out.filter((p) => p.postedBy === tab);
  }

  if (filters.buildingType !== "all") {
    out = out.filter((p) => p.buildingType === filters.buildingType);
  }

  if (filters.propertyTypes.length) {
    out = out.filter((p) => p.propertyType && filters.propertyTypes.includes(p.propertyType));
  }

  if (filters.searchLocality.trim()) {
    const q = filters.searchLocality.trim().toLowerCase();
    out = out.filter((p) =>
      `${p.locality ?? ""} ${p.address} ${p.city}`.toLowerCase().includes(q)
    );
  }

  if (filters.bedrooms.length) {
    out = out.filter((p) => {
      const b = p.bedrooms;
      return (b === 1 || b === 2 || b === 3) && filters.bedrooms.includes(b);
    });
  }

  if (filters.furnishing !== "any") {
    out = out.filter((p) => p.furnishing === filters.furnishing);
  }

  if (filters.minBudget != null) {
    out = out.filter((p) => p.listingIntent !== "sale" || p.priceValue >= filters.minBudget!);
  }
  if (filters.maxBudget != null) {
    out = out.filter((p) => p.listingIntent !== "sale" || p.priceValue <= filters.maxBudget!);
  }

  if (filters.minSizeSqYd != null) {
    out = out.filter((p) => (p.plotAreaSqYd ?? 0) >= filters.minSizeSqYd!);
  }
  if (filters.maxSizeSqYd != null) {
    out = out.filter((p) => (p.plotAreaSqYd ?? 0) <= filters.maxSizeSqYd!);
  }

  if (filters.possessionStatuses.length) {
    out = out.filter((p) => p.possessionStatus && filters.possessionStatuses.includes(p.possessionStatus));
  }

  if (filters.amenities.length) {
    out = out.filter((p) => includesAny(p.amenities, filters.amenities));
  }

  const priceForSort = (p: Project) => {
    // Mix sale (Cr) + rent (lakh/month) without pretending they're comparable:
    // keep sale entries first in sort, then rent entries.
    const bucket = p.listingIntent === "sale" ? 0 : 1;
    return { bucket, v: p.priceValue };
  };

  out = [...out].sort((a, b) => {
    const pa = priceForSort(a);
    const pb = priceForSort(b);
    if (pa.bucket !== pb.bucket) return pa.bucket - pb.bucket;
    return sort === "price_low_high" ? pa.v - pb.v : pb.v - pa.v;
  });

  return out;
}


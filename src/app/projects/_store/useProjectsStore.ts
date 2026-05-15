import { create } from "zustand";
import type {
  PossessionStatus,
  PostedByTab,
  ProjectsFilters,
  SortOption,
} from "../_types";

const DEFAULT_FILTERS: ProjectsFilters = {
  searchText: "",
  searchLocality: "",
  categoryId: null,
  propertyTypeIds: [],
  bhkTypeIds: [],
  furnishingTypeId: null,
  amenityIds: [],
  minBudget: null,
  maxBudget: null,
  minSizeSqYd: null,
  maxSizeSqYd: null,
  possessionStatuses: [],
};

interface ProjectsState {
  tab: PostedByTab;
  sort: SortOption;
  filters: ProjectsFilters;
  favorites: Record<string, boolean>;

  setTab: (tab: PostedByTab) => void;
  setSort: (sort: SortOption) => void;
  setFilters: (patch: Partial<ProjectsFilters>) => void;
  resetFilters: () => void;

  setCategoryId: (id: string | null) => void;
  togglePropertyTypeId: (id: string) => void;
  toggleBhkTypeId: (id: string) => void;
  setFurnishingTypeId: (id: string | null) => void;
  toggleAmenityId: (id: string) => void;
  togglePossession: (value: PossessionStatus) => void;

  toggleFavorite: (projectId: string) => void;
  setFavorite: (projectId: string, isFavorite: boolean) => void;
  removeChip: (chipId: string) => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  tab: "all",
  sort: "price_low_high",
  filters: DEFAULT_FILTERS,
  favorites: {},

  setTab: (tab) => set({ tab }),
  setSort: (sort) => set({ sort }),
  setFilters: (patch) =>
    set((s) => ({ filters: { ...s.filters, ...patch } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  setCategoryId: (id) =>
    set((s) => ({
      filters: {
        ...s.filters,
        categoryId: id,
        propertyTypeIds: [],
        bhkTypeIds: [],
      },
    })),

  togglePropertyTypeId: (id) =>
    set((s) => {
      const exists = s.filters.propertyTypeIds.includes(id);
      return {
        filters: {
          ...s.filters,
          propertyTypeIds: exists
            ? s.filters.propertyTypeIds.filter((x) => x !== id)
            : [...s.filters.propertyTypeIds, id],
          bhkTypeIds: exists ? s.filters.bhkTypeIds : [],
        },
      };
    }),

  toggleBhkTypeId: (id) =>
    set((s) => {
      const exists = s.filters.bhkTypeIds.includes(id);
      return {
        filters: {
          ...s.filters,
          bhkTypeIds: exists
            ? s.filters.bhkTypeIds.filter((x) => x !== id)
            : [...s.filters.bhkTypeIds, id],
        },
      };
    }),

  setFurnishingTypeId: (id) =>
    set((s) => ({ filters: { ...s.filters, furnishingTypeId: id } })),

  toggleAmenityId: (id) =>
    set((s) => {
      const exists = s.filters.amenityIds.includes(id);
      return {
        filters: {
          ...s.filters,
          amenityIds: exists
            ? s.filters.amenityIds.filter((x) => x !== id)
            : [...s.filters.amenityIds, id],
        },
      };
    }),

  togglePossession: (value) =>
    set((s) => {
      const exists = s.filters.possessionStatuses.includes(value);
      return {
        filters: {
          ...s.filters,
          possessionStatuses: exists
            ? s.filters.possessionStatuses.filter((v) => v !== value)
            : [...s.filters.possessionStatuses, value],
        },
      };
    }),

  toggleFavorite: (projectId) =>
    set((s) => {
      const next = { ...s.favorites };
      next[projectId] = !Boolean(next[projectId]);
      return { favorites: next };
    }),

  setFavorite: (projectId, isFavorite) =>
    set((s) => {
      const next = { ...s.favorites };
      next[projectId] = isFavorite;
      return { favorites: next };
    }),

  removeChip: (chipId) => {
    const { filters } = get();
    if (chipId.startsWith("chip:category:")) {
      set({ filters: { ...filters, categoryId: null } });
      return;
    }
    if (chipId.startsWith("chip:propertyType:")) {
      const id = chipId.replace("chip:propertyType:", "");
      set({
        filters: {
          ...filters,
          propertyTypeIds: filters.propertyTypeIds.filter((x) => x !== id),
        },
      });
      return;
    }
    if (chipId.startsWith("chip:bhk:")) {
      const id = chipId.replace("chip:bhk:", "");
      set({
        filters: {
          ...filters,
          bhkTypeIds: filters.bhkTypeIds.filter((x) => x !== id),
        },
      });
      return;
    }
    if (chipId.startsWith("chip:furnishing:")) {
      set({ filters: { ...filters, furnishingTypeId: null } });
      return;
    }
    if (chipId.startsWith("chip:amenity:")) {
      const id = chipId.replace("chip:amenity:", "");
      set({
        filters: {
          ...filters,
          amenityIds: filters.amenityIds.filter((x) => x !== id),
        },
      });
      return;
    }
    if (chipId === "chip:budget") {
      set({ filters: { ...filters, minBudget: null, maxBudget: null } });
    }
  },
}));

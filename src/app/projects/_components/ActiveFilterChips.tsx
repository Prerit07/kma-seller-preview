"use client";

import { X } from "lucide-react";
import { useProjectsStore } from "../_store/useProjectsStore";
import { useEndUserFilters } from "@/api/hooks/useEndUserFilters";
import { cx } from "../_utils/format";

function findNameById(
  list: Array<{ id: string; name: string }> | undefined,
  id: string
): string {
  return list?.find((x) => x.id === id)?.name ?? id;
}

export default function ActiveFilterChips() {
  const filters = useProjectsStore((s) => s.filters);
  const removeChip = useProjectsStore((s) => s.removeChip);
  const { data: filterOptions } = useEndUserFilters({});

  const chips: Array< { id: string; label: string }> = [];

  if (filters.categoryId != null) {
    chips.push({
      id: `chip:category:${filters.categoryId}`,
      label: findNameById(filterOptions?.categories, filters.categoryId),
    });
  }

  for (const id of filters.propertyTypeIds) {
    chips.push({
      id: `chip:propertyType:${id}`,
      label: findNameById(filterOptions?.propertyTypes, id),
    });
  }

  for (const id of filters.bhkTypeIds) {
    chips.push({
      id: `chip:bhk:${id}`,
      label: findNameById(filterOptions?.bhkTypes, id),
    });
  }

  if (filters.furnishingTypeId != null) {
    chips.push({
      id: "chip:furnishing:any",
      label: findNameById(filterOptions?.furnishing, filters.furnishingTypeId),
    });
  }

  for (const id of filters.amenityIds) {
    chips.push({
      id: `chip:amenity:${id}`,
      label: findNameById(filterOptions?.amenities, id),
    });
  }

  if (filters.minBudget != null || filters.maxBudget != null) {
    const min = filters.minBudget != null ? `₹ ${filters.minBudget} Crore` : "Any";
    const max = filters.maxBudget != null ? `₹ ${filters.maxBudget} Crore` : "Any";
    chips.push({ id: "chip:budget", label: `${min} – ${max}` });
  }

  if (!chips.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c.id}
          onClick={() => removeChip(c.id)}
          className={cx(
            "group flex cursor-pointer items-center gap-2 rounded-md border border-[#C7C6FF] bg-[#F7F7FF] px-3 py-1.5 text-xs text-text-gray transition hover:brightness-[0.98]"
          )}
        >
          <span>{c.label}</span>
          <span className="rounded-md p-0.5 text-text-gray group-hover:bg-white/60">
            <X className="h-3.5 w-3.5" />
          </span>
        </button>
      ))}
    </div>
  );
}

"use client";

import { useMemo, useTransition } from "react";
import { Search, RotateCcw, Check, ChevronDown } from "lucide-react";
import ActiveFilterChips from "./ActiveFilterChips";
import { useProjectsStore } from "../_store/useProjectsStore";
import { useEndUserFilters } from "@/api/hooks/useEndUserFilters";
import type { PostedByTab, ProjectsFilters } from "../_types";
import { cx } from "../_utils/format";

function SelectField({
  value,
  onChange,
  children,
}: {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={cx(
          "h-10 w-full cursor-pointer appearance-none rounded-md border border-border bg-white px-3 pr-9 text-sm text-text-gray outline-none transition",
          "focus:border-blue focus:ring-2 focus:ring-blue/15"
        )}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-gray"
        aria-hidden
      />
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4">
      <div className="flex items-end justify-between gap-3">
        <div className="text-sm font-semibold text-text-black">{title}</div>
        {hint ? <div className="text-xs text-text-gray">{hint}</div> : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function CheckboxRow({
  checked,
  label,
  onChange,
  disabled,
  compact = false,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <label
      className={cx(
        compact
          ? "inline-flex min-w-0 max-w-full cursor-pointer items-center gap-2 rounded border px-3 py-1.5 text-sm transition"
          : "flex min-w-0 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition",
        checked
          ? "border-blue bg-light-purple"
          : compact
            ? "border-border"
            : "border-border bg-white",
        disabled
          ? "cursor-not-allowed opacity-50"
          : checked
            ? "hover:brightness-[0.98]"
            : compact
              ? "hover:bg-white"
              : ""
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <Check
        className={cx(
          "shrink-0 transition",
          compact ? "h-3 w-3" : "h-3.5 w-3.5",
          checked ? "text-blue" : "text-text-gray/50"
        )}
        aria-hidden
      />
      <span
        className={cx(
          "min-w-0 break-words leading-tight",
          checked ? "font-medium text-text-black" : "text-text-gray"
        )}
      >
        {label}
      </span>
    </label>
  );
}

const POSTED_BY_OPTIONS: Array<{ id: PostedByTab; label: string }> = [
  { id: "owner", label: "Owner" },
  { id: "channel_partner", label: "Channel Partner" },
];

export default function FiltersSidebar() {
  const tab = useProjectsStore((s) => s.tab);
  const setTab = useProjectsStore((s) => s.setTab);
  const filters = useProjectsStore((s) => s.filters);
  const resetFilters = useProjectsStore((s) => s.resetFilters);
  const setFilters = useProjectsStore((s) => s.setFilters);
  const setCategoryId = useProjectsStore((s) => s.setCategoryId);
  const togglePropertyTypeId = useProjectsStore((s) => s.togglePropertyTypeId);
  const toggleBhkTypeId = useProjectsStore((s) => s.toggleBhkTypeId);
  const setFurnishingTypeId = useProjectsStore((s) => s.setFurnishingTypeId);
  const togglePossession = useProjectsStore((s) => s.togglePossession);
  const toggleAmenityId = useProjectsStore((s) => s.toggleAmenityId);

  const [isPending, startTransition] = useTransition();

  const categoryId = filters.categoryId ?? undefined;
  const { data: filtersData } = useEndUserFilters({ categoryId });

  const propertyTypeId =
    filters.propertyTypeIds[0] ?? undefined;
  const { data: filtersDataWithBhk } = useEndUserFilters(
    { categoryId, propertyTypeId },
    { enabled: !!propertyTypeId }
  );

  const patchFilters = <K extends keyof ProjectsFilters>(
    key: K,
    value: ProjectsFilters[K]
  ) => {
    setFilters({ [key]: value } as Pick<ProjectsFilters, K>);
  };

  const categories = filtersData?.categories ?? [];
  const propertyTypes = filtersData?.propertyTypes ?? [];
  const bhkTypes =
    propertyTypeId != null
      ? (filtersDataWithBhk?.bhkTypes ?? [])
      : (filtersData?.bhkTypes ?? []);
  const furnishingList = filtersData?.furnishing ?? [];
  const amenitiesList = filtersData?.amenities ?? [];

  const setBudget = (key: "minBudget" | "maxBudget", raw: string) => {
    const v = raw === "" ? null : Number(raw);
    startTransition(() =>
      patchFilters(key, v == null ? null : Number.isFinite(v) ? v : null)
    );
  };

  const setSize = (key: "minSizeSqYd" | "maxSizeSqYd", raw: string) => {
    const v = raw === "" ? null : Number(raw);
    startTransition(() =>
      patchFilters(key, v == null ? null : Number.isFinite(v) ? v : null)
    );
  };

  return (
    <div className="overflow-hidden rounded-lg">
      <div className="sticky top-0 z-10 border-b border-border pb-4 pt-1 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="text-base font-semibold text-text-black">Filters</div>
          <button
            onClick={() => startTransition(() => resetFilters())}
            className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-sm font-medium text-blue hover:bg-light-purple hover:underline"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        <ActiveFilterChips />

        {isPending && (
          <div className="mt-3 rounded bg-light-purple px-3 py-2 text-xs text-blue">
            Updating filters…
          </div>
        )}
      </div>

      <div className="divide-y divide-border">
        <Section title="Budget" hint="₹ Crore">
          <div className="grid grid-cols-2 gap-1">
            <SelectField
              value={filters.minBudget ?? ""}
              onChange={(e) => setBudget("minBudget", e.target.value)}
              className="h-9 w-full cursor-pointer rounded-md border border-border  px-3 text-sm text-text-gray outline-none transition focus:border-blue"
            >
              <option value="">Min</option>
              {[0.5, 1, 1.4, 2, 5, 10].map((v) => (
                <option key={v} value={v}>
                  ₹ {v} Cr
                </option>
              ))}
            </SelectField>
            <SelectField
              value={filters.maxBudget ?? ""}
              onChange={(e) => setBudget("maxBudget", e.target.value)}
              className="h-9 w-full cursor-pointer rounded-md border border-border  px-3 text-sm text-text-gray outline-none transition focus:border-blue"
            >
              <option value="">Max</option>
              {[1, 2, 5, 10, 20].map((v) => (
                <option key={v} value={v}>
                  ₹ {v} Cr
                </option>
              ))}
            </SelectField>
          </div>
        </Section>

        <Section title="Size" hint="Sq. Yd.">
          <div className="grid grid-cols-2 gap-1">
            <SelectField
              value={filters.minSizeSqYd ?? ""}
              onChange={(e) => setSize("minSizeSqYd", e.target.value)}
              className="h-9 w-full cursor-pointer rounded-md border border-border px-3 text-sm text-text-gray outline-none transition focus:border-blue"
            >
              <option value="">Min</option>
              {[50, 100, 119, 150, 200].map((v) => (
                <option key={v} value={v}>
                  {v} Sq.Yd.
                </option>
              ))}
            </SelectField>
            <SelectField
              value={filters.maxSizeSqYd ?? ""}
              onChange={(e) => setSize("maxSizeSqYd", e.target.value)}
              className="h-9 w-full cursor-pointer rounded-md border border-border px-3 text-sm text-text-gray outline-none transition focus:border-blue"
            >
              <option value="">Max</option>
              {[119, 150, 200, 300].map((v) => (
                <option key={v} value={v}>
                  {v} Sq.Yd.
                </option>
              ))}
            </SelectField>
          </div>
        </Section>

        <Section title="Building Type">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => startTransition(() => setCategoryId(null))}
              className={cx(
                "h-9 cursor-pointer rounded-md border text-sm font-medium transition",
                filters.categoryId == null
                  ? "border-blue bg-blue text-white"
                  : "border-border  text-text-gray"
              )}
              aria-pressed={filters.categoryId == null}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() =>
                  startTransition(() =>
                    setCategoryId(filters.categoryId === c.id ? null : c.id)
                  )
                }
                className={cx(
                  "h-9 cursor-pointer rounded-md border text-sm font-medium transition",
                  filters.categoryId === c.id
                    ? "border-blue bg-blue text-white"
                    : "border-border  text-text-gray"
                )}
                aria-pressed={filters.categoryId === c.id}
              >
                {c.name}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Localities" hint="Search by area">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-gray" />
            <input
              value={filters.searchLocality}
              onChange={(e) =>
                startTransition(() => setFilters({ searchLocality: e.target.value }))
              }
              placeholder="Search locality..."
              className="h-9 w-full rounded-md border border-border  pl-9 pr-3 text-sm text-text-gray outline-none transition focus:border-blue"
            />
          </div>
        </Section>

        <Section title="Posted by">
          <div className="grid grid-cols-2 gap-1">
            {POSTED_BY_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => startTransition(() => setTab(t.id))}
                className={cx(
                  "h-9 cursor-pointer rounded-md border text-sm transition",
                  tab === t.id
                    ? "border-blue bg-blue text-white"
                    : "border-border  text-text-gray"
                )}
                aria-pressed={tab === t.id}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Property Type">
          <div className="flex flex-wrap gap-1">
            {propertyTypes.map((p) => (
              <CheckboxRow
                key={p.id}
                checked={filters.propertyTypeIds.includes(p.id)}
                label={p.name}
                onChange={() => startTransition(() => togglePropertyTypeId(p.id))}
                compact
              />
            ))}
          </div>
        </Section>

        <Section title="Bedroom">
          <div className="flex flex-wrap gap-2">
            {bhkTypes.map((b) => (
              <CheckboxRow
                key={b.id}
                checked={filters.bhkTypeIds.includes(b.id)}
                label={b.name}
                onChange={() => startTransition(() => toggleBhkTypeId(b.id))}
                compact
              />
            ))}
          </div>
        </Section>

        <Section title="Furnishing Status">
          <div className="flex flex-wrap gap-2">
            <CheckboxRow
              checked={filters.furnishingTypeId == null}
              label="Any"
              onChange={() =>
                startTransition(() => setFurnishingTypeId(null))
              }
              compact
            />
            {furnishingList.map((f) => (
              <CheckboxRow
                key={f.id}
                checked={filters.furnishingTypeId === f.id}
                label={f.name}
                onChange={() =>
                  startTransition(() =>
                    setFurnishingTypeId(
                      filters.furnishingTypeId === f.id ? null : f.id
                    )
                  )
                }
                compact
              />
            ))}
          </div>
        </Section>

        <Section title="Possession Status">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "ready_to_move" as const, label: "Ready To Move" },
              { id: "under_construction" as const, label: "Under Construction" },
            ].map((p) => (
              <CheckboxRow
                key={p.id}
                checked={filters.possessionStatuses.includes(p.id)}
                label={p.label}
                onChange={() => startTransition(() => togglePossession(p.id))}
                compact
              />
            ))}
          </div>
        </Section>

        <Section title="Amenities">
          <div className="flex flex-wrap gap-2">
            {amenitiesList.map((a) => (
              <CheckboxRow
                key={a.id}
                checked={filters.amenityIds.includes(a.id)}
                label={a.name}
                onChange={() => startTransition(() => toggleAmenityId(a.id))}
                compact
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

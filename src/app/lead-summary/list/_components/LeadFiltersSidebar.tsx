"use client";

import { Search, RotateCcw, ChevronDown } from "lucide-react";
import { LeadBuildingType } from "@/services/leadService";

export interface LeadFilters {
  budgetMin: number | null;
  budgetMax: number | null;
  sizeMin: number | null;
  sizeMax: number | null;
  buildingType: LeadBuildingType | null;
  locality: string;
}

export const DEFAULT_LEAD_FILTERS: LeadFilters = {
  budgetMin: null,
  budgetMax: null,
  sizeMin: null,
  sizeMax: null,
  buildingType: null,
  locality: "",
};

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
        className="h-10 w-full cursor-pointer appearance-none rounded-md border border-[#e3e3e3] bg-white px-3 pr-9 text-sm text-text-gray outline-none transition hover:bg-[#fafafa] focus:border-blue focus:ring-2 focus:ring-blue/15"
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

interface LeadFiltersSidebarProps {
  filters: LeadFilters;
  onChange: (filters: LeadFilters) => void;
}

export default function LeadFiltersSidebar({ filters, onChange }: LeadFiltersSidebarProps) {
  const update = (patch: Partial<LeadFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const reset = () => {
    onChange({ ...DEFAULT_LEAD_FILTERS });
  };

  return (
    <div className="overflow-hidden rounded-lg">
      <div className="sticky top-0 z-10 border-b border-[#e3e3e3] pb-4 pt-1 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="text-base font-semibold text-text-black">Filters</div>
          <button
            onClick={reset}
            className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-sm font-medium text-blue hover:bg-[#eef0ff] hover:underline"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="divide-y divide-[#e3e3e3]">
        <Section title="Budget" hint="₹ Crore">
          <div className="grid grid-cols-2 gap-1">
            <SelectField
              value={filters.budgetMin ?? ""}
              onChange={(e) =>
                update({ budgetMin: e.target.value === "" ? null : Number(e.target.value) * 10000000 })
              }
            >
              <option value="">Min</option>
              {[0.2, 0.4, 0.5, 0.75, 1, 1.5, 2, 5, 10].map((v) => (
                <option key={v} value={v}>
                  ₹ {v} Cr
                </option>
              ))}
            </SelectField>
            <SelectField
              value={filters.budgetMax ?? ""}
              onChange={(e) =>
                update({ budgetMax: e.target.value === "" ? null : Number(e.target.value) * 10000000 })
              }
            >
              <option value="">Max</option>
              {[0.5, 0.75, 1, 1.5, 2, 5, 10, 20].map((v) => (
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
              value={filters.sizeMin ?? ""}
              onChange={(e) =>
                update({ sizeMin: e.target.value === "" ? null : Number(e.target.value) })
              }
            >
              <option value="">Min</option>
              {[50, 100, 119, 150, 200, 500, 1000].map((v) => (
                <option key={v} value={v}>
                  {v} Sq.Yd.
                </option>
              ))}
            </SelectField>
            <SelectField
              value={filters.sizeMax ?? ""}
              onChange={(e) =>
                update({ sizeMax: e.target.value === "" ? null : Number(e.target.value) })
              }
            >
              <option value="">Max</option>
              {[119, 150, 200, 300, 500, 1000, 2000].map((v) => (
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
              onClick={() => update({ buildingType: null })}
              className={`h-9 cursor-pointer rounded-md border text-sm font-medium transition ${
                filters.buildingType == null
                  ? "border-blue bg-blue text-white"
                  : "border-[#e3e3e3] text-text-gray hover:bg-[#fafafa]"
              }`}
            >
              All
            </button>
            <button
              onClick={() =>
                update({
                  buildingType:
                    filters.buildingType === LeadBuildingType.COMMERCIAL
                      ? null
                      : LeadBuildingType.COMMERCIAL,
                })
              }
              className={`h-9 cursor-pointer rounded-md border text-sm font-medium transition ${
                filters.buildingType === LeadBuildingType.COMMERCIAL
                  ? "border-blue bg-blue text-white"
                  : "border-[#e3e3e3] text-text-gray hover:bg-[#fafafa]"
              }`}
            >
              Commercial
            </button>
            <button
              onClick={() =>
                update({
                  buildingType:
                    filters.buildingType === LeadBuildingType.RESIDENTIAL
                      ? null
                      : LeadBuildingType.RESIDENTIAL,
                })
              }
              className={`h-9 cursor-pointer rounded-md border text-sm font-medium transition ${
                filters.buildingType === LeadBuildingType.RESIDENTIAL
                  ? "border-blue bg-blue text-white"
                  : "border-[#e3e3e3] text-text-gray hover:bg-[#fafafa]"
              }`}
            >
              Residential
            </button>
          </div>
        </Section>

        <Section title="Localities" hint="Search by area">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-gray" />
            <input
              value={filters.locality}
              onChange={(e) => update({ locality: e.target.value })}
              placeholder="Search locality..."
              className="h-9 w-full rounded-md border border-[#e3e3e3] pl-9 pr-3 text-sm text-text-gray outline-none transition focus:border-blue"
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

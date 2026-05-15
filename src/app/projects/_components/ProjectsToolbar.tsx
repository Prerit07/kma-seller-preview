"use client";

import { useTransition } from "react";
import { ChevronDown, Leaf, Shield } from "lucide-react";
import { useProjectsStore } from "../_store/useProjectsStore";
import type { PostedByTab, SortOption } from "../_types";
import { cx } from "../_utils/format";

const TABS: Array<{
  id: PostedByTab;
  label: string;
  icon?: React.ReactNode;
}> = [
    { id: "all", label: "All" },
    {
      id: "owner",
      label: "Owner",
      icon:
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_1_11939)">
            <path d="M14.3935 0C18.4933 0 21.8291 3.33575 21.8291 7.43557C21.8291 11.5359 18.4933 14.8711 14.3935 14.8711C13.4815 14.8711 12.5956 14.7091 11.7546 14.3889L10.0303 16.1131C9.92868 16.2147 9.7909 16.2718 9.64722 16.2719H8.48109V17.4374C8.48109 17.7371 8.23832 17.9793 7.93921 17.9793H7.40816V18.5104C7.40816 18.81 7.16539 19.0523 6.86628 19.0523H5.54143V20.3793C5.54143 20.5229 5.48398 20.6611 5.3821 20.7624L4.30161 21.8413C4.25147 21.8916 4.19187 21.9316 4.12623 21.9588C4.06059 21.9861 3.99021 22.0001 3.91914 22H0.712899C0.413794 22 0.171021 21.7572 0.171021 21.4581V17.5675C0.171021 17.4239 0.22847 17.2857 0.32979 17.1844L7.4397 10.0739C7.12001 9.23295 6.95798 8.34698 6.95798 7.43557C6.95793 3.33575 10.2932 0 14.3935 0ZM20.7454 7.43557C20.7454 3.93345 17.8957 1.08376 14.3935 1.08376C10.8909 1.08376 8.04173 3.93345 8.04173 7.43557C8.04173 8.32262 8.22057 9.1804 8.5733 9.98508C8.66487 10.1932 8.61447 10.4278 8.46493 10.5811C8.4633 10.5828 8.46223 10.5844 8.46059 10.586L1.25474 17.7918V18.771L7.18825 12.8375C7.37899 12.6473 7.68733 12.6473 7.87807 12.8375C8.06825 13.0282 8.06825 13.3366 7.87807 13.5273L1.25474 20.1506V20.9162H3.6948L4.45775 20.1544V18.5103C4.45775 18.2112 4.70053 17.9685 4.99963 17.9685H6.32449V17.4374C6.32449 17.1383 6.56726 16.8955 6.86637 16.8955H7.39742V15.73C7.39742 15.4303 7.64019 15.1881 7.9393 15.1881H9.42292L11.2425 13.368C11.2442 13.3663 11.2458 13.3653 11.2474 13.3636C11.4012 13.2141 11.6353 13.1637 11.8434 13.2553C12.6487 13.6085 13.5065 13.7874 14.3935 13.7874C17.8956 13.7874 20.7454 10.9382 20.7454 7.43557Z" fill="#4CAF50" />
            <path d="M14.3935 1.08398C17.8957 1.08398 20.7453 3.93367 20.7453 7.4358C20.7453 10.9384 17.8957 13.7876 14.3935 13.7876C13.5065 13.7876 12.6487 13.6088 11.8435 13.2555C11.6354 13.1639 11.4013 13.2143 11.2474 13.3639C11.2458 13.3655 11.2441 13.3666 11.2425 13.3682L9.42295 15.1883H7.93932C7.64022 15.1883 7.39744 15.4306 7.39744 15.7302V16.8958H6.86639C6.56729 16.8958 6.32451 17.1386 6.32451 17.4377V17.9687H4.99966C4.70055 17.9687 4.45778 18.2115 4.45778 18.5106V20.1546L3.69483 20.9165H1.25476V20.1509L7.87805 13.5276C8.06823 13.3368 8.06823 13.0285 7.87805 12.8377C7.68731 12.6476 7.37897 12.6476 7.18823 12.8377L1.25476 18.7712V17.792L8.46058 10.5862C8.46221 10.5846 8.46328 10.583 8.46492 10.5814C8.61449 10.428 8.66485 10.1934 8.57328 9.9853C8.22051 9.18063 8.04172 8.32284 8.04172 7.4358C8.04172 3.93367 10.8909 1.08398 14.3935 1.08398ZM18.6857 5.17293C18.6857 4.05398 17.7754 3.14309 16.6564 3.14309C15.5369 3.14309 14.6265 4.05398 14.6265 5.17293C14.6265 6.29188 15.5369 7.20278 16.6564 7.20278C17.7754 7.20278 18.6857 6.29188 18.6857 5.17293Z" fill="#4CAF50" fill-opacity="0.3" />
            <path d="M16.6564 3.14258C17.7754 3.14258 18.6858 4.05347 18.6858 5.17242C18.6858 6.29137 17.7754 7.20227 16.6564 7.20227C15.5369 7.20227 14.6266 6.29137 14.6266 5.17242C14.6266 4.05347 15.5369 3.14258 16.6564 3.14258ZM17.602 5.17242C17.602 4.65061 17.1777 4.22629 16.6564 4.22629C16.1346 4.22629 15.7103 4.65057 15.7103 5.17242C15.7103 5.69428 16.1346 6.11855 16.6564 6.11855C17.1777 6.11855 17.602 5.69423 17.602 5.17242Z" fill="#4CAF50" />
            <path d="M16.6563 4.22656C17.1776 4.22656 17.6019 4.65084 17.6019 5.17269C17.6019 5.69455 17.1776 6.11882 16.6563 6.11882C16.1345 6.11882 15.7102 5.69455 15.7102 5.17269C15.7102 4.65084 16.1345 4.22656 16.6563 4.22656Z" fill="white" />
          </g>
          <defs>
            <clipPath id="clip0_1_11939">
              <rect width="22" height="22" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ,
    },
    {
      id: "channel_partner",
      label: "Channel Partner",
      icon: 
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.6914 2.62109H17.1833C15.0047 2.62109 12.9551 1.72734 11.4082 0.193359C11.2922 0.0644531 11.1245 0 10.957 0C10.7895 0 10.6219 0.0644531 10.5059 0.193359C8.95898 1.72734 6.90938 2.62109 4.73077 2.62109H3.22266C2.86163 2.62109 2.57812 2.9046 2.57812 3.26562V11C2.57812 16.7879 6.79345 19.4863 9.57765 21.2395C9.93871 21.4715 10.2866 21.6777 10.596 21.8968C10.7121 21.9612 10.8281 22 10.957 22C11.0859 22 11.202 21.9612 11.3181 21.8968C11.6145 21.6907 11.9497 21.4844 12.3105 21.2523C15.1077 19.4992 19.3359 16.8008 19.3359 11V3.26562C19.3359 2.9046 19.0524 2.62109 18.6914 2.62109Z" fill="#1B2532"/>
      <path d="M19.3359 3.26562V11C19.3359 16.8008 15.1077 19.4992 12.3105 21.2523C11.9497 21.4844 11.6145 21.6907 11.3181 21.8968C11.202 21.9612 11.0859 22 10.957 22V0C11.1245 0 11.2922 0.0644531 11.4082 0.193359C12.9551 1.72734 15.0047 2.62109 17.1833 2.62109H18.6914C19.0524 2.62109 19.3359 2.9046 19.3359 3.26562Z" fill="#0D1520"/>
      <path d="M10.957 5.19922C7.76024 5.19922 5.15625 7.80304 5.15625 11C5.15625 14.1968 7.76024 16.8008 10.957 16.8008C14.1538 16.8008 16.7578 14.1968 16.7578 11C16.7578 7.80304 14.1538 5.19922 10.957 5.19922Z" fill="#EFEFEF"/>
      <path d="M16.7578 11C16.7578 14.1968 14.1538 16.8008 10.957 16.8008V5.19922C14.1538 5.19922 16.7578 7.80304 16.7578 11Z" fill="white"/>
      <path d="M13.9863 10.1621L10.7637 13.3848C10.6477 13.5137 10.48 13.5781 10.3125 13.5781C10.145 13.5781 9.97734 13.5137 9.86133 13.3848L7.92773 11.4512C7.66992 11.2062 7.66992 10.7938 7.92773 10.5488C8.17266 10.291 8.58516 10.291 8.83008 10.5488L10.3125 12.0184L10.957 11.3738L13.0842 9.25977C13.3291 9.00195 13.7414 9.00195 13.9863 9.25977C14.2441 9.50469 14.2441 9.91719 13.9863 10.1621Z" fill="#3B3B3B"/>
      <path d="M13.9863 10.1621L10.957 13.1914V11.3738L13.084 9.25977C13.3289 9.00195 13.7414 9.00195 13.9863 9.25977C14.2441 9.50469 14.2441 9.91719 13.9863 10.1621Z" fill="#3B3B3B"/>
      </svg>
      ,
    },
  ];

const SORTS: Array<{ id: SortOption; label: string }> = [
  { id: "price_low_high", label: "Price: Low to High" },
  { id: "price_high_low", label: "Price: High to Low" },
];

export default function ProjectsToolbar({ total }: { total: number }) {
  const tab = useProjectsStore((s) => s.tab);
  const sort = useProjectsStore((s) => s.sort);
  const setTab = useProjectsStore((s) => s.setTab);
  const setSort = useProjectsStore((s) => s.setSort);

  const [isPending, startTransition] = useTransition();

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3 text-sm text-text-gray">
        <span>
          Showing{" "}
          <span className="font-semibold text-blue">{total} Property</span>
        </span>
        <span>|</span>
        {/* <span className="text-text-gray">New Projects in {initialProjects[0]?.city}</span> */}
        {isPending ? (
          <span className="ml-1 rounded-full bg-light-purple px-2 py-0.5 text-xs font-medium text-blue">
            Updating…
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => startTransition(() => setTab(t.id))}
              className={cx(
                "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border px-5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30",
                tab === t.id
                  ? "border-blue bg-blue text-white"
                  : "border-border bg-white text-text-gray"
              )}
              aria-pressed={tab === t.id}
            >
              {t.icon ? <span aria-hidden>{t.icon}</span> : null}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3">
          <span className="text-sm font-semibold text-text-black">Sort By :</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => startTransition(() => setSort(e.target.value as SortOption))}
              className="h-10 min-w-[180px] cursor-pointer appearance-none rounded-full border border-border px-4 pr-10 text-sm text-text-gray outline-none focus:border-blue"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-gray" />
          </div>
        </div>
      </div>
    </div>
  );
}


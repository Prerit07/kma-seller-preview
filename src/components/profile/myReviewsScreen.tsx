"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMyReviews } from "@/api/hooks/useMyReviews";
import type { MyReviewItem } from "@/api/actions/propertyActions";

function renderStars(rating: number) {
  const full = Math.min(5, Math.round(rating));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function ReviewCard({ review }: { review: MyReviewItem }) {
  const title =
    review.propertyName ??
    review.title ??
    review.property?.propertyName ??
    review.property?.title ??
    "Property";
  const address =
    review.propertyAddress ??
    review.address ??
    review.property?.address ??
    "";
  const imageUrl = review.propertyImageUrl ?? undefined;
  const rating = review.overallRating ?? 0;
  const description = [review.likeText, review.reviewText, review.dislikeText]
    .filter(Boolean)
    .join(" ") || "No review text.";
  const projectId = review.projectId ?? review.propertyId;
  const listingId = review.listingId ?? review.propertyId;
  const hasLink = !!(projectId && listingId);
  const href = hasLink ? `/projects/${projectId}/${listingId}` : "#";

  return (
    <article className="relative rounded-xl border border-[#E6E8EC] overflow-hidden bg-white">
      {imageUrl && (
        <div className="relative h-[120px] w-full bg-[#E6E8EC]">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            unoptimized={imageUrl.startsWith("http")}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {!imageUrl && (
            <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6F88D9] via-[#B1C4EA] to-[#DFA473] text-xs font-semibold text-white">
              {title.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-text-black">{title}</p>
            {address ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-text-gray">
                <Image src="/assets/location-blue.svg" width={11} height={11} alt="location" />
                <span className="truncate">{address}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm tracking-[1px] text-[#FFB300]">
            {renderStars(rating)}
          </span>
          <span className="text-sm font-medium text-text-black">
            {rating > 0 ? rating.toFixed(1) : "—"}
          </span>
        </div>

        <p className="mt-2 pr-10 text-xs leading-5 text-text-gray line-clamp-3">
          {description}
        </p>

        {hasLink ? (
          <Link
            href={href}
            className="absolute bottom-3 right-3 flex h-[32px] w-[32px] items-center justify-center rounded-full border border-border transition hover:bg-[#F5F5F5]"
            aria-label="View property"
          >
            <Image src="/assets/navigate-arrow-blue.svg" width={14} height={14} alt="" />
          </Link>
        ) : (
          <span className="absolute bottom-3 right-3 flex h-[32px] w-[32px] items-center justify-center rounded-full border border-border text-text-gray">
            <Image src="/assets/navigate-arrow-blue.svg" width={14} height={14} alt="" />
          </span>
        )}
      </div>
    </article>
  );
}

export default function MyReviewsScreen({ fetchEnabled = true }: { fetchEnabled?: boolean }) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const PAGE_SIZE = 9;
  const {
    reviews,
    total,
    totalPages,
    currentPage,
    limit,
    isLoading,
    isError,
    refetch,
  } = useMyReviews({ page, limit: PAGE_SIZE, sortBy, enabled: fetchEnabled });

  return (
    <div className="rounded-xl bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[30px] font-semibold leading-none text-text-black">
          My Reviews
        </h2>

        {fetchEnabled && (
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-sm font-medium text-text-black">Sort By :</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-text-gray"
            >
              <span>{sortBy === "newest" ? "Newest first" : "Oldest first"}</span>
              <Image
                src="/assets/down-arrow-outline-black.svg"
                width={12}
                height={12}
                alt="sort"
                className={sortOpen ? "rotate-180" : ""}
              />
            </button>
            {sortOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setSortOpen(false)}
                />
                <ul
                  className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-border bg-white py-1 shadow-lg"
                  role="listbox"
                >
                  <li>
                    <button
                      type="button"
                      role="option"
                      aria-selected={sortBy === "newest"}
                      onClick={() => {
                        setSortBy("newest");
                        setSortOpen(false);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-text-black hover:bg-[#F5F5F5]"
                    >
                      Newest first
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      role="option"
                      aria-selected={sortBy === "oldest"}
                      onClick={() => {
                        setSortBy("oldest");
                        setSortOpen(false);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-text-black hover:bg-[#F5F5F5]"
                    >
                      Oldest first
                    </button>
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
        )}
      </div>

      {!fetchEnabled && (
        <div className="mt-5 rounded-xl border border-[#E6E8EC] p-8 text-center">
          <p className="text-sm text-text-gray">Sign in to see reviews you have submitted.</p>
        </div>
      )}

      {fetchEnabled && isLoading && (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[180px] animate-pulse rounded-xl border border-[#E6E8EC] bg-[#F5F5F5] p-4"
            />
          ))}
        </div>
      )}

      {fetchEnabled && isError && (
        <div className="mt-5 rounded-xl border border-[#E6E8EC] bg-[#FEF2F2] p-6 text-center">
          <p className="text-sm text-[#991B1B]">Failed to load your reviews.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-text-black hover:bg-[#F5F5F5]"
          >
            Try again
          </button>
        </div>
      )}

      {fetchEnabled && !isLoading && !isError && reviews.length === 0 && (
        <div className="mt-5 rounded-xl border border-[#E6E8EC] p-8 text-center">
          <p className="text-sm text-text-gray">You haven’t submitted any reviews yet.</p>
          <p className="mt-1 text-xs text-text-gray">
            Your property reviews will appear here once you add them.
          </p>
        </div>
      )}

      {fetchEnabled && !isLoading && !isError && reviews.length > 0 && (
        <>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-text-gray">
              Showing {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, total)} of {total} review{total !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-black disabled:opacity-50 hover:enabled:bg-[#F5F5F5]"
              >
                Previous
              </button>
              {totalPages > 1 && (
                <span className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`h-8 min-w-[32px] rounded-full px-2 text-xs font-medium transition ${
                        currentPage === p
                          ? "bg-blue text-white"
                          : "border border-border text-text-black hover:bg-[#F5F5F5]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </span>
              )}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-black disabled:opacity-50 hover:enabled:bg-[#F5F5F5]"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

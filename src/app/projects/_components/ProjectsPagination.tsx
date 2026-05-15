"use client";

interface ProjectsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const getVisiblePages = (currentPage: number, totalPages: number) => {
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  let start = Math.max(1, currentPage - 1);
  let end = Math.min(totalPages, start + 2);

  if (end - start < 2) {
    start = Math.max(1, end - 2);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

export default function ProjectsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ProjectsPaginationProps) {
  const visiblePages = getVisiblePages(currentPage, totalPages);
  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return (
    <nav
      aria-label="Projects pagination"
      className="mt-6 flex items-center gap-2 text-md"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isPrevDisabled}
        className="inline-flex h-12 min-w-[80px] items-center justify-center rounded border border-border bg-white px-4 text-[#888888] transition disabled:cursor-not-allowed disabled:opacity-70"
      >
        Prev
      </button>

      {visiblePages.map((page) => {
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex h-12 w-12 items-center justify-center rounded border transition ${
              isActive
                ? "border-[#010048] bg-[#010048] text-white"
                : "border-border bg-white text-[#888888]"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isNextDisabled}
        className="inline-flex h-12 min-w-[80px] items-center justify-center rounded border border-border bg-white px-4 text-[#010048] transition disabled:cursor-not-allowed disabled:opacity-70"
      >
        Next
      </button>
    </nav>
  );
}

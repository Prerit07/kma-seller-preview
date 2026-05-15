"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cx } from "../_utils/format";

export default function ImageCarousel({
  images,
  alt,
  priority,
}: {
  images: string[];
  alt: string;
  priority?: boolean;
}) {
  const safeImages = useMemo(() => (images?.length ? images : []), [images]);
  const [idx, setIdx] = useState(0);
  const total = safeImages.length || 1;
  const current = safeImages[idx] ?? safeImages[0];

  const canPrev = idx > 0;
  const canNext = idx < total - 1;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#D9D9D9]">
      {current ? (
        <Image
          src={current}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 360px"
          className="object-cover"
          priority={Boolean(priority)}
        />
      ) : (
        <div className="h-full w-full" />
      )}

      <button
        type="button"
        onClick={() => canPrev && setIdx((i) => i - 1)}
        disabled={!canPrev}
        className={cx(
          "absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white transition",
          canPrev ? "hover:bg-black/70" : "opacity-30"
        )}
        aria-label="Previous image"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => canNext && setIdx((i) => i + 1)}
        disabled={!canNext}
        className={cx(
          "absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white transition",
          canNext ? "hover:bg-black/70" : "opacity-30"
        )}
        aria-label="Next image"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-3 left-3 rounded-lg bg-black/55 px-2 py-1 text-xs text-white">
        {idx + 1}/{total}
      </div>
    </div>
  );
}


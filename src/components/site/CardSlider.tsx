import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Mobile-first card layout: a swipeable, snap-scrolling horizontal slider on
 * small screens (cards peek to signal there's more), upgrading to the passed
 * grid layout from `sm` upwards. `gridClassName` supplies the responsive grid
 * columns (e.g. "sm:grid-cols-2 lg:grid-cols-4").
 */
export function CardSlider({
  gridClassName,
  children,
}: {
  gridClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        // Mobile: edge-to-edge horizontal snap scroller, scrollbar hidden.
        "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "[&>*]:min-w-[78%] [&>*]:snap-start",
        // sm+: revert to a normal grid.
        "sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 sm:[&>*]:min-w-0",
        gridClassName,
      )}
    >
      {children}
    </div>
  );
}

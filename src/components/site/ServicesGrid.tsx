import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function ServicesGrid({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const childArray = Array.isArray(children) ? children : [children];

  // On mobile show 3, on desktop show all
  const visibleCount = expanded ? childArray.length : 3;
  const displayedChildren = childArray.slice(0, visibleCount);
  const hasMore = childArray.length > 3 && !expanded;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedChildren}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            onClick={() => setExpanded(true)}
            variant="outline"
            className="border-primary/40 hover:bg-primary/10 gap-2"
          >
            Show More Services <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

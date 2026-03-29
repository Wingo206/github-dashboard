import { type ReactNode, Fragment, useState, useEffect, useRef } from "react";
import { StyledPanel } from "./StyledPanel";
import { StyledSmallButton } from "./StyledSmallButton";
import { cn } from "./cn";

const DEFAULT_PAGE_SIZE = 5;

interface PaginatedListProps<T> {
  header: ReactNode;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string | number;
  itemHeight: number;
  pageSize?: number;
  className?: string;
}

export function PaginatedList<T>({
  header,
  items,
  renderItem,
  keyExtractor,
  itemHeight,
  pageSize,
  className,
}: PaginatedListProps<T>) {
  const [page, setPage] = useState(0);
  const [measuredPageSize, setMeasuredPageSize] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el || !itemHeight) return;

    const observer = new ResizeObserver((entries) => {
      const height = entries[0].contentRect.height;
      const computed = Math.max(1, Math.floor(height / itemHeight));
      setMeasuredPageSize(computed);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [itemHeight]);

  const effectivePageSize = measuredPageSize ?? pageSize ?? DEFAULT_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(items.length / effectivePageSize));

  useEffect(() => {
    setPage(0);
  }, [items.length, effectivePageSize]);

  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * effectivePageSize;
  const pageItems = items.slice(start, start + effectivePageSize);

  return (
    <StyledPanel className={cn("h-full flex flex-col", className)}>
      <div className="shrink-0">{header}</div>
      <div ref={contentRef} className="flex-1 overflow-hidden">
        {pageItems.map((item, i) => (
          <Fragment key={keyExtractor(item)}>
            {renderItem(item, start + i)}
          </Fragment>
        ))}
      </div>
      <PaginationControls
        page={safePage}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        onPage={setPage}
      />
    </StyledPanel>
  );
}

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPage: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }

  if (current <= 3) {
    return [0, 1, 2, 3, 4, "ellipsis", total - 1];
  }

  if (current >= total - 4) {
    return [0, "ellipsis", total - 5, total - 4, total - 3, total - 2, total - 1];
  }

  return [0, "ellipsis", current - 1, current, current + 1, "ellipsis", total - 1];
}

function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext,
  onPage,
}: PaginationControlsProps) {
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="shrink-0 flex items-center justify-center gap-1 px-4 py-2 border-t border-gh-border bg-gh-surface text-xs">
      <StyledSmallButton onClick={onPrev} disabled={page === 0} className="min-w-[4.5rem]">
        &lsaquo; Previous
      </StyledSmallButton>

      {pageNumbers.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="min-w-[1.5rem] px-2 py-0.5 flex items-center justify-center text-gh-muted">
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={cn(
              "min-w-[1.5rem] px-2 py-0.5 rounded-md flex items-center justify-center transition-colors",
              p === page
                ? "bg-gh-accent/15 text-gh-accent font-semibold"
                : "text-gh-muted hover:text-gh-text hover:bg-gh-border/50",
            )}
          >
            {p + 1}
          </button>
        ),
      )}

      <StyledSmallButton onClick={onNext} disabled={page === totalPages - 1} className="min-w-[4.5rem]">
        Next &rsaquo;
      </StyledSmallButton>
    </div>
  );
}

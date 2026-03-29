import type { ReactNode } from "react";
import { PaginatedList } from "./PaginatedList";
import { StyledPanelHeader } from "./StyledPanel";

interface SimplePaginatedListProps<T> {
  title: string;
  itemLabel?: string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string | number;
  itemHeight: number;
  pageSize?: number;
  className?: string;
}

function pluralize(count: number, singular: string): string {
  if (singular.endsWith("ch") || singular.endsWith("s")) {
    return count === 1 ? singular : `${singular}es`;
  }
  return count === 1 ? singular : `${singular}s`;
}

export function SimplePaginatedList<T>({
  title,
  itemLabel = "item",
  items,
  renderItem,
  keyExtractor,
  itemHeight,
  pageSize,
  className,
}: SimplePaginatedListProps<T>) {
  const trailing = `${items.length} ${pluralize(items.length, itemLabel)}`;

  return (
    <PaginatedList
      header={<StyledPanelHeader title={title} trailing={trailing} />}
      items={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      itemHeight={itemHeight}
      pageSize={pageSize}
      className={className}
    />
  );
}

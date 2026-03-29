import type { PRStore } from "../controllers";
import { usePRStoreState } from "../hooks/usePRStore";
import { StyledPanelHeader, SimplePaginatedList, ListSkeleton, ListError, ListEmpty } from "../ui";
import { PR_ITEM_HEIGHT } from "../constants/listHeights";
import PRCard from "./PRCard";

interface PRListProps {
  title: string;
  store: PRStore;
}

export default function PRList({ title, store }: PRListProps) {
  const state = usePRStoreState(store);
  const header = <StyledPanelHeader title={title} />;

  if (state.status === "loading")
    return <ListSkeleton header={header} message="Fetching pull requests..." className="h-full" />;
  if (state.status === "error")
    return <ListError header={header} error={state.error} className="h-full" />;
  if (state.data.length === 0)
    return <ListEmpty header={header} message="No pull requests found." className="h-full" />;

  return (
    <SimplePaginatedList
      title={title}
      itemLabel="pull request"
      items={state.data}
      renderItem={(pr) => <PRCard pr={pr} />}
      keyExtractor={(pr) => pr.id}
      itemHeight={PR_ITEM_HEIGHT}
      className="h-full"
    />
  );
}

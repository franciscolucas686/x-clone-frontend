export const handlePaginatedList = <T>(
  currentList: T[],
  results: T[],
  next: string | null
) => {
  const updatedList = currentList.length === 0 ? results : [...currentList, ...results];
  const hasMore = next !== null;
  return { updatedList, hasMore };
};

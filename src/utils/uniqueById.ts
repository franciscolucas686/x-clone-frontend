export default function uniqueById<T extends { id: number }>(list: T[]): T[] {
  return Array.from(new Map(list.map((item) => [item.id, item])).values());
}

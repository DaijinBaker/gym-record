export function moveWithinGroup<T>(
  items: T[],
  id: string,
  direction: 'up' | 'down',
  getId: (item: T) => string,
  getGroup: (item: T) => string | undefined
): T[] | null {
  const idx = items.findIndex((item) => getId(item) === id);
  if (idx < 0) return null;

  const group = getGroup(items[idx]);
  const step = direction === 'up' ? -1 : 1;
  let neighbor = -1;
  for (let i = idx + step; i >= 0 && i < items.length; i += step) {
    if (getGroup(items[i]) === group) {
      neighbor = i;
      break;
    }
  }
  if (neighbor === -1) return null;

  const updated = [...items];
  [updated[idx], updated[neighbor]] = [updated[neighbor], updated[idx]];
  return updated;
}

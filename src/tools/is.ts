export function isDefined<T>(
  value: T | undefined,
  thenCallback?: (v: T) => void,
): value is T {
  if (value === undefined) {
    return false;
  }

  if (thenCallback) {
    thenCallback(value);
  }

  return true;
}

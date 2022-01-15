/**
 * Get the closest parent element of a given element that matches the given
 * selector string or matching function
 *
 * @param {Element} element The child element to find a parent of
 * @param {WeakSet} container The string or function to use to match
 *     the parent element
 * @return {Element|undefined}
 */
export function closestParent(
  element: HTMLElement,
  parentSet: WeakSet<HTMLElement>
) {
  if (!element) {
    return undefined;
  }

  let current = element;

  do {
    if (parentSet.has(current)) {
      return current;
    }

    current.parentElement && (current = current.parentElement);
  } while (
    current &&
    current !== document.body &&
    current !== document.documentElement
  );

  return undefined;
}

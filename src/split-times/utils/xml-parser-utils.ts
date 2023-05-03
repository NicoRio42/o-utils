export function extractNumberFromElementOrThrowError(
  element: Element | null,
  errorMessage: string
): number {
  if (element === null || element.textContent === null) {
    throw new Error(errorMessage);
  }

  const value = parseInt(element.textContent, 10);

  if (isNaN(value)) {
    throw new Error(errorMessage);
  }

  return value;
}

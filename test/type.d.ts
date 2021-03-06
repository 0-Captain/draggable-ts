export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      isMapKey(key: unknown): R;
      toHaveDefaultPrevented(): R;
    }
  }
}

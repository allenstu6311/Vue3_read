export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * 檢測型別是否為 `any`。
 * If `T` is `any`, returns `Y`, otherwise returns `N`.
 *
 * @template T - The type to check.
 * @template Y - The type to return if `T` is `any`.
 * @template N - The type to return if `T` is not `any`.
 */
export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

// let data: IfAny<"1", string, number> = "1";

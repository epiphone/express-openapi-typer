/**
 * Force TS to load a type that has not been computed
 * https://github.com/pirix-gh/ts-toolbelt
 */
export type Compute<A extends any> = A extends Function // tslint:disable-line:ban-types
  ? A
  : { [K in keyof A]: A[K] } & {}

/**
 * Courtesy of @jcalz at https://stackoverflow.com/a/50375286/1763012
 */
export type UnionToIntersection<U> = (U extends any
? (k: U) => void
: never) extends (k: infer I) => void
  ? I
  : never

export type ValueOf<T extends object> = T[keyof T]

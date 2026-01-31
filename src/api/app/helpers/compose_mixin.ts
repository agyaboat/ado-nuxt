export type Constructor<T = {}> = new (...args: any[]) => T

export function composeMixins<TBases extends readonly Constructor[]>(...bases: TBases) {
  class Combined {
    constructor() {
      for (const B of bases) {
        Object.assign(this, new B())
      }
    }
  }

  // Copy prototype methods
  for (const B of bases) {
    for (const key of Object.getOwnPropertyNames(B.prototype)) {
      if (key !== 'constructor') {
        Object.defineProperty(
          Combined.prototype,
          key,
          Object.getOwnPropertyDescriptor(B.prototype, key)!
        )
      }
    }
  }

  return Combined as Constructor<MergedInstances<TBases>>
}

/** Computes intersection of instance types of classes in tuple */
type MergedInstances<T extends readonly Constructor[]> = T extends readonly [
  infer Head,
  ...infer Tail,
]
  ? Head extends Constructor
    ? Tail extends readonly Constructor[]
      ? InstanceType<Head> & MergedInstances<Tail>
      : InstanceType<Head>
    : {}
  : {} // <- SAFE default, not never

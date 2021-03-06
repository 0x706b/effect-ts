/**
 * tracing: off
 */
declare global {
  interface Object {
    /**
     * To be used like
     * ```ts
     * T.succeed(1)["|>"](T.map(n => n + 1))["|>"](T.map(n => n + 2))
     * ```
     */
    ["|>"]<Self, Result>(this: Self, next: (value: Self) => Result): Result
  }

  interface Function {
    /**
     * This operator does not work with generic parameters
     */
    [">>"]<Args extends any[], A, Result>(
      this: (...args: Args) => A,
      next: (value: A) => Result
    ): (...args: Args) => Result
  }
}

let patched = false

export function patch() {
  if (patched) {
    return
  }
  try {
    Object.defineProperty(Object.prototype, "|>", {
      value<Self, Result>(this: Self, next: (value: Self) => Result): Result {
        return next(this)
      },
      enumerable: false
    })

    Object.defineProperty(Function.prototype, ">>", {
      value<Args extends any[], A, Result>(
        this: (...args: Args) => A,
        next: (value: A) => Result
      ): (...args: Args) => Result {
        return (...args) => next(this(...args))
      },
      enumerable: false
    })
  } catch {
    //
  }
  patched = true
}

patch()

export {}

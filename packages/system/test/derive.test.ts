import * as T from "../src/Effect"
import { pipe } from "../src/Function"
import { has } from "../src/Has"

// module definition

export class CalculatorService {
  factor = 2

  factorFun = () => 3

  base = T.succeed(1)

  add(x: number, y: number) {
    return T.effectTotal(() => x + y)
  }

  mul = (x: number, y: number) => {
    return T.effectTotal(() => x * y)
  }

  gen<A>(a: A) {
    return T.effectTotal(() => a)
  }
}

// module tag
export const Calculator = has(CalculatorService)

// access functions
export const { add, base, factor, factorFun, gen, mul } = T.derive(Calculator)(
  ["add", "mul"],
  ["base"],
  ["factor"],
  ["gen", "factorFun"]
)

// program
const program = pipe(
  T.zip_(
    gen((f) => f(1)),
    factorFun(T.effectTotal)
  ),
  T.chain((_) => T.tuple(base, factor, T.succeed(_))),
  T.chain(([b, f, [x, y]]) => T.chain_(add(b, f), (k) => T.succeed(k + x + y))),
  T.chain((sum) => mul(sum, 3))
)

describe("Derive Access", () => {
  it("should use derived access functions", async () => {
    expect(
      await pipe(
        program,
        T.provideService(Calculator)(new CalculatorService()),
        T.runPromise
      )
    ).toEqual(21)
  })
  it("should use mock", async () => {
    expect(
      await pipe(
        program,
        T.provideService(Calculator)({
          add: () => T.succeed(0),
          mul: () => T.succeed(0),
          base: T.succeed(0),
          factor: 0,
          gen: T.succeed,
          factorFun: () => 0
        }),
        T.runPromise
      )
    ).toEqual(0)
  })
})
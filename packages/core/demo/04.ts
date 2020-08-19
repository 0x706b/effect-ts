import { makeAssociative } from "../src/Classic/Associative"
import * as E from "../src/Classic/Either"
import * as R from "../src/Classic/Record"
import { pipe } from "../src/Function"

const ValidationApplicative = E.getValidationApplicative(
  makeAssociative<string>((r) => (l) => `(${l})(${r})`)
)

const traverse = R.foreachF(ValidationApplicative)

const result = pipe(
  { a: 0, b: 1, c: 2 },
  traverse((n) => (n > 3 ? E.left("bad") : E.right("good")))
)

console.log(result)
import { Auto, Base, Kind, OrE, OrI, OrK, OrR, OrS, OrX, URIS } from "../HKT"

export interface AssociativeBoth<F extends URIS, C = Auto> extends Base<F> {
  readonly both: <K2, SO, SO2, X2, I2, S, R2, E2, B>(
    fb: Kind<
      F,
      OrK<C, K2>,
      SO,
      SO2,
      OrX<C, X2>,
      OrI<C, I2>,
      OrS<C, S>,
      OrR<C, R2>,
      OrE<C, E2>,
      B
    >
  ) => <K, SI, X, I, R, E, A>(
    fa: Kind<
      F,
      OrK<C, K>,
      SI,
      SO,
      OrX<C, X>,
      OrI<C, I>,
      OrS<C, S>,
      OrR<C, R>,
      OrE<C, E>,
      A
    >
  ) => Kind<
    F,
    OrK<C, K2>,
    SI,
    SO2,
    OrX<C, X | X2>,
    OrI<C, I & I2>,
    OrS<C, S>,
    OrR<C, R & R2>,
    OrE<C, E | E2>,
    readonly [A, B]
  >
}
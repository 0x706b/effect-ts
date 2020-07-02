import * as A from "../../Array"
import { pipe } from "../../Function"
import * as T from "../Effect"
import * as S from "../Semaphore"

abstract class Console {
  abstract readonly putStrLn: (s: string) => T.Sync<void>
}
abstract class Format {
  abstract readonly formatString: (s: string) => T.Sync<string>
}
abstract class AppConfig<S> {
  abstract readonly config: S
}

export const HasConsole = T.hasClass(Console)

export const HasFormatURI: unique symbol = Symbol()
export const HasFormat = T.hasClass(Format, HasFormatURI)

export const HasAppConfigURI: unique symbol = Symbol()
export const HasAppConfig = T.has(HasAppConfigURI)<AppConfig<string>>()

export const HasNumberConfigURI: unique symbol = Symbol()
export const HasNumberConfig = T.has(HasNumberConfigURI)<AppConfig<number>>()

export const ScopedAppConfigURI: unique symbol = Symbol()
export const HasScopedAppConfig = T.hasScoped(ScopedAppConfigURI)(HasAppConfig)

export const putStrLn = (s: string) =>
  T.accessServiceM(HasConsole)((console) => console.putStrLn(s))

export class LiveConsole extends Console {
  constructor(private readonly format: Format) {
    super()
  }

  putStrLn: (s: string) => T.Sync<void> = (s) =>
    T.chain_(this.format.formatString(s), (f) =>
      T.provideService(HasFormat)(this.format)(
        T.effectTotal(() => {
          console.log(f)
        })
      )
    )
}

export class AugumentedConsole extends Console {
  constructor(private readonly format: Format) {
    super()
  }

  putStrLn: (s: string) => T.Sync<void> = (s) =>
    T.chain_(this.format.formatString(s), (f) =>
      T.provideService(HasFormat)(this.format)(
        T.effectTotal(() => {
          console.log("(augumented) ", f)
        })
      )
    )
}

export const provideConsole = T.provideServiceM(T.overridable(HasConsole))(
  T.accessService(HasFormat)((format) => new LiveConsole(format))
)
export const provideAugumentedConsole = T.provideServiceM(T.overridable(HasConsole))(
  T.accessService(HasFormat)((format) => new AugumentedConsole(format))
)

export const complexAccess = T.accessServicesM({
  console: HasConsole,
  app: HasAppConfig,
  scoped: HasScopedAppConfig,
  numberConfig: HasNumberConfig
})(({ app, console, numberConfig, scoped }) =>
  console.putStrLn(`${app.config} - (${scoped.config}) - (${numberConfig.config})`)
)

export const provideFormat = T.provideServiceM(HasFormat)(
  T.effectTotal(
    () =>
      new (class extends Format {
        formatString: (s: string) => T.Sync<string> = (s) =>
          T.effectTotal(() => `running: ${s}`)
      })()
  )
)

const program = pipe(
  S.makeSemaphore(2),
  T.chain((s) =>
    T.foreachPar_(A.range(0, 10), (n) =>
      S.withPermit(s)(T.delay(1000)(putStrLn(String(n))))
    )
  ),
  T.chain(() => complexAccess)
)

export const provideAppConfig = T.provideServiceM(HasAppConfig)(
  T.succeedNow(
    new (class extends AppConfig<string> {
      config = "ok"
    })()
  )
)

export const provideNumberConfig = T.provideServiceM(HasNumberConfig)(
  T.succeedNow(
    new (class extends AppConfig<number> {
      config = 1
    })()
  )
)

export const provideScopedAppConfig = T.provideServiceM(HasScopedAppConfig)(
  T.succeedNow(
    new (class extends AppConfig<string> {
      config = "ok - scoped"
    })()
  )
)

const main = pipe(
  program,
  provideConsole,
  provideAppConfig,
  provideScopedAppConfig,
  provideNumberConfig,
  provideAugumentedConsole,
  provideFormat
)

T.runMain(main)
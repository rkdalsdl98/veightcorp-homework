import type SDK from '@nestia/sdk'

export const NESTIA_CONFIG: SDK.INestiaConfig = {
  input: ["src/controller"], // 다수에 경우 ["src/controllers"] 같이 컨트롤러가 모여있는곳을 지정 해주기도 함
  output: 'src/sdk', // 네스티아 sdk빌드시 api가 나올 폴더

  /**
   * Whether to assert parameter types or not.
   *
   * If you configure this property to be `true`, all of the function parameters would be
   * checked through the [typia](https://github.com/samchon/typia#runtime-type-checkers).
   * This option would make your SDK library slower, but would enahcne the type safety even
   * in the runtime level.
   *
   * @default false
   */
  // assert: true,

  /**
   * Whether to optimize JSON string conversion 2x faster or not.
   *
   * If you configure this property to be `true`, the SDK library would utilize the
   * [typia](https://github.com/samchon/typia#fastest-json-string-converter)
   * and the JSON string conversion speed really be 2x faster.
   *
   * @default false
   */
  // json: true,

  /**
   * Whether to wrap DTO by primitive type.
   *
   * If you don't configure this property as `false`, all of DTOs in the
   * SDK library would be automatically wrapped by {@link Primitive} type.
   *
   * For refenrece, if a DTO type be capsuled by the {@link Primitive} type,
   * all of methods in the DTO type would be automatically erased. Also, if
   * the DTO has a `toJSON()` method, the DTO type would be automatically
   * converted to return type of the `toJSON()` method.
   *
   * @default true
   */
  // primitive: false,
  swagger: {
    info: { 
      // 스웨거에 들어갈 간략은 설명, 정보 등이 들어감
      title: "veightcorp API",
      description: "브이에이트코프 과제 API 문서입니다.",
      version: "1.0.0",
    },
    output: 'src/swagger/swagger.json',
    servers: [
      {
        url: "http://localhost:80",
        description: "게시판"
      },
    ]
  },
}

export default NESTIA_CONFIG
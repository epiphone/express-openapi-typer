import * as express from 'express-serve-static-core' // tslint:disable-line:no-implicit-dependencies
import { Schema as JSONSchema } from 'json-schema-type-mapper'
import * as oa from './OpenAPI'

// TODO: for now assuming schema.components.schemas is populated and doesn't contain `$ref` objects
type OpenAPIObject = oa.OpenAPIObject & {
  components: {
    schemas: Record<string, oa.SchemaObject>
  }
}

// Digging up schemas by hand since json-schema-type-mapper expects to find them
// under `/definitions`, not in OpenAPI's `/components/schemas`:

export type Schemas<S extends OpenAPIObject> = S['components']['schemas']

export type SchemaIds<S extends OpenAPIObject> = Exclude<
  ValueOf<Schemas<S>>['$id'],
  undefined
>

export type SchemasById<S extends OpenAPIObject> = {
  [Id in SchemaIds<S>]: ValueOf<
    {
      [P in keyof Schemas<S>]: Schemas<S>[P]['$id'] extends Id
        ? Schemas<S>[P]
        : never
    }
  >
}

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
type UnionToIntersection<U> = (U extends any
? (k: U) => void
: never) extends (k: infer I) => void
  ? I
  : never

type ValueOf<T extends object> = T[keyof T]

export type RequestBody<
  S extends OpenAPIObject,
  Path extends keyof S['paths'],
  Method extends keyof S['paths'][Path],
  O extends S['paths'][Path][Method] = S['paths'][Path][Method]
> = Compute<
  | JSONSchema<ValueOf<O['requestBody']['content']>['schema'], SchemasById<S>>
  | (O['requestBody']['required'] extends true ? never : undefined)
>

/** Gather OpenAPI operations under a single flat union for easier processing */
export type Operation<S extends OpenAPIObject> = ValueOf<
  {
    [Path in keyof S['paths']]: ValueOf<
      {
        [Method in keyof S['paths'][Path]]: {
          method: Method
          operationId: S['paths'][Path][Method]['operationId']
          path: Path
          params: {} // TODO dig up params

          // TODO handle different content types and `required`:
          requestBody: RequestBody<S, Path, Method>

          // TODO handle different content types, headers and status codes:
          responseBody: JSONSchema<
            ValueOf<
              S['paths'][Path][Method]['responses']
            >['content']['application/json']['schema'],
            SchemasById<S>
          >
        }
      }
    >
  }
>

export type PathsByMethod<
  S extends OpenAPIObject,
  O extends Operation<S> = Operation<S>
> = {
  [Method in O['method']]: {
    [Path in O['path']]: Extract<O, { method: Method; path: Path }>
  }
}

interface OperationObject {
  params: any
  path: string
  responseBody: any
  requestBody: any
}

export type RouterMatcher<O extends OperationObject> = (
  path: O['path'],
  ...handlers: Array<
    express.RequestHandler<O['params'], O['responseBody'], O['requestBody']>
  >
) => any

type HTTPMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'

export type OpenAPIRouter<
  S extends OpenAPIObject,
  P extends PathsByMethod<S> = PathsByMethod<S>
> = Compute<
  {
    [Method in keyof P]: UnionToIntersection<
      ValueOf<{ [Path in keyof P[Method]]: RouterMatcher<P[Method][Path]> }>
    >
  } &
    Omit<express.Router, HTTPMethod>
>

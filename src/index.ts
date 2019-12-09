import * as express from 'express-serve-static-core' // tslint:disable-line:no-implicit-dependencies
import { JSONSchema } from './JSONSchema'
import * as oa from './OpenAPI'
import { Compute, UnionToIntersection, ValueOf } from './util'

// TODO: for now assuming schema.components.schemas is populated and doesn't contain `$ref` objects
export type OpenAPIObject = oa.OpenAPIObject & {
  components: {
    schemas: Record<string, oa.SchemaObject>
  }
}

export type RequestBody<
  S extends OpenAPIObject,
  Path extends keyof S['paths'],
  Method extends keyof S['paths'][Path],
  O extends S['paths'][Path][Method] = S['paths'][Path][Method]
> = Compute<
  | JSONSchema<ValueOf<O['requestBody']['content']>['schema'], S>
  | (O['requestBody']['required'] extends true ? never : undefined)
>

export type ResponseBody<
  S extends OpenAPIObject,
  Path extends keyof S['paths'],
  Method extends keyof S['paths'][Path]
> = Compute<
  JSONSchema<
    ValueOf<
      S['paths'][Path][Method]['responses']
    >['content']['application/json']['schema'],
    S
  >
>

export type ParametersIn<
  S extends OpenAPIObject,
  Path extends keyof S['paths'],
  Method extends keyof S['paths'][Path],
  In extends oa.ParameterLocation
> = S['paths'][Path][Method]['parameters'] extends Array<infer P>
  ? Extract<P, { in: In }>
  : never

export type Parameters<
  S extends OpenAPIObject,
  P extends keyof S['paths'],
  M extends keyof S['paths'][P],
  In extends oa.ParameterLocation,
  Ps extends ParametersIn<S, P, M, In> = ParametersIn<S, P, M, In>
> = Compute<
  {
    [Name in Ps['name']]: JSONSchema<Extract<Ps, { name: Name }>['schema'], S>
  }
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

          headers: Parameters<S, Path, Method, 'header'>
          params: Parameters<S, Path, Method, 'path'>
          query: Parameters<S, Path, Method, 'query'>

          // TODO handle different content types:
          requestBody: RequestBody<S, Path, Method>

          // TODO handle different content types, headers and status codes:
          responseBody: ResponseBody<S, Path, Method>
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
  params: Record<string, any>
  path: string
  query: Record<string, any>
  responseBody: any
  requestBody: any
}

// `express.Request` has no generic parameter for `query` so we have to roll out
// our own `Request` type:
export type Request<O extends OperationObject> = Compute<
  { query: O['query'] } & Omit<
    express.Request<O['params'], O['responseBody'], O['requestBody']>,
    'query'
  >
>

export type RequestHandler<O extends OperationObject> = (
  req: Request<O>,
  res: express.Response<O['responseBody']>,
  next: express.NextFunction
) => any

export type RouterMatcher<O extends OperationObject> = (
  path: O['path'],
  ...handlers: Array<RequestHandler<O>>
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

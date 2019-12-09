import * as JSONSchemaTypeMapper from 'json-schema-type-mapper'
import { OpenAPIObject } from '.'
import { ValueOf } from './util'

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

export type JSONSchema<
  T,
  S extends OpenAPIObject
> = JSONSchemaTypeMapper.Schema<T, SchemasById<S>>

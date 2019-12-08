# express-openapi-typer
Code-generation-free conversion of OpenAPI schema into typed Express request handlers.

**Schema-first API development!** There's a bunch of libraries out there for generating OpenAPI schemas from source code. This one works the opposite way, and with no code generation involved. How it works is you draft your OpenAPI schema, and let `express-openapi-typer`'s type constraints ensure that your code actually follows the schema. Finally, you'd add something like https://github.com/Hilzu/express-openapi-validate to do runtime validation based on the same OpenAPI schema.

TODO just validating that your (already written) API follows the schema?

**Requires OpenAPI v3.1** (yet unpublished, track progress at https://github.com/OAI/OpenAPI-Specification/issues/2025) since earlier versions use the [OpenAPI Schema Object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#schemaObject) in favour of pure JSON Schema. Read more about the divergence at https://apisyouwonthate.com/blog/openapi-and-json-schema-divergence-part-1 and how `v3.1` solves it at https://phil.tech/2019/09/07/update-openapi-json-schema/.

## Work in progress!

## Usage

No need to modify existing Express handlers/handler interfaces stay the same

Drop in/plug and play, just run `yarn install express-openapi-typer` and change

```typescript
const router = express.Router()
```

into

```typescript
import { OpenAPIRouter } from 'express-openapi-typer'

interface MySchema {
  paths: {
    '/pets': {
      get: {
        // ...
      }
    }
  }
}

const router = (express.Router() as unknown) as OpenAPIRouter<MySchema>
```

and your handler functions get type-checked as per `MySchema`!

### Allow additional paths

By default `OpenAPIRouter` doesn't allow any additional handlers not defined in the OpenAPI schema. To loosen this restriction you can expand the type as follows:

```typescript
import * as express from 'express'

const router = express.Router() as OpenAPIRouter<MySchema> & express.Router
```

You can also select a subset of `express.Router` with [`Pick`/`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktk) when allowing additional methods only for a specific HTTP method, for example.

## TODO
- path parameters
- query parameters
- response and request headers
- async handlers
- API client types, axios?
  - or just pick something like https://github.com/anttiviljami/openapi-client-axios, https://github.com/Manweill/swagger-axios-codegen - take advantage of the OpenAPI ecosystem!
- handle different response bodies per content type and status code
- figure out if we can get rid of the unfortunate `as unknown` cast
- expand to KoaJS et al?
- support path-based `$ref`s, not just `$id`-based ones
  - requires some sort of manual mapping as we can't take `"#/components/schemas/NewUser"` apart at type-level

## Related projects
- https://github.com/rawrmaan/restyped
- https://github.com/hmil/rest.ts
- https://stoplight.io/open-source/prism/ Prism is an open source mock server that can mimic your API’s behavior as if you already built it. Servers are generated from your OpenAPI v2/v3 (formerly known as Swagger) documents.
- apiaryio/dredd

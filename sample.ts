import * as express from 'express'
import { OpenAPIRouter } from '.'
import PetStoreSchema from './PetStoreSchema'

const router = (express.Router() as unknown) as OpenAPIRouter<PetStoreSchema>

router.get('/pets/{id}', (req, res, next) => undefined)
router.get('/pets', (req, res, next) => undefined)

router.delete('/pets/{id}', (req, res, next) => undefined)

router.post('/pets', (req, res, next) => {
  // req.body autocompletes to `{ [x: string]: JSONValue; name: string; tag?: string | undefined; }`
  res.send({ name: req.body.name, id: 1 })
})

import * as express from 'express'
import PetStoreSchema from './PetStoreSchema'
import { OpenAPIRouter } from './src'

const router = (express.Router() as unknown) as OpenAPIRouter<PetStoreSchema>

router.get('/pets/{id}', (req, res, next) => {
  res.send({ name: 'Pet', id: req.params.id })
})
router.get('/pets', (req, res, next) => {
  res.send([{ id: 1, name: 'asd' }])
})

router.delete('/pets/{id}', (req, res, next) => {
  res.send()
})

router.post('/pets', (req, res, next) => {
  res.send({ name: req.body.name, id: 1 })
})

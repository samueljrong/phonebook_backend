const express = require('express')
const app = express()
const morgan = require('morgan')
require('dotenv').config() // import dotenv before person module so env variables globally available
const Person = require('./models/person')

const cors = require('cors')

// "allow requests from other origins"
// "Because our server is in localhost port 3001,
// and our frontend in localhost port 3000, they do not have the same origin."
app.use(cors())

app.use(express.json())

// "whenever express gets an HTTP GET request it will first check if the build
// directory contains a file corresponding to the request's address.
// If a correct file is found, express will return it."
app.use(express.static('build'))

// Shows POST request data in logs
morgan.token('data', (request, response) => JSON.stringify(request.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response, next) => {
  Person.count({})
    .then(numDocs => {
      response.send(
        `
        <p>Phonebook has info for ${numDocs} people</p>
        <p>${new Date()}</p>
        `
      )
    })
    .catch(error => next(error))
})

app.get('/api/people', (request, response) => {
  Person.find({}).then(people => {
    response.json(people.map(person => person.toJSON()))
  })
})

app.post('/api/people', (request, response, next) => {
  const body = request.body

  // Statements below would be used if Mongoose wasn't handling validation
  // if (body.name === undefined) {
  //   return response.status(400).json({
  //     error: 'Name missing'
  //   })
  // }
  // if (body.number === undefined) {
  //   return response.status(400).json({
  //     error: 'Number missing'
  //   })
  // }
  // if (Person.find({ name: body.name })) {
  //   return response.status(409).json({
  //     error: 'Name must be unique'
  //   })
  // }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.get('/api/people/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error)) // pass errors for Express to handle
  // "If you pass anything to the next() function (except the string 'route'),
  // Express regards the current request as being an error
  // and will skip any remaining non-error handling routing and middleware functions."
})

app.delete('/api/people/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.put('/api/people/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  // "Notice that the findByIdAndUpdate method receives a regular JavaScript object as its parameter,
  // and not a new person object created with the Person constructor function."

  // "the optional { new: true } parameter, which will cause our event handler
  //  to be called with the new modified document instead of the original"

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})


// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  // Pass non-CastErrors to default Express error handler
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

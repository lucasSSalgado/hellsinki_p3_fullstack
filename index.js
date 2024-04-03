require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Phone = require('./models/database')

const app = express()
app.use(cors())

app.use(express.static('dist'))
app.use(express.json())
morgan.token('post', function (req, res) { 
    if (req.method === 'POST') {
        return JSON.stringify(req.body) 
    }
    return 
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'))

app.get('/api/persons', (req, res) => {
    Phone.find({}).then(contact => {
        res.json(contact)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Phone.findById(req.params.id).then(contact =>{
        if (contact) {
            res.json(contact)
            return
        } 
        else res.status(404).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res) => {
    const contact = req.body
    if (!contact.name || !contact.number) {
        return res.status(400).json({ 
            error: 'name or number missing' 
        })
    }

    Phone.findOne({ name: contact.name }).then(elem => {
        if (elem) {
            return res.status(400).json({ 
                error: 'name must be unique' 
            })
        } else {
            const newContact = new Phone({
                name: contact.name,
                number: contact.number
            })
        
            Phone.create(newContact).then(contact => {
                return res.json(contact)
            })
        }
    })
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
    const contact = {
        name: body.name,
        number: body.number
    }
    Phone.findByIdAndUpdate(req.params.id, contact, { new: true })
    .then(updatedContact => {
        if (updatedContact) {
            res.json(updatedContact)
            return
        }
        else res.status(404).end()
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Phone.findByIdAndDelete(req.params.id).then(() => {
        res.status(204).end()
    }).catch(error => next(error))
})

app.get('/info', (req, res) => {
    Phone.find({}).then(contacts => {
        let htmlResp = 
        `
            <p>Phonebook has info for ${contacts.length} people</p>
            <p>${new Date()}</p>
        `
        res.send(htmlResp)
    })
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
}

app.use(errorHandler)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
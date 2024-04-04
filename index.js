require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Phone = require('./models/database');

const app = express();
app.use(cors());
app.use(express.static('dist'));
app.use(express.json());
// eslint-disable-next-line no-unused-vars
morgan.token('post', (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  }
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'));

app.get('/api/persons', (req, res) => {
  Phone.find({}).then((contact) => {
    res.json(contact);
  });
});

app.get('/api/persons/:id', (req, res, next) => {
  Phone.findById(req.params.id).then((contact) => {
    if (contact) {
      res.json(contact);
      return;
    }
    res.status(404).end();
  }).catch((error) => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const contact = req.body;
  if (!contact.name || !contact.number) {
    return res.status(400).json({
      error: 'name or number missing',
    });
  }

  Phone.findOne({ name: contact.name }).then((elem) => {
    if (elem) {
      return res.status(400).json({
        error: 'name must be unique',
      });
    }
    const newContact = new Phone({
      name: contact.name,
      number: contact.number,
    });

    Phone.create(newContact).then((c) => res.json(c)).catch((error) => next(error));
  });
});

app.put('/api/persons/:id', (req, res, next) => {
  const { body } = req;
  const contact = {
    name: body.name,
    number: body.number,
  };
  Phone.findByIdAndUpdate(req.params.id, contact, { new: true, runValidators: true, context: 'query' })
    .then((updatedContact) => {
      if (updatedContact) {
        return res.json(updatedContact);
      } return res.status(404).end();
    }).catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Phone.findByIdAndDelete(req.params.id).then(() => {
    res.status(204).end();
  }).catch((error) => next(error));
});

app.get('/info', (req, res) => {
  Phone.find({}).then((contacts) => {
    const htmlResp = `
            <p>Phonebook has info for ${contacts.length} people</p>
            <p>${new Date()}</p>
        `;
    res.send(htmlResp);
  });
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

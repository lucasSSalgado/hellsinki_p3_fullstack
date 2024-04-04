const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connected')

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
})

const phoneSchema = new mongoose.Schema({
    name: {
      type: String,
      minLength: 3,
      required: true
    },
    number: {
      type: String,
      minLength: 8,
      required: true,
      validate: {
        validator: function(value) {
          const regex = /^\d{2,3}-\d+$/;
          return regex.test(value);
        },
        message: props => `${props.value} is invalid! Please use the format XX-XXXXX.`
      },
    }
})

phoneSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Phone', phoneSchema)
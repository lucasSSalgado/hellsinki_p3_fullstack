const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
`mongodb+srv://lucssslucsss:${password}@phonebook.glx0zmt.mongodb.net/phonebook?retryWrites=true&w=majority&appName=phonebook`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const phoneSchema = new mongoose.Schema({
    name: String,
    number: Number,
})
  
const Phone = mongoose.model('Phone', phoneSchema)

if (process.argv.length === 3) {
    console.log('phonebook:')
    Phone.find({}).then(result => {
    result.forEach(contact => {
      console.log(`${contact.name} ${contact.number}`)
    })
    mongoose.connection.close()
  })
}
else {
  const newPhone = new Phone({
    name: process.argv[3],
    number: process.argv[4],
  })
  newPhone.save().then(response => {
    console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
    mongoose.connection.close()
  })
}
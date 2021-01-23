const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log("Connecting to", url);

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(result => {
    console.log('Connected to MongoDB')
  }).catch((error) => {
    console.log('Error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

personSchema.set('toJson', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString() // _id is an Object
    delete returnedObject._id
    delete returnedObject.__v // Don't return mongo versioning field
  }
})

// "The public interface of the module is defined by setting a value to the module.exports variable.
//  We will set the value to be the Note model.
// The other things defined inside of the module,
// like the variables mongoose and url will not be accessible or visible to users of the module."
module.exports = mongoose.model('Person', personSchema)
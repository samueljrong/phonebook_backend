const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.uamcw.mongodb.net/phonebook?retryWrites=true&w=majority`
// 'mongodb://fullstack:${password}@cluster0-shard-00-00.uamcw.mongodb.net:27017,cluster0-shard-00-01.uamcw.mongodb.net:27017,cluster0-shard-00-02.uamcw.mongodb.net:27017/phonebook?ssl=true&replicaSet=atlas-2zcynd-shard-0&authSource=admin&retryWrites=true&w=majority'

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

// const person = new Person({
//   name: 'Bob',
//   number: '12345'
// })

// person.save().then(result => {
//   console.log('Person saved!')
//   mongoose.connection.close()
// })

switch (process.argv.length) {
  case 3:
    // Print all people
    Person.find({}).then(result => {
      console.log('Phonebook:');
      result.forEach(person => {
        console.log(person);
      })
      mongoose.connection.close();
    })
    break;
  case 5:
    // Add person
    const person = new Person({
      name: process.argv[3],
      number: process.argv[4]
    })

    person.save().then(result => {
      console.log('Person saved!')
      mongoose.connection.close()
    })
    break;
  default:
    console.log('Please provide the name and number as arguments: node mongo.js <password> <name> <number>');
    process.exit(1);
    break;
}
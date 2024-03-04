const connectToMongo = require('./db')
const express = require('express')
require('dotenv').config();
let cors = require('cors')

connectToMongo();

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

//Available Routes
// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })   //this part is write in routes folder in import likes below

app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`iNotebook Backend listening on port http://localhost:${port}`)
})
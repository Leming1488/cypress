const minimist = require('minimist')
const express = require('express')
const path = require('path')

const app = express()

// get port from passed in args from scripts/start.js
const port = minimist(process.argv.slice(2)).port


app.use(express.static("public"));


app.get('/', (req, res) => res.redirect('/login'))


// this is the standard HTML login page
app.get('/login', (req, res) => {
  res.sendFile((path.join(__dirname + '/login.html')))
})

app.listen(port)

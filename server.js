const minimist = require('minimist')
const express = require('express')
const path = require('path')

const app = express()

const port = minimist(process.argv.slice(2)).port


app.use(express.static("public"));


app.get('/', (req, res) => res.redirect('/login'))


app.get('/login', (req, res) => {
  res.sendFile((path.join(__dirname + '/login.html')))
})

app.listen(port)

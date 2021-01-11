const minimist = require('minimist')
const express = require('express')

const app = express()

// get port from passed in args from scripts/start.js
const port = minimist(process.argv.slice(2)).port


app.use(express.static("public"));


app.set('views', __dirname)
app.set('view engine', 'hbs')

app.get('/', (req, res) => res.redirect('/login'))


// this is the standard HTML login page
app.get('/login', (req, res) => {
  res.render('./login.hbs')
})

app.listen(port)

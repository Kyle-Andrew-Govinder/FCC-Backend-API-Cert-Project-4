const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
require('dotenv').config()

const User = require("./User.js")

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}))

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected")
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app
.route("/api/users")
.get( async (req, res) => {

  const users = await User.find({}, {
    username: 1,
  _id: 1 
  })

  res.send(users)

})
.post( async (req, res) => {

  const username = req.body.username
  const _id = String(new Date().getTime())

  const newUser = new User({
    username,
    _id,
  })

  await newUser.save()

  res.json(newUser)

})

app.post("/api/users/:_id/exercises", async (req, res) => {

  const _id = req.params._id

  // Find User

  const user = await User.findOne({ _id })

  // Create Log Info

  const description = req.body.description
  const duration = Number(req.body.duration)
  let date = req.body.date

  if (date) date = new Date(date).toDateString()
  else date = new Date().toDateString()  

  // Create/Update Log

  user.log.push({
    description,
    duration,
    date
  })

  // Update User

  await user.save()

  // Generate Response

  const resJSON = {
    username : user.username,
    _id: user._id,
    description,
    duration,
    date
  }

  res.json(resJSON)

})

app.get("/api/users/:_id/logs", async (req, res) => {

  // Find User 

  const _id = req.params._id 
  const user = await User.findOne({ _id })

  // Get Filters

  const from = req.query.from
  const to = req.query.to
  const limit = Number(req.query.limit)

  // Transform Dates

  const formDates = user.log.map((item) => {
    return {
      description: item.description, 
      duration: item.duration,
      date: new Date(item.date).toDateString()
    }
  })

  const responseUser = {
    ...user,
    log: formDates
  }

  // Limit Logs

  let filteredLogs 

  if (from) {

    const start = new Date(from).getTime()

    filteredLogs = responseUser.log.filter((item) => {
      return start <= new Date(item.date).getTime()
    })

    responseUser.log = filteredLogs
  }

  if (to) {

    const end = new Date(to).getTime()

    filteredLogs = responseUser.log.filter((item) => {
      return end >= new Date(item.date).getTime()
    })

    responseUser.log = filteredLogs

  }

  if (limit) {

    filteredLogs = responseUser.log.filter((item, index) => {
      return index < limit
    })

    responseUser.log = filteredLogs

  }

  // Add Count Field

  responseUser.count = responseUser.log.length

  // Generate Response

  res.json(responseUser)

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

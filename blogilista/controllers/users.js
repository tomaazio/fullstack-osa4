const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (req, res) => {
  try {
    const users = await User
      .find({})

    res.json(users.map(User.format))
  } catch (e) {
    console.log(e)
  }
})

usersRouter.post('/', async (req, res) => {
  try{
    const body = req.body

    const existingUser = await User.find({ username: body.username })
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'username already taken' })
    }
    if (body.password.length < 3) {
      return res.status(400).json({ error: 'password must be longer than 2 characters' })
    }
    if (body.adult === undefined) {
      body.adult = true
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      adult: body.adult,
      passwordHash
    })

    const savedUser = await user.save()

    res.json(User.format(savedUser))

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'something went wrong' })
  }
})

module.exports = usersRouter

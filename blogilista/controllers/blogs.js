const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (req, res) => {
  try {
    const blogs = await Blog
      .find({})
      .populate('user', { username: 1, name: 1 })

    res.json(blogs.map(Blog.format))

  } catch (e) {
    console.log(e)
    res.status(404).end()
  }
})

blogsRouter.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    res.json(Blog.format(blog))
  } catch (e) {
    console.log(e)
    res.status(400).send({ error: 'malformatted id' })
  }
})

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogsRouter.post('/', async (req, res) => {
  const body = req.body
  try {
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    if (body.title === undefined) {
      return res.status(400).json({ error: 'title missing' })
    }
    if (body.url === undefined) {
      return res.status(400).json({ error: 'url missing' })
    }

    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
    })

    if (!body.likes) {
      blog.likes = 0
    }

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()


    res.status(201).json(Blog.format(savedBlog))
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'something went wrong...' })
  }
})

blogsRouter.delete('/:id', async (req, res) => {
  try {
    await Blog.findByIdAndRemove(req.params.id)
    res.status(204).end()

  } catch (e){
    console.log(e)
    res.status(400).send({ error: 'malformatted id' })
  }
})

blogsRouter.put('/:id', async (req, res) => {
  try {
    const blog = {
      likes: req.body.likes
    }
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, { new: true })
    res.json(Blog.format(updatedBlog))
  } catch (e) {
    console.log(e)
    res.status(400).send({ error: 'malformatted id' })
  }
})

module.exports = blogsRouter

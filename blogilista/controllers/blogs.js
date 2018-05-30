const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


const format = (blog) => {
  return {
    id: blog._id,
    title: blog.title,
    author: blog.author,
    likes: blog.likes
  }
}

blogsRouter.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({})
    res.json(blogs.map(format))
  } catch (e) {
    console.log(e)
    res.status(404).end()
  }
})

blogsRouter.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    res.json(format(blog))
  } catch (e) {
    console.log(e)
    res.status(400).send({ error: 'malformatted id' })
  }
})

blogsRouter.post('/', async (req, res) => {
  try {
    const newBlog = new Blog(req.body)
    if (newBlog.title === undefined) {
      return res.status(400).json({ error: 'title missing' })
    }
    if (newBlog.url === undefined) {
      return res.status(400).json({ error: 'url missing' })
    }
    if (!newBlog.likes) {
      newBlog.likes = 0
    }
    const savedBlog = await newBlog.save()
    res.status(201).json(format(savedBlog))
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
    res.json(format(updatedBlog))
  } catch (e) {
    console.log(e)
    res.status(400).send({ error: 'malformatted id' })
  }
})

module.exports = blogsRouter

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

blogsRouter.get('/', (req, res) => {
  Blog
    .find({})
    .then(blogs => {
      res.json(blogs.map(format))
    })
})

blogsRouter.post('/', (req, res) => {
  const blog = new Blog(req.body)

  blog
    .save()
    .then(result => {
      res.status(201).json(result)
    })
})

module.exports = blogsRouter

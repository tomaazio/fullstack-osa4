const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, blogsInDb, usersInDb } = require('./test_helper')

describe('When there is initially one user at db', async () => {
  beforeAll(async () => {
    await User.remove({})
    const user = new User({ username: 'root', password: 'salaisuus' })
    await user.save()
  })

  test('POST /api/user fails with the right status code and message if username is taken', async () => {
    const usersBefore = await usersInDb()

    const newUser = {
      username: 'root',
      name: 'The boss',
      password: 'itss3cr3t'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'username already taken' })

    const usersAfter = await usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length)
  })

  test('POST /api/user fails with the right status code and message if password length is under 3 characters', async () => {
    const usersBefore = await usersInDb()

    const newUser = {
      username: 'teukka',
      name: 'Teemu Selänne',
      password: 'mo'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'password must be longer than 2 characters' })

    const usersAfter = await usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length)
  })
})


describe('when at the beginning some blogs are saved', async () => {
  beforeAll(async () => {
    await Blog.remove({})

    for (let blog of initialBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }
  })

  test('all blogs are returned as json by GET /api/blogs', async () => {
    const blogsInDatabase = await blogsInDb()

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(blogsInDatabase.length)

    const returnedTitles = response.body.map(blog => blog.title)
    blogsInDatabase.forEach(blog => {
      expect(returnedTitles).toContain(blog.title)
    })
  })

  test('individual blogs are returned as json by GET /api/blogs/:id', async () => {
    const blogsInDatabase = await blogsInDb()
    const aBlog = blogsInDatabase[0]

    const response = await api
      .get(`/api/blogs/${aBlog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.title).toBe(aBlog.title)
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      author: 'Tomas',
      title: 'Uusi blogipostaus',
      url: 'www.google.com',
      likes: 12
    }

    const blogsBefore = await blogsInDb()

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfter = await blogsInDb()
    const titles = blogsAfter.map(blog => blog.title)

    expect(blogsAfter.length).toBe(blogsBefore.length + 1)
    expect(titles).toContain(newBlog.title)

  })

  test('if blog.likes is not defined then likes is zero', async () => {
    const newBlog = {
      title: 'blogipostaus ilman likeja',
      author: 'Keijo',
      url: 'www.google.com'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api
      .get('/api/blogs')

    const addedBlog = response.body.find(blog => blog.title === 'blogipostaus ilman likeja')
    expect(addedBlog.likes).toBe(0)
  })

  test('if new blog.title or blog.url is undefined return status 400', async () => {
    const newBlog = {
      author: 'Tomppa'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })

  describe('deletion of a note', async () => {
    let addedBlog

    beforeAll(async () => {
      addedBlog = new Blog({
        author: 'Tomppa',
        title: 'Uusi blogipostaus joka poistetaan',
        url: 'www.google.com',
        likes: 14
      })
      await addedBlog.save()
    })
    test('Delete /api/blogs/:id succeeds with proper status code', async () => {
      const blogsAtStart = await blogsInDb()

      await api
        .delete(`/api/blogs/${addedBlog._id}`)
        .expect(204)

      const blogsAfter = await blogsInDb()

      const titles = blogsAfter.map(blog => blog.title)

      expect(titles).not.toContain(addedBlog.title)
      expect(blogsAfter.length).toBe(blogsAtStart.length - 1)
    })
  })
})


afterAll(() => {
  server.close()
})

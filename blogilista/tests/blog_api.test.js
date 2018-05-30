const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { initialBlogs, blogsInDb, format } = require('./test_helper')


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

  // test('individual blogs are returned as json by GET /api/blogs/:id', async () => {
  //   const blogsInDatabase = await blogsInDb()
  //   const aBlog = blogsInDatabase[0]
  //
  //   const response = await api
  //     .get(`/api/blogs/${aBlog.id}`)
  //     .expect(200)
  //     .expect('Content-Type', /application\/json/)
  //
  //   expect(response.body.title).toBe(aBlog.title)
  // })

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

    expect(blogsAfter.length).toBe(blogsBefore.length + 1)
    expect(blogsAfter).toContainEqual(format(newBlog))

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

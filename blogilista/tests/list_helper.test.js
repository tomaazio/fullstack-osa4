const listHelper = require('../utils/list_helper')

const blogs1 = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  }
]
const blogs2 = [
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 30,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

describe('Total likes', () => {
  test('of first three blogs', () => {
    const result = listHelper.totalLikes(blogs1)
    expect(result).toBe(24)
  })

  test('of last three blogs', () => {
    const result = listHelper.totalLikes(blogs2)
    expect(result).toBe(42)
  })

  test('of all blogs', () => {
    const result = listHelper.totalLikes(blogs1.concat(blogs2))
    expect(result).toBe(66)
  })
})

describe('Favorite blog', () => {
  test('of first three blogs', () => {
    const result = listHelper.favoriteBlog(blogs1)
    expect(result).toEqual(blogs1[2])
  })

  test('of last three blogs', () => {
    const result = listHelper.favoriteBlog(blogs2)
    expect(result).toEqual(blogs2[1])
  })

  test('of all blogs', () => {
    const result = listHelper.favoriteBlog(blogs1.concat(blogs2))
    expect(result).toEqual(blogs1.concat(blogs2)[4])
  })
})

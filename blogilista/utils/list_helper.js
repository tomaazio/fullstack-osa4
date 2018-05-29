const totalLikes = (blogs) =>
  blogs.reduce((sum, blog) => {
    return sum + blog.likes
  }, 0)

const favoriteBlog = (blogs) => {
  const likes = blogs.map(blog => blog.likes)
  return blogs.find(blog => blog.likes === Math.max(...likes))
}


module.exports = {
  totalLikes,
  favoriteBlog
}

module.exports = {
  content: ['./layouts/**/*.html', './content/**/*.md', './content/**/*.html'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

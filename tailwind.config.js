// Tailwind CSS Configuration
// Documentation: https://tailwindcss.com/docs/configuration

module.exports = {
  // Content paths - Tailwind scans these files to find class names
  // This enables purging of unused CSS in production builds
  content: [
    './layouts/**/*.html',  // All Hugo layout templates
    './content/**/*.md',    // Markdown content files
    './content/**/*.html'   // HTML content files
  ],

  // Theme configuration
  theme: {
    // Extend the default Tailwind theme
    // Add custom colors, spacing, fonts, etc. here
    extend: {
      // Example custom configurations:
      // colors: {
      //   'ilsa-blue': '#1e40af',
      //   'ilsa-red': '#dc2626',
      // },
      // fontFamily: {
      //   sans: ['Inter', 'sans-serif'],
      // },
      // spacing: {
      //   '128': '32rem',
      // },
    },
  },

  // Tailwind plugins - extend functionality with official plugins
  plugins: [
    // Form styling - provides base styles for form elements
    // https://github.com/tailwindlabs/tailwindcss-forms
    require('@tailwindcss/forms'),

    // Typography - provides prose classes for styled article content
    // https://github.com/tailwindlabs/tailwindcss-typography
    require('@tailwindcss/typography'),

    // Additional plugins that could be useful:
    // require('@tailwindcss/aspect-ratio'),  // Aspect ratio utilities
    // require('@tailwindcss/line-clamp'),    // Line clamping utilities
  ],
}

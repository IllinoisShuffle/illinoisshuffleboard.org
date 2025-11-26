// PostCSS Configuration
// Documentation: https://postcss.org/

// PostCSS processes CSS through a series of plugins
// Hugo uses this config when processing CSS files via Hugo Pipes

module.exports = {
  plugins: {
    // Tailwind CSS - processes Tailwind directives and generates utility classes
    // This must run before autoprefixer
    tailwindcss: {},

    // Autoprefixer - automatically adds vendor prefixes to CSS rules
    // Uses data from caniuse.com to determine which prefixes are needed
    // Example: transform becomes -webkit-transform, -ms-transform, transform
    autoprefixer: {},

    // Additional PostCSS plugins that could be useful:
    // 'postcss-import': {},              // Inline @import rules
    // 'postcss-nested': {},              // Unwrap nested CSS rules
    // 'cssnano': {},                     // Minify CSS for production
  },
}

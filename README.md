# The Illinois Shuffleboard Association's Website

Our website is built on the [Hugo](https://gohugo.io/) Framework, along with [Tailwind CSS](https://tailwindcss.com/). It is deployed to [https://www.illinoisshuffleboard.org](https://www.illinoisshuffleboard.org) with [Netlify](https://www.netlify.com/).

[![Netlify Status](https://api.netlify.com/api/v1/badges/a2dc1a15-5ed3-4122-a259-834327834bc1/deploy-status)](https://app.netlify.com/sites/ilsa/deploys)

## Developement

Requirements:
 * Hugo v0.92.0 or later
 * NodeJS (currently tested with v17.4.0)

To spin up a development environment:
 * run `npm install` to install dependencies
 * run `hugo server -D` to generate the site - by default this will regenerate when changes are made
 * visit [http://localhost:1313](http://localhost:1313) to see the site

 Note: there are a few issues using Hugo with Tailwind CSS version 3, we have solved them using [Jonas Duri's technique](https://dev.to/jonas_duri/how-to-use-tailwindcss-30-without-external-npm-scripts-just-hugo-pipes-2lg9).

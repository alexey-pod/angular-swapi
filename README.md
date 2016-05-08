# Angular & swapi project
## Installation

Before running any Gulp tasks:

1. Check out this repository
2. Ensure you have **node** installed
3. Run `npm install` and `bower install` in the root directory
    
## Gulp Tasks

All of the following are available from the command line.

### Essential ones

These tasks I use as part of my regular developments and deploy scripts:

- __`gulp watch-dev`__ Clean, build, and watch live changes to the dev environment. Built sources are served directly by the dev server from /dist.dev.
- __`gulp watch-prod`__ Clean, build, and watch live changes to the prod environment. Built sources are served directly by the dev server from /dist.prod.
- __`gulp`__ Default task builds for dev. Built sources are put into /dist.dev, and can be served directly.

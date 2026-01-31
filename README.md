This is an open source repo template for creating fullstack js app using AdonisJS and NuxtJS.
PrimeVue is used as the UI library for the frontend.

# API
- start using as is
- run pnpm install
- run `node ace generate:key` to generate the app key
- start the server using `node ace serve --hmr`
- API server will be running on http://localhost:8000

## database
- setup your database in the .env file
- run migrations using `node ace migration:run`

## Adding your own code
- check the routes dir ./routes and add routes for web and api as needed.
Feel free to modify this to suite your needs.
- add controllers using the `node ace make:controller <name>` command
- add models using the `node ace make:model <name>` command
- add middlewares using the `node ace make:middleware <name>` command
- add other components as needed using the ace commands

## Optional setups
- smtp and resend setup done already to use the adonis mail package. Just set your smtp details in the .env file.
- redis caching and session management is setup but commented out. If you want to use it
you can add redis as by `node ace add @adonisjs/redis` and setting it up in the .env file. Make sure to uncomment the redis related code in the config files.
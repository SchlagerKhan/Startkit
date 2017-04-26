# Project Boilerplate
This is a boilerplate in order to start a project quickly. By default it comes with server rendering but by following the guide below, it can be transformed to non-server-rendering, yielding a code easier to read.

## Table of contents
1. [Ready, set, go!](#ready-set-go)
    1. [File structure](#file-structure)
    2. [Styles](#styles)
    3. [API structure](#api-structure)
        * [Client side](#client-side)
	    * [Server side](#server-side)
	    * [API request](#api-request)
	    * [API response](#api-response)
    4. [Database](#database)
        * [Database formatting](#database-formatting)
    5. [Data Models](#data-models)
    6. [Server rendering](#server-rendering)
        * [Shifting to a non-server-rendering setup](#shifting-to-a-non-server-rendering-setup)
    7. [Deployment](#deployment)
	8. [Webpack](#webpack)
	9. [Testing](#testing)
2. [Bonus pro tips](#bonus-pro-tips)
    * [RESTful api](#restful-api)
	* [snake_case or camelCase](#snake_case-or-camelCase)

## Ready, set, go!
Nothing else... just go on!

### File structure
The project is divided into the following directories. More detailed description is given below.

* `app` - Contains the frontend
    * `app` - Contains the wrapper files that lays the foundation to the server rendering.
	    * `routes` - Contains all the routes of the website,
		* `DataWrapper` - Wraps the `Router` object and provides it with some initial data.
	    * `app` - The actual wrapper of the website.
	* `components` - Custom made components to be used around the application.
	    * `Header|Footer`
	* `containers` - Contains larger component such as page containers.
	    * `start` - Landing page
		* `page` - Dummy page
	* `misc` - Contains files that regards the entire frontend
	    * `helper` - A few helper functions
		* `globals` - Global frontend variables
	* `sass` - Style (SCSS) helper files
	    * `_colors` - Obv.
		* `_fonts` - Obv.
		* `_positioning` - Contains every selector considering the positioning.
		* `_styles` - imports all the other helper files and add some global selectors.
		* `_utilities` - A lot of useful mixins.
		* `_variables` - Obv.
	* `index.js` - The index files that ensures the server data and loads the react component.
	* `dev-data.json` - A file making it possible to send server data to the webpack-dev-server
* `server` - Contains the backend
    * `api` - Contains all api files
	    * `api-helper` - A few api server helper funcitons
		* `api` - The api container file
	* `misc` - Contains files that regards the entire backend
	    * `database` - The MySQL database config
		* `globals` - Global server variables of the project
		* `helper` - A few server helper functions
	* `models` - Contains all the backend models
	    * `test` - A test model
	* `server.js` - A server index file implementing server-rendering.
	* `server.simple.js` - A server index file not implementing server-rendering.

### Styles
This project is supported by sass and has some helper files which is presented above. To include all the helper files into a scss file, simply add `@import 'styles'` at the top of the file.


### API structure

This project uses a RESTful API with CRUD as a predefined setup. The server-side implementation of CRUD is done using the [`resource-router-middleware`](https://github.com/developit/resource-router-middleware) package. The client-side requests on the other hand uses the [`fetchival`](https://github.com/typicode/fetchival) package (and thereby also  [`fetch (whatwg-fetch)`](https://github.com/github/fetch)).

#### Client side

When you want some external data from the api into a component one imports `api` which is a container for the previously mentioned `fetchival`. It contains all the methods required for a RESTful request (`get`, `post`, `put`, `delete`) and returns a promise. The promise simply returns the server response which is defined below.

There might be some requirements to what data that is required by a specific api url. This is defined by the server (and will be explained more below), but in case the request misses some parameters the server will respond with a message explaining the situation.

#### Server side
As mentioned above this project uses the [`resource-router-middleware`](https://github.com/developit/resource-router-middleware) package to manage the api requests. The file `server/api/api.js` is responsible for the api requests and where you should extend the api. The pre-defined api is included in the `server/api/api.js` file but you should preferably separate every sub-url into it's own file.

The actual implementation of the CRUD management is best explained in the `server/api/api.js` file. Each method uses the `api-helper.js` file to transform the actual data into a correct format (which is defined below). Here is a quick explanation of how the server handles a request for the url `api/(user|test)`:
* `list` - GET / | Returns all entities of the target.
* `create` - POST / | Creates and inserts a entity into the target. Returns the newly created entity.
* `load` - - | This function is used by all the following methods. It pre loads a specific entity depending on the `id` parameter and sends it into the method.
* `read` GET /:id - Returns the entity with the given `id`.
* `update` - PUT /:id - Updates the object with the given `id`.
* `delete` - DELETE /:id - Deletes the object with the given `id`.

More details of how the actual request and responses behave will be explained in the following two subsections.

#### API request

As mentioned previously (in the [Client side](#client-side) section), each api url might have some input data requirements. In order to debug, this project uses the package [`express-validator`](https://github.com/ctavan/express-validator) by which you can define every requirement by the following:

* `req.checkParams` - Checks the request params (`req.params`) for the required data
* `req.checkQuery` - Checks the request query for the required data
* `req.checkBody` - Checks the request body for the required data
* `req.check` - Checks all the above in the order of `req`, `params`, `query`, `body`


However, to simplify the code there is a helper which can be imported by `server-api-helper` and can be viewed in action in the `api.js` file. It contains contains a few function that is of much help when defining your API. First of all it contains the `sendError` and the `sendResult` functions. Their function are quite obvious but will be more explained below (in the API response section).

Further, it contains the `validator` function which initiates the `express-validator` and this is where you can customize your own validators as well as the `errorFormatter` and so on. Worth noticing is that this function is only called from the `server.js` directly after the `bodyParser`.

Finally, we have the validation helper function named `validateRequest`. This one is a middleware function where one specifies what data the api request is required to contain. It takes one parameter `requirements` and it can be either an array of strings or an object. In case of array it will simply set the strings as required (they cannot be empty). In case of an object it will be directly sent into the `express-validator`s `check` function ([defined here](https://github.com/ctavan/express-validator#validation-by-schema)).

If every requirement is passed, all the data passed to the server is put into `req.requestData` by the function `getRequestData`. On the other hand, if errors occurs the function `sendError` will be called with the status code `400 - Bad Request`.


#### API response

Every api response is delivered by the following structure:

**Overview**
* `status` | Object
    * `code` | Number
	* `message` | String
	* `success` | Boolean
* `result` | Object
* `errors` | Array (String | Object)
* `messages` | Array (String | Object)

**Detailed**
* `status` | Object
    * *Describes the response as a whole making it possible for the client to determine what to do with the data payload.*
    * `code` | Number
	    * *The number that describes the outcome of the request.*
	* `message` | String
        * *A string describing the code.*
	* `success` | Boolean
	    * *boolean describing whether or not the request successfully performed it's task.*
* `result` | Object
    * *An object that contains the actual data that is requested. This is always an object with the requested data as a property.*
* `errors` | Array (String | Object)
    * *An array of errors that describes what has gone wrong in the request*
* `messages` | Array (String | Object)
    * *An optional array of friendly messages intended for debugging*


Know that this structure is extendable. E.g if you want to add some status around the result that is sent back and cannot be described by the status itself, one could add a `dataStatus` property. This could e.g. tell the browser to redirect the browser to another url and so on.

Also, the `api-helper` has a function regarding the response that is called `ensureCorrectResponse`. This is the implementation of the package `express-mung` which intercepts the response and transforms the body. This makes it possible to send (res.send) the following things:

* `{ result: {...} }`
    * If this is passed it is assumed that the process has been successful and that the corresponding response should be sent to the client. The status is set by `getSuccessStatus` which returns a status object depending on the request method (GET, POST, etc.).
* `{ result: {...}, status: {...}, message: {...} }`
    * Everything that will be delivered to the client is specified and will more or less just skip any modifications.
* `{ errors: [...], status: {...}, message: {...} }`
   * Same as above, except it regards error instead of success. There is no shortcut for the errors (`{error: [...]}`) since there can be multiple error codes to one request method. Thereby everything needs to be specified.

If either there is no instance of the `result` or `errors` properties, an Error will be logged on the server. This is also true if the `status` property is not set correctly.

The `ensureCorrectResponse` also adds a timestamp to the request.

##### Statuses
The statuses are essentially copied from the HTTP-codes and applied to the API. The reason for having them in the response is simply because the author wants to keep all the usable data in one place.

* 200 - OK (Everything is working correctly)
* 201 - Created (New resource has been created)
* 204 - No Content (The resource was successfully deleted)
* 301 - Moved permanently
* 400 - Bad request
* 401 - Unauthorized
* 403 - Forbidden
* 404 - NotFound
* 409 - Conflict (Indicates a conflict in e.g. an update of some data such as duplicate ID:s)
* 500 - ServerError
* 503 - Service Unavailable

## Database [MySQL]

This project uses MySQL as database built on the foundation of `promise-mysql`. Everything regarding the configuration is done in the `server/misc/database.js` file. Through the function `connect` (`connectBySource`) the server initiates the connection to the database. The source (`LOCAL`, `STAGE` `MAIN`) decides what the actual connections will be and manages the connections through an internal state containing:

* `pool` - An key-value object of database connections.
* `primaryDatabase` - The aliases of the primary database in the `pool`.

Importing the database (`import 'database'`) exposes five important functions:

* `escape` - Escapes a certain value
* `escapeId` - Escapes an identifier
* `query` - Performs an actual MySQL-query
* `format` - Formats an input string into a valid MySQL-string
* `use` - Changes the database to another one included in the pool.

### Database formatting

The basic idea about the formatting can be read [here](https://github.com/mysqljs/mysql). But there are a few addons worth mentioning:

* Everything beginning with the delimiter `#` regards an array.
* Everything beginning with the delimiter `:` regards an object.
* By default every value is escaped and every prop is escaped by id.
* Two delimiters in a row (where it makes sense: `??`, `##` - not `::`) escapes the value by id (`escapeId`).


* `?` - Simply inserts the value into the string
    * `?` - Same as above but is escaped by id
* `#` - Joins the array into a string like `value1, value2, ...`
    * `##` - Same as above but escaped by id like `´value1´, ´value2´`
* `#{prop}` - Joins the array into a string like `´prop´=value1, ´prop´=value2, ...`
* `:` - Joins the object into a string like `´prop1´=value1, ´prop2´=value2, ...`
* `:AND` - Joins the object into a string like `´prop1´=value1 AND ´prop2´=value2 AND...`
* `:OR` - Joins the object into string like `´prop1´=value1 OR ´prop2´=value2 OR...`


## Data Models

All the data models follows a few conventions that makes it easier to implement a consistent api. They are:
* Try to align with CRUD as much as possible
* If the functionality is needed, use the following functions with properties:
    * `list (filter, sorting, limit, offset)` | (string, string, number, number) => Array - *Returns all*
	* `read(id)` | Number => Object - *Returns one*
	* `create(newObject)` | Object => Object  - *Returns the object created*
	* `update(newObject)` | Object => Object - *Returns the object updated*
	* `delete(ids)` | (Number/Array) => Number(s) - *Returns the ids of the deleted objects*
* For convenience it might also be suitable to implement the following
	* `listLatest(limit)` | Number => Array
* In order to simplify the api, every function returning anything should have the last argument be an option to whether or not the response should be wrapped in an object with a property describing the data.

## Server rendering
There are quite a few things that are needed in order to make the server rendering feasible. Most of it is done in the `server.js` file but there are a few other files needed to make both the production and development files to function properly. First of all, the `react-router` package matches the given url and redirects/shows 404 if that is necessary.

If everything is fine so far the function `getInitialData` is called. This one takes in the location and the params and returns the corresponding data that that urls need to render.

The next thing that happens is that the data is encrypted with an xor-64 bytes in order to achieve some level of secrecy. After this the `RouterContext` takes in the props given from `react-router` preparing for the server rendering of the app. However, the `RouterContext` is in turn wrapped by `DataWrapper` which makes it possible for us to send data into the app. The final rendered string is later on sent into the `index.ejs` file along with the encrypted data. The encrypted data is needed to be sent into the html as well since `React` will throw error if the data present in the server rendering is not present in at the client.

The file `DataWrapper` will in turn take the prop `serverData` and pass it on as a context to all it's children. Through `RouterContext` the only children will always be the component `app/app.js` which takes in the `serverData` as a context and passes it on as a prop to all it's children, which is the actual app. This component is the parent component of the entire app, hence the name.

When the app is launched by the client, the `index.js` file will first of all try to decode the `__DATA__` variable (which is the encoded server data). Afterwards it renders the `DataWrapper` with the `Router` component into the `#root` element. In this way the same data is delivered on both server- and client-side.

In the development scenario things are working a bit differently. First of all, each time the server is initiated (by the function `initServer` in `server.js`), the `saveDevJSON` is called. This in turn calls on `getInitialDevData` and saves it into the `app/dev-data.json` file. All this to make it possible for the dev server to have some inital data when is initiated. In development mode, the `__DATA__` variable is namely set to false, which makes the `index.js` file load it's `serverData` from the `dev-data.json` file, hence exposing the data retrieved from `getInitialDevData`.

## Shifting to a non-server-rendering setup

If you want server rendering, you are good to go. You can also go and delete the `server.simple.js` file.

On the other hand, if you don't need server rendering you firsly need to replace the `server.js` with `server.simple.js` (rename it to 'server.js'). Secondly, there are a few lines of code that you can remove. They are:

* `static/index.ejs`
    * Everything in touch with the `IS_DEV_SERVER` variable.
	    * You might also want to add a default `title`-tag.
	* Obviously you should keep the `div#root` tag, but remove it's content.
* `app/`
    * `index.js`
	    * Remove everything that has to do with the prop `serverData`.
		* Remove the `DataWrapper` container.
		* Remove the `xor` dependency.
    * `app/app.js`
	    * Remove everything that has to do with the prop/context `serverData`
    * `containers/(main|page)/*.js`
	    * Remove everything that has to do with the prop `serverData`.
* `webpack/frontend.webpack.config.js`
    * Use only html file // TODO: Complete this


You can also go and remove these files:

* `/app/data-wrapper.js`

## Deployment

The deployment is processed in the `gulpfile.js` file as well as it's config. The available commands are:

* yarn deploy:stage
* yarn deploy:production -- --force

## Webpack

## Testing

# Bonus pro tips
Here are a few things to think about when creating your project. Full disclaimer, of course, hehe...

## RESTful API

### Use plural nouns, not verbs

| Resource   | GET                        | POST               | PUT                         | DELETE                                     |
| ---------- | -------------------------- | ------------------ | --------------------------- | ------------------------------------------ |
| /cars      | Returns a list of all cars | Creates a new car  | Bulk update of cars         | Delete all cars (not advised to implement) |
| /cars/711  | Returns a car with id=711  | Method not allowed | Updates the car with id=711 | Deletes the car with id=711                |

**Do not** use verbs as urls such as */getAllCars*, */createNewCar* or */deleteAllRedCars*.

Also, use plural nouns such as **cars** instead of **car**.

### GET method and query methods should not alter any state
Self-explanatory, but still important to point out. Logging can of course be the exception.

### It might be nice to provide url-wise searching, filtering, sorting, field selection and paging.

This mainly regards the GET-requests and will therefore be done using the url-queries.

**Searching**
* `GET /cars?q=Volvo`
    * Retrieves the cars that somewhere contains the word 'Volvo'.

**Filtering**
* `GET /cars?color=red`
* `GET /cars?seats<=2`

**Sorting**
* `GET /cars?sort=-manufacturer+model`
    * This returns a list of cars sorted by descending manufacturers and ascending models.

**Field selection**
* `GET /cars?fields=manufacturer,model,id,color`
    * Returns all the objects with `manufacturer`, `model`, `id` and `color` as attributes.

**Paging**
* `GET /cars?offset=10&limit=5`

## snake_case or camelCase?
According to [a study from 2010](http://ieeexplore.ieee.org/xpl/articleDetails.jsp?tp=&arnumber=5521745), snake_case is generally 20% easier to read than camelCase. Make what you what with it...

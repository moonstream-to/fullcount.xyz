# The Fullcount API

## Running the API

### Environment variables

Have a look at [`sample.env`](./sample.env). That file defines the environment variables that the API uses when it runs. Copy it over into a different
location before you run the API.

### Starting the server

For non-development setup:

```
npm install
```

For development setup:

```
npm install --include=dev
```

To build the JS files from the Typescript source:

```
npm run build
```

To start the server in development mode:

```
npm run dev
```

To start it in production mode:

```
npm run prod
```

## Narration

The API exposes endpoints that provide narration for Fullcount games. It currently uses the [OpenAI API](https://openai.com/) to generate this narration.

If you want to use the narration endpoints, you will have to specify an `OPENAI_API_KEY` environment variable. You can get a key at https://platform.openai.com.

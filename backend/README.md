# Sinatra Backend

This is the backend API for the monkeybusiness101 project, built with Sinatra.

## Setup

1. Install dependencies:
```bash
bundle install
```

2. Start the server:
```bash
bundle exec rackup
```

The server will start on http://localhost:3000

## Available Endpoints

- `GET /health` - Health check endpoint
- `GET /api/hello` - Sample endpoint

## Development

- The main application code is in `lib/app.rb`
- Environment variables are in `.env`
- The server runs on port 3000 by default 
require 'sinatra'
require 'json'
require 'dotenv/load'

# Enable CORS
before do
  response.headers['Access-Control-Allow-Origin'] = '*'
  response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
end

options '*' do
  response.headers['Allow'] = 'GET, POST, PUT, DELETE, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
  200
end

# Health check endpoint
get '/health' do
  "OK"
end

# Sample endpoint
get '/api/hello' do
  "Hello World"
end 
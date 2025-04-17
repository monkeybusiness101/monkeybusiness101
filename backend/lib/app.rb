require 'sinatra'
require 'json'
require 'dotenv/load'
require_relative 'api/base'

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

class App < Sinatra::Base
  # Health check endpoint (outside of Grape API)
  get '/health' do
    "OK"
  end

  # Mount the Grape API
  use Rack::Session::Cookie
  run API::Base
end 
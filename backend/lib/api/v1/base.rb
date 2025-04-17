module API
  module V1
    class Base < Grape::API
      version 'v1', using: :path

      # Health check endpoint
      get '/health' do
        { status: 'ok' }
      end

      # Sample endpoint
      get '/hello' do
        { message: 'Hello from Grape API!' }
      end

      # Example of a POST endpoint with parameters
      post '/echo' do
        { message: params[:message] || 'No message provided' }
      end

      # Example of a GET endpoint with a path parameter
      get '/users/:id' do
        { user_id: params[:id], name: 'John Doe' }
      end
    end
  end
end 
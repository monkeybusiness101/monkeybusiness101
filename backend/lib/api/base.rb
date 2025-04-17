require 'grape'
require_relative 'v1/base'

module API
  class Base < Grape::API
    format :json
    prefix :api

    # Add CORS headers
    before do
      header 'Access-Control-Allow-Origin', '*'
      header 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'
      header 'Access-Control-Allow-Headers', 'Content-Type, Authorization'
    end

    # Handle OPTIONS requests for CORS
    options '*' do
      header 'Allow', 'GET, POST, PUT, DELETE, OPTIONS'
      header 'Access-Control-Allow-Headers', 'Content-Type, Authorization'
      200
    end

    # Mount API versions
    mount API::V1::Base
  end
end 
class TopController < ApplicationController
  def index
    render 'top/index'
  end
  def update_token_list
    json_request = JSON.parse(request.body.read)
    tokens = json_request['tokens']
    render partial: '/tokens/token', collection: tokens
  end
end

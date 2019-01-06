Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'top#index'
  post 'ctrl/upload_zombie'
  post 'top/update_token_list', to: 'top#update_token_list'
  get 'metadata/:id', to: 'ctrl#show_metadata'
end

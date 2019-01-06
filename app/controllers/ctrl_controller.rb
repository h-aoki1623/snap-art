class CtrlController < ApplicationController
  def upload_zombie
    id = params[:id]
    strId = id.to_s
    siteURI = "http://snapart.io/"
    image = params[:image]
    imageName = strId + ".jpg"
    jsonName = strId + ".json"
    imageURI = siteURI + "images/token/#{imageName}"
    #jsonURI = siteURL + "public/metadata/#{jsonName}"
    #imageName = params[:fileName]
    #perms = ['.jpg', '.jpeg', '.gif', '.png']
    #if !perms.include?(File.extname(fileName).downcase)
      #result = 'アップロードできるのは画像ファイルのみです。'
      #render :xml => result
    #elsif file.size > 1.megabyte
    if image.size > 1.megabyte
      result = 'ファイルサイズは1MBまでです。'
      render :xml => result
    else
      File.open("public/images/token/#{imageName}", 'wb') do |f|
        f.write image.read
      end
      token = {
        'name' => "Digital Art",
        'description' => 'This token is only for testnet.',
        'image' => imageURI,
        'id' => id
      }
      File.open("public/metadata/#{jsonName}", 'w') do |f|
        f.puts JSON.generate(token)
        f.close
      end
      render :json => token
    end
  end

  def show_metadata
    id = params[:id]
    file = "public/metadata/#{id}.json"

    if File.exist?(file)
      render file: file, layout: false, content_type: 'text/json'
    else
      render plain: "file dosen't exist"
    end
  end
end

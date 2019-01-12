class ApplicationController < ActionController::Base
  before_action :http_header_log

  private

    def http_header_log
      logger.info("api_version:#{request.headers[:HTTP_API_VERSION]}")
    end
end

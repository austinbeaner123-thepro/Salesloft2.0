class ApiKeyToken
  def initialize(api_key)
    @api_key = api_key
  end

  def headers
    {
      "Authorization" => "Bearer #{@api_key}",
      "Content-Type" => "application/json"
    }
  end
end

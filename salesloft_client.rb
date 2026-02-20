require 'net/http'
require 'json'
require 'uri'

class SalesloftClient
  BASE_URI = 'https://api.salesloft.com'
  API_PATH = '/v2'

  def initialize(api_key)
    @api_key = api_key
  end

  def me
    get('me')
  end

  def get_person(id)
    get("people/#{id}")
  end

  def create_person(data)
    post('people', data)
  end

  def update_person(id, data)
    put("people/#{id}", data)
  end

  def list_people(params = {})
    get('people', params)
  end

  def cadences
    get('cadences')
  end

  def add_person_to_cadence(person_id, cadence_id)
    post("cadence_memberships", { person_id: person_id, cadence_id: cadence_id })
  end

  def person_url(id)
    "#{BASE_URI}/app/people/#{id}"
  end

  def cadence_people_url(cadence_id)
    "#{BASE_URI}/app/cadences_v2/#{cadence_id}/v2/cadence_people"
  end

  private

  def headers
    {
      'Authorization' => "Bearer #{@api_key}",
      'Content-Type' => 'application/json',
      'Accept' => 'application/json'
    }
  end

  def get(path, params = {})
    uri = URI("#{BASE_URI}#{API_PATH}/#{path}.json")
    uri.query = URI.encode_www_form(params) unless params.empty?
    request = Net::HTTP::Get.new(uri)
    headers.each { |k, v| request[k] = v }
    execute(uri, request)
  end

  def post(path, data = {})
    uri = URI("#{BASE_URI}#{API_PATH}/#{path}.json")
    request = Net::HTTP::Post.new(uri)
    headers.each { |k, v| request[k] = v }
    request.body = data.to_json
    execute(uri, request)
  end

  def put(path, data = {})
    uri = URI("#{BASE_URI}#{API_PATH}/#{path}.json")
    request = Net::HTTP::Put.new(uri)
    headers.each { |k, v| request[k] = v }
    request.body = data.to_json
    execute(uri, request)
  end

  def execute(uri, request)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 15
    http.read_timeout = 30

    response = http.request(request)

    case response
    when Net::HTTPSuccess
      JSON.parse(response.body)
    else
      { 'error' => response.code, 'message' => response.message, 'body' => response.body }
    end
  end
end

#!/usr/bin/env ruby
#
# Salesloft API Key Connection
# Uses your API key from .env to connect directly (no OAuth needed).
#
# Usage:
#   ruby connect.rb
#
# Requires a .env file with:
#   SALESLOFT_API_KEY=your_api_key_here

require_relative 'salesloft_client'

# Load .env file
env_file = File.expand_path(File.join(File.dirname(__FILE__), ".env"))
if File.exist?(env_file)
  File.readlines(env_file).each do |line|
    line = line.strip
    next if line.empty? || line.start_with?('#')
    key, value = line.split('=', 2)
    ENV[key] = value if key && value
  end
end

api_key = ENV['SALESLOFT_API_KEY']
unless api_key
  puts "Error: SALESLOFT_API_KEY not found."
  puts "Create a .env file with: SALESLOFT_API_KEY=your_key_here"
  exit 1
end

client = SalesloftClient.new(api_key)

puts "Connecting to Salesloft..."
puts

# Verify connection by fetching authenticated user
me = client.me
if me['error']
  puts "Connection failed: #{me['error']} #{me['message']}"
  puts me['body'] if me['body']
  exit 1
end

puts "Connected successfully!"
puts "  Name:  #{me['first_name']} #{me['last_name']}"
puts "  Email: #{me['email']}"
puts "  Team:  #{me.dig('team', 'name') || 'N/A'}"
puts

# List cadences
puts "Fetching cadences..."
cadences_response = client.cadences
if cadences_response.is_a?(Hash) && cadences_response['error']
  puts "  Could not fetch cadences: #{cadences_response['message']}"
else
  cadences = cadences_response['data'] || cadences_response
  if cadences.is_a?(Array) && cadences.any?
    puts "  Found #{cadences.length} cadence(s):"
    cadences.first(5).each do |c|
      puts "    - #{c['name']} (ID: #{c['id']})"
    end
    puts "    ... and #{cadences.length - 5} more" if cadences.length > 5
  else
    puts "  No cadences found."
  end
end
puts

# List people
puts "Fetching people..."
people_response = client.list_people(per_page: 5)
if people_response.is_a?(Hash) && people_response['error']
  puts "  Could not fetch people: #{people_response['message']}"
else
  people = people_response['data'] || people_response
  metadata = people_response['metadata'] || {}
  total = metadata.dig('paging', 'total_count')
  if people.is_a?(Array) && people.any?
    puts "  Showing first #{people.length} of #{total || '?'} people:"
    people.each do |p|
      puts "    - #{p['first_name']} #{p['last_name']} <#{p['email_address']}>"
    end
  else
    puts "  No people found."
  end
end

puts
puts "Salesloft connection is ready. You can now use the API."

#!/usr/bin/env ruby
# Usage: ./get_points.rb | tee points.js
# Make sure you have a valid google maps api key set up below

require 'rubygems'
require 'bundler'

Bundler.require

Geocoder.configure(
  lookup: :google,
  google: {
    language: :hu,
    use_https: true,
    api_key: ''
  }
)

res = []

Dir.glob("dataset/kerulet_*.csv").each do |filename|
  data = File.read(filename).gsub('Nagy-Britannia és Észak-Írország','UK').split("\n")
  res += data
end

res = res.sort.uniq

puts 'var LOCATIONS = ['
res.each do |t|
  query = t.gsub("Algír", "Algiers")
  results = Geocoder.search(query)[0].data
  results_en = Geocoder.search(query, language: :en)[0].data
  data = {
    city: t.split(",")[1].strip,
    hu: results["formatted_address"],
    en: results_en["formatted_address"],
    location: results["geometry"]["location"]
  }
  puts data.to_json + ","
  sleep(1)
  STDOUT.flush
end
puts ']'

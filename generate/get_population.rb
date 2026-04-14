#!/usr/bin/env ruby
# Usage: ./get_population.rb > megye_lakos.js

require 'csv'
require 'json'

res = {}

Dir.glob("dataset/oevk_*.csv").each do |filename|
  if filename =~ /oevk_(\d+)\.csv/
    year = $1
    res[year] = []
    CSV.foreach(filename, headers: true) do |row|
      res[year][row['county'].to_i] ||= []
      res[year][row['county'].to_i][row['code'].to_i] = row['count'].to_i
    end
  end
end

puts "var MEGYE_LAKOSOK = " + res.to_json

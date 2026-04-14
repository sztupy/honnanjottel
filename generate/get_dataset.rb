#!/usr/bin/env ruby
# Usage: ./get_dataset.rb > regisztralt.js

require 'csv'
require 'json'

res = {}

current_code = 0
county_codes = {}

Dir.glob("dataset/regisztralt_*.csv").each do |filename|
  if filename =~ /regisztralt_(\d+)\.csv/
    year = $1
    res[year] = []
    CSV.foreach(filename, headers: true) do |row|
      unless county_codes[row["MEGYE"]]
        current_code += 1
        county_codes[row["MEGYE"]] = current_code
      end

      res[year] << [
        county_codes[row["MEGYE"]],
        row["OEVK"].to_i,
        row["KULKEPVISELET"],
        row["VALASZTOK"].to_i
      ]
    end
  end
end

puts "var REGISZTRALTAK = " + res.to_json

#!/usr/bin/env ruby

require 'rubygems'
require 'bundler'

Bundler.require

Geocoder.configure(
  language: :hu,
  use_https: true,
  api_key: '<api_key>'
)

res = []

(0..5).each do |i|

  d = File.open("Page#{i}.htm").read

  res = res + d.scan(/ország, település: <\/div> <div class="span6">([^<]*)<\/div>/).map do |x|
    x[0].strip.gsub(/Nagy-Britannia és Észak-Ír E.K./,'UK').split(/, /)
  end.sort.uniq
end

puts '['
res.each do |t|
  puts Geocoder.search(t.join(", "))[0].data.to_json
  puts ','
  sleep(0.2)
  STDOUT.flush
end
puts ']'

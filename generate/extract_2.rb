#!/usr/bin/env ruby

require 'rubygems'
require 'bundler'

Bundler.require

res = []

(0..5).each do |i|

  d = File.open("Page#{i}.htm").read

  res = res + d.scan(/ország, település: <\/div> <div class="span6">([^<]*)<\/div>/).map do |x|
    x[0].strip.gsub(/Nagy-Britannia és Észak-Ír E.K./,'UK').split(/, /)
  end.sort.uniq
end

File.open("results") do |f|
  i = 0
  puts "var LOCATIONS = ["
  f.each_line do |l|
    print "{country:#{res[i][0].to_json},city:#{res[i][1].to_json},data:#{l.strip}}"
    i += 1
    puts "," unless i == res.count
  end
  puts
  puts "]"
end

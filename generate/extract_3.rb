#!/usr/bin/env ruby

require 'rubygems'
require 'bundler'

Bundler.require

nbsp = Nokogiri::HTML("&nbsp;").text
doc = File.open("kulfoldi_szavazok.html") { |f| Nokogiri::HTML(f) }

res = {}

tbl = doc.search('//table[@width="80%"]').first

res = tbl.search('.//tr').map do |child|
  next if child.search('.//a').empty?
  {
    county: child.search('.//td[1]').text,
    code: child.search('.//a').first.attributes['href'].value.scan(/(.*)\/(.*)\//).first,
    name: child.search('.//td[3]').text,
    foreign_city: child.search('.//td[4]').text,
    count: child.search('.//td[5]').text.gsub(nbsp, '').to_i
  }
end.compact

print "var REGISZTRALTAK = "
puts res.to_json

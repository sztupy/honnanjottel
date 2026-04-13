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

puts 'MEGYE,OEVK,SZEKHELY,KULKEPVISELET,VALASZTOK'

res.each do |r|
  puts [r[:county], r[:code][1][1..-1], r[:name], r[:foreign_city], r[:count]].join(",")
end

#!/usr/bin/env ruby
require 'date'

unless ARGV.length >= 2
  puts "Usage: create_blank_post.rb <title> <date> <expiry date (optional)"
  exit 1
end

title = ARGV[0]

begin
  date = Date.parse(ARGV[1])
rescue ArgumentError, Date::Error
  puts "Invalid date: '#{ARGV[1]}'"
  exit 2
end

begin
  expiry_date = ARGV[2] ? Date.parse(ARGV[2]) : nil
rescue ArgumentError, Date::Error
  puts "Invalid expiry date: '#{ARGV[2]}'"
  exit 3
end

filename = "#{date}-#{title.downcase.gsub(/[^a-z0-9]+/, '-').chomp('-')}"

if File.file?("content/posts/#{filename}.md")
  puts "File already exists for this date and title: #{filename}.md"
  exit 4
end

body = <<-EOF
---
title: "#{title}"
date: #{date}
expiryDate: #{expiry_date}
draft: true
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
EOF

File.open("content/posts/#{filename}.md", 'w') { |file| file.write(body) }

puts "Created content/posts/#{filename}.md"

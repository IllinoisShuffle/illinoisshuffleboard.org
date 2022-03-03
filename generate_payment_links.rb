require 'json'
require 'stripe'

# Add Stripe Key
Stripe.api_key = ''

# Add Price Objects
membership = ''
league = ''

donations = {
  0 => nil,
  5 => '',
  10 => '',
  25 => '',
  50 => '',
  100 => '',
  250 => '',
  500 => '',
  1000 => ''
}

output = {
  'no_league' => {},
  'league' => {}
}

donations.each do |amount, id|
  puts "Generating payment links for #{amount}..."

  # Start with membership
  line_items = [{ price: membership, quantity: 1 }]

  # Add donation
  line_items.push({ price: id, quantity: 1 }) if id

  # Create Link with no league
  puts '  No League'
  output['no_league'][amount.to_s] = Stripe::PaymentLink.create(
    line_items: line_items,
    shipping_address_collection: {allowed_countries: ['US']},
  ).url

  # Create Link with league
  puts '  League'
  output['league'][amount.to_s] = Stripe::PaymentLink.create(
    line_items: line_items + [{ price: league, quantity: 1 }],
    shipping_address_collection: {allowed_countries: ['US']},
  ).url
end

puts output.to_json

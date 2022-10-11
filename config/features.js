//
//
// Setup
// ############################################
exports.config = [
  {
    id: 'FREE',
    name: 'Free',
    stipe_product_id: '',
    stripe_price_id: '',
    features: [],
    is_default: true
  },
  {
    id: 'STANDARD',
    name: 'Standard',
    stripe_product_id: '',
    stripe_price_id: '',
    features: [],
    is_default: false
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    stripe_product_id: '',
    stripe_price_id: '',
    features: ['THING_COLORS'],
    is_default: false
  }
]

// src/config/stripe.js
export const STRIPE_PRICES = {
    BASIC: 'prod_RCDksq8VlhbRf5',
    PRO: "prod_RCDmHaepSfuAsQ",
    ENTERPRISE: "prod_RCDntr8o33k5Y4"
};

// Subscription tiers and features
export const SUBSCRIPTION_TIERS = {
    BASIC: {
        name: 'Basic',
        price: 10,
        features: [
            'Feature 1',
            'Feature 2',
            'Feature 3'
        ],
        priceId: STRIPE_PRICES.BASIC
    },
    PRO: {
        name: 'Pro',
        price: 20,
        features: [
            'Everything in Basic',
            'Pro Feature 1',
            'Pro Feature 2'
        ],
        priceId: STRIPE_PRICES.PRO
    },
    ENTERPRISE: {
        name: 'Enterprise',
        price: 50,
        features: [
            'Everything in Pro',
            'Enterprise Feature 1',
            'Enterprise Feature 2'
        ],
        priceId: STRIPE_PRICES.ENTERPRISE
    }
};
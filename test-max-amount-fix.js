// Test file to verify maxAmount fix for promotions
// This simulates the scenario described in the user's issue

console.log('=== MaxAmount Fix Test ===');

// Simulated cart data from user's example
const cartData = {
  cartItems: [
    {
      product: {
        id: '85383640-4d03-443b-b507-f6d086bfbd8a',
        name: 'Mintra Unisex Jet Backpack With Laptop Pocket',
      },
      quantity: 1,
      unitPrice: 850,
      totalPrice: 850,
      sellerVariationId: '3c1c6e30-dfe6-4517-bc99-674c03e06989',
    },
    {
      product: {
        id: '85383640-4d03-443b-b507-f6d086bfbd8a', // Same product ID
        name: 'Mintra Unisex Jet Backpack With Laptop Pocket',
      },
      quantity: 1,
      unitPrice: 800,
      totalPrice: 800,
      sellerVariationId: '486ff446-ee88-483c-8e56-98fce25f5731', // Different variant
    },
  ],
  promotion: {
    id: '42465160-419f-40ad-8188-a2f2482d4b56',
    specialPricing: {
      amount: 20, // 20% discount
      type: 'discount',
      maxAmount: 100, // Max discount cap
    },
  },
};

// Calculate expected behavior
const totalCartValue = cartData.cartItems.reduce(
  (sum, item) => sum + item.totalPrice,
  0
);
console.log('Total cart value:', totalCartValue); // Should be 1650

const calculatedDiscount =
  (totalCartValue * cartData.promotion.specialPricing.amount) / 100;
console.log('Calculated discount (20%):', calculatedDiscount); // Should be 330

const actualDiscount = Math.min(
  calculatedDiscount,
  cartData.promotion.specialPricing.maxAmount
);
console.log('Actual discount (capped):', actualDiscount); // Should be 100

console.log('Expected behavior:');
console.log('- Each item should have proportional discount');
console.log('- Total discount should not exceed 100');
console.log('- No duplicate discount entries per item');

// Expected proportional distribution
const item1Proportion = cartData.cartItems[0].totalPrice / totalCartValue;
const item2Proportion = cartData.cartItems[1].totalPrice / totalCartValue;

const item1ExpectedDiscount = actualDiscount * item1Proportion;
const item2ExpectedDiscount = actualDiscount * item2Proportion;

console.log('Item 1 expected discount:', item1ExpectedDiscount.toFixed(2));
console.log('Item 2 expected discount:', item2ExpectedDiscount.toFixed(2));
console.log(
  'Total expected discount:',
  (item1ExpectedDiscount + item2ExpectedDiscount).toFixed(2)
);

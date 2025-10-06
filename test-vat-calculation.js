// Quick test to verify VAT calculation logic
class OrderCalculationUtils {
  static formatCurrency(amount) {
    return Math.round(amount * 100) / 100;
  }

  static calculateVAT(vatBase, vatRate, taxIncluded) {
    if (vatBase <= 0) {
      return 0;
    }

    let vatAmount = 0;
    if (!taxIncluded) {
      // VAT is added on top of the base amount
      vatAmount = vatBase * vatRate;
    } else {
      // VAT is extracted from the base amount
      vatAmount = (vatBase * vatRate) / (1 + vatRate);
    }

    return this.formatCurrency(vatAmount);
  }
}

// Test case from the user's example
const VAT_RATE = 0.14;
const TAX_INCLUDED = true;

// Input data
const originalTotal = 850;
const discountAmount = 100;
const discountedSubtotal = originalTotal - discountAmount; // 750
const shippingFee = 0;

console.log('=== VAT Calculation Test ===');
console.log('Original total (with VAT):', originalTotal);
console.log('Discount amount:', discountAmount);
console.log('Discounted subtotal (with VAT):', discountedSubtotal);

// Calculate VAT from discounted amount (NEW LOGIC)
const productVatAmount = OrderCalculationUtils.calculateVAT(
  discountedSubtotal,
  VAT_RATE,
  TAX_INCLUDED
);

console.log('VAT amount from discounted subtotal:', productVatAmount);

// Calculate final total (FIXED LOGIC)
const finalTotal = TAX_INCLUDED
  ? discountedSubtotal + shippingFee // Fixed: no VAT adjustment needed
  : discountedSubtotal + shippingFee + productVatAmount;

console.log('Final total (NEW LOGIC):', finalTotal);

// Calculate display subtotal (without VAT)
const displaySubtotal = TAX_INCLUDED
  ? discountedSubtotal - productVatAmount
  : discountedSubtotal;

console.log(
  'Display subtotal (without VAT):',
  OrderCalculationUtils.formatCurrency(displaySubtotal)
);

console.log('\n=== Expected Response ===');
console.log({
  subTotal: OrderCalculationUtils.formatCurrency(displaySubtotal),
  discount: discountAmount,
  taxes: productVatAmount,
  shipping: shippingFee,
  total: OrderCalculationUtils.formatCurrency(finalTotal),
});



/**
 * Calculates the total price including commission
 * @param basePrice - Base price of the item
 * @param commissionType - Commission type: 'fixed' or 'percentage'
 * @param commissionValue - Commission value (fixed or percentage)
 * @returns Total price with commission included
 */
export function calculateTotalPrice(
  basePrice: number | string,
  commissionType: string,
  commissionValue: number | string
): number {
  if (!basePrice || !commissionValue) return 0;
  
  const price = parseFloat(basePrice.toString());
  let commission = 0;
  
  if (commissionType === 'percentage') {
    commission = price * (parseFloat(commissionValue.toString()) / 100);
  } else {
    commission = parseFloat(commissionValue.toString());
  }

  const totalWithCommission = parseFloat((price + commission).toFixed(2));

  const totalPrice = totalWithCommission + calculateStripeFee(totalWithCommission);
  
  return totalPrice;
}

/**
 * Calculates only the commission (without including the base price)
 * @param basePrice - Base price of the item
 * @param commissionType - Commission type: 'fixed' or 'percentage'
 * @param commissionValue - Commission value (fixed or percentage)
 * @returns Only the commission amount
 */
export function calculateCommission(
  basePrice: number | string,
  commissionType: string,
  commissionValue: number | string
): number {
  if (!basePrice || !commissionValue) return 0;
  
  const price = parseFloat(basePrice.toString());
  
  if (commissionType === 'percentage') {
    return parseFloat((price * (parseFloat(commissionValue.toString()) / 100)).toFixed(2));
  } else {
    return parseFloat(commissionValue.toString());
  }
}

/**
 * Calculates the Stripe commission (3.6% + $3.00 MXN)
 * @param amount - Amount to calculate Stripe commission on
 * @returns Stripe commission
 * 
 * NOTE: This matches the frontend calculation which uses Math.round
 * Frontend: Math.round(((amount * 0.036) + 3) * 100) / 100
 */
export function calculateStripeFee(amount: number | string): number {
  const amt = parseFloat(amount.toString());
  // Match frontend: Math.round(((amount * 0.036) + 3) * 100) / 100
  return Math.round(((amt * 0.036) + 3) * 100) / 100;
}

/**
 * Calculates the complete price breakdown for a reservation
 * @param basePrice - Base price of the item
 * @param commissionType - Commission type: 'fixed' or 'percentage'
 * @param commissionValue - Commission value (fixed or percentage)
 * @param paymentType - Payment type: 'full_payment' or 'commission_only'
 * @returns Object with the complete price breakdown
 */
export function calculatePaymentBreakdown(
  basePrice: number | string,
  commissionType: string,
  commissionValue: number | string,
  paymentType: string
) {
  const price = parseFloat(basePrice.toString());
  const commission = calculateCommission(basePrice, commissionType, commissionValue);
  const totalPrice = price + commission;
  const stripeFee = calculateStripeFee(totalPrice);

  if (paymentType === 'full_payment') {
    return {
      payNow: totalPrice + stripeFee,
      payAtProperty: 0,
      basePrice: price,
      commission: commission,
      stripeFee: stripeFee,
      totalCommission: commission + stripeFee
    };
  } else {
    return {
      payNow: commission + stripeFee,
      payAtProperty: price,
      basePrice: price,
      commission: commission,
      stripeFee: stripeFee,
      totalCommission: commission + stripeFee
    };
  }
}

/**
 * Calculates the complete price breakdown for a reservation with multiple guests
 * 
 * CALCULATION FORMULA:
 * 1. Calculate commission per guest: commissionPerGuest = pricePerGuest * commissionPercentage (or fixed value)
 * 2. Calculate (price + commission) per guest: pricePlusCommissionPerGuest = pricePerGuest + commissionPerGuest
 * 3. Multiply by number of guests: totalPricePlusCommission = pricePlusCommissionPerGuest * guestsCount
 * 4. Calculate stripe fee on the total: stripeFee = calculateStripeFee(totalPricePlusCommission)
 * 5. Total to pay: payNow = totalPricePlusCommission + stripeFee
 * 
 * In summary: ((price + commission) * guests) + stripeFee
 * Where stripeFee is calculated on: ((price + commission) * guests)
 * 
 * @param basePrice - Base price of the item per guest
 * @param commissionType - Commission type: 'fixed' or 'percentage'
 * @param commissionValue - Commission value (fixed or percentage)
 * @param paymentType - Payment type: 'full_payment' or 'commission_only'
 * @param guestsCount - Number of guests
 * @returns Object with the complete price breakdown
 */
export function calculatePaymentBreakdownWithGuests(
  basePrice: number | string,
  commissionType: string,
  commissionValue: number | string,
  paymentType: string,
  guestsCount: number
) {
  const pricePerGuest = parseFloat(basePrice.toString());
  
  // Calculate commission per guest first
  let commissionPerGuest = 0;
  
  if (commissionType === 'percentage') {
    // Calculate commission as percentage of price per guest
    const commissionCalc = (pricePerGuest * parseFloat(commissionValue.toString())) / 100;
    commissionPerGuest = Math.round(commissionCalc * 100) / 100;
  } else {
    // Fixed commission per guest
    commissionPerGuest = parseFloat(commissionValue.toString());
  }
  
  // Calculate (price + commission) per guest
  const pricePlusCommissionPerGuest = pricePerGuest + commissionPerGuest;
  
  // Multiply by guests: (price + commission) * guests
  const totalPricePlusCommission = pricePlusCommissionPerGuest * guestsCount;
  
  // Calculate stripe fee on the total: ((price + commission) * guests)
  const stripeFee = calculateStripeFee(totalPricePlusCommission);
  
  // Total commission = (commission * guests) + stripeFee
  const totalBasePrice = pricePerGuest * guestsCount;
  const totalCommission = (commissionPerGuest * guestsCount);
  const totalCommissionAmount = Math.round((totalCommission + stripeFee) * 100) / 100;
  
  if (paymentType === 'full_payment') {
    // Full payment: ((price + commission) * guests) + stripeFee
    const payNow = Math.round((totalPricePlusCommission + stripeFee) * 100) / 100;
    return {
      payNow,
      payAtProperty: 0,
      basePrice: parseFloat(totalBasePrice.toFixed(2)),
      commission: parseFloat(totalCommission.toFixed(2)),
      stripeFee: parseFloat(stripeFee.toFixed(2)),
      totalCommission: parseFloat(totalCommissionAmount.toFixed(2))
    };
  } else {
    // Commission only: (commission * guests) + stripeFee
    const payNow = Math.round(totalCommissionAmount * 100) / 100;
    return {
      payNow,
      payAtProperty: parseFloat(totalBasePrice.toFixed(2)),
      basePrice: parseFloat(totalBasePrice.toFixed(2)),
      commission: parseFloat(totalCommission.toFixed(2)),
      stripeFee: parseFloat(stripeFee.toFixed(2)),
      totalCommission: parseFloat(totalCommissionAmount.toFixed(2))
    };
  }
}

export function calculateTotalWithCommissions(
  activities: Activity[], 
  lodging: Lodging, 
  guestsCount: string, 
  paymentType: string
): number {
  let total = 0;
  const guests = Number(guestsCount);
  
  // Calculate activities total
  if (activities.length > 0) {
    activities.forEach((activity: Activity, index: number) => {
      const breakdown = calculatePaymentBreakdownWithGuests(
        activity.price,
        activity.commission_type,
        activity.commission_value,
        paymentType,
        guests
      );
      
      total += breakdown.payNow;
    });
  }
  
  // Calculate lodging total
  if (lodging) {
    const breakdown = calculatePaymentBreakdownWithGuests(
      lodging.price,
      lodging.commission_type,
      lodging.commission_value,
      paymentType,
      guests
    );
    
    total += breakdown.payNow;
  }

  return total;
}


export type Activity = { 
  id: string; 
  name: string; 
  price: string; 
  commission_type: string; 
  commission_value: string; 
};

export type Lodging = { 
  id: string; 
  name: string; 
  price: string; 
  commission_type: string; 
  commission_value: string; 
} | undefined;
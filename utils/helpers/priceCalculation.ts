/**
 * Calcula el precio total incluyendo comisión
 * @param basePrice - Precio base del item
 * @param commissionType - Tipo de comisión: 'fixed' o 'percentage'
 * @param commissionValue - Valor de la comisión (fijo o porcentaje)
 * @returns Precio total con comisión incluida
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
 * Calcula solo la comisión (sin incluir el precio base)
 * @param basePrice - Precio base del item
 * @param commissionType - Tipo de comisión: 'fixed' o 'percentage'
 * @param commissionValue - Valor de la comisión (fijo o porcentaje)
 * @returns Solo el monto de la comisión
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
 * Calcula la comisión de Stripe (3.6% + $3.00 MXN)
 * @param amount - Monto sobre el cual calcular la comisión de Stripe
 * @returns Comisión de Stripe
 */
export function calculateStripeFee(amount: number | string): number {
  const amt = parseFloat(amount.toString());
  return parseFloat(((amt * 0.036) + 3).toFixed(2));
}

/**
 * Calcula el desglose completo de precios para una reserva
 * @param basePrice - Precio base del item
 * @param commissionType - Tipo de comisión: 'fixed' o 'percentage'
 * @param commissionValue - Valor de la comisión (fijo o porcentaje)
 * @param paymentType - Tipo de pago: 'full_payment' o 'commission_only'
 * @returns Objeto con el desglose completo de precios
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
 * Calcula el desglose completo de precios para una reserva con múltiples huéspedes
 * @param basePrice - Precio base del item por huésped
 * @param commissionType - Tipo de comisión: 'fixed' o 'percentage'
 * @param commissionValue - Valor de la comisión (fijo o porcentaje)
 * @param paymentType - Tipo de pago: 'full_payment' o 'commission_only'
 * @param guestsCount - Número de huéspedes
 * @returns Objeto con el desglose completo de precios
 */
export function calculatePaymentBreakdownWithGuests(
  basePrice: number | string,
  commissionType: string,
  commissionValue: number | string,
  paymentType: string,
  guestsCount: number
) {
  const pricePerGuest = parseFloat(basePrice.toString());
  const totalBasePrice = pricePerGuest * guestsCount;
  
  let commission = 0;
  
  if (commissionType === 'percentage') {
    commission = totalBasePrice * (parseFloat(commissionValue.toString()) / 100);
  } else {
    commission = parseFloat(commissionValue.toString());
  }
  
  const totalPrice = totalBasePrice + commission;
  const stripeFee = calculateStripeFee(totalPrice);
  
  if (paymentType === 'full_payment') {
    return {
      payNow: parseFloat((totalPrice + stripeFee).toFixed(2)),
      payAtProperty: 0,
      basePrice: parseFloat(totalBasePrice.toFixed(2)),
      commission: parseFloat(commission.toFixed(2)),
      stripeFee: parseFloat(stripeFee.toFixed(2)),
      totalCommission: parseFloat((commission + stripeFee).toFixed(2))
    };
  } else {
    return {
      payNow: parseFloat((commission + stripeFee).toFixed(2)),
      payAtProperty: parseFloat(totalBasePrice.toFixed(2)),
      basePrice: parseFloat(totalBasePrice.toFixed(2)),
      commission: parseFloat(commission.toFixed(2)),
      stripeFee: parseFloat(stripeFee.toFixed(2)),
      totalCommission: parseFloat((commission + stripeFee).toFixed(2))
    };
  }
}

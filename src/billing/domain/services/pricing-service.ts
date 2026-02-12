/**
 * PricingService — Domain Service.
 * Логіка розрахунку вартості поїздки не належить жодній конкретній сутності,
 * тому виноситься в доменний сервіс.
 */
export class PricingService {
  private static readonly UNLOCK_FEE = 10; // грн за розблокування
  private static readonly RATE_PER_MINUTE = 4.5; // грн за хвилину

  static calculateTripCost(durationMinutes: number): number {
    const rideCost = durationMinutes * this.RATE_PER_MINUTE;
    const total = this.UNLOCK_FEE + rideCost;
    return Math.round(total * 100) / 100;
  }

  static getUnlockFee(): number {
    return this.UNLOCK_FEE;
  }

  static getRatePerMinute(): number {
    return this.RATE_PER_MINUTE;
  }
}

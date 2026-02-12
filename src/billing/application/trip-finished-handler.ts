import { DomainEvent } from "../../shared/domain/domain-event";
import { IBillingAccountRepository } from "../domain/repositories/i-billing-account-repository";
import { PricingService } from "../domain/services/pricing-service";

/**
 * TripFinishedHandler — обробник доменної події TripFinished.
 *
 * Живе в контексті Billing. Слухає подію з контексту Riding.
 * Це приклад того, як контексти комунікують через події,
 * не знаючи один про одного напряму.
 */
export class TripFinishedHandler {
  constructor(
    private readonly billingRepo: IBillingAccountRepository
  ) {}

  handle(event: DomainEvent): void {
    const { tripId, riderId, durationMinutes } = event.payload as {
      tripId: string;
      riderId: string;
      durationMinutes: number;
    };

    const account = this.billingRepo.findByRiderId(riderId);
    if (!account) {
      console.error(`[Billing] No billing account found for rider ${riderId}`);
      return;
    }

    const cost = PricingService.calculateTripCost(durationMinutes);

    try {
      account.charge(
        tripId,
        cost,
        `Trip ${tripId}: ${durationMinutes.toFixed(1)} min @ ${PricingService.getRatePerMinute()} UAH/min + ${PricingService.getUnlockFee()} UAH unlock`
      );
      this.billingRepo.save(account);
      console.log(
        `[Billing] Charged ${cost.toFixed(2)} UAH for trip ${tripId}. Remaining balance: ${account.balance.toFixed(2)} UAH`
      );
    } catch (error: any) {
      console.error(`[Billing] Failed to charge for trip ${tripId}: ${error.message}`);
    }
  }
}

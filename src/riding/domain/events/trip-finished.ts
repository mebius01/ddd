import { DomainEvent } from "../../../shared/domain/domain-event";

/**
 * TripFinished — доменна подія.
 * Коли поїздка завершується, ця подія "летить" в контекст Billing,
 * який списує гроші з картки. Контекст Riding нічого не знає про банківські API.
 */
export class TripFinished implements DomainEvent {
  readonly eventName = "TripFinished";
  readonly occurredOn: Date;
  readonly payload: Record<string, unknown>;

  constructor(
    tripId: string,
    riderId: string,
    scooterId: string,
    durationMinutes: number,
    distanceKm: number,
  ) {
    this.occurredOn = new Date();
    this.payload = { tripId, riderId, scooterId, durationMinutes, distanceKm };
  }
}

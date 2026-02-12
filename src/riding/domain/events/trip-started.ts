import { DomainEvent } from "../../../shared/domain/domain-event";

export class TripStarted implements DomainEvent {
  readonly eventName = "TripStarted";
  readonly occurredOn: Date;
  readonly payload: Record<string, unknown>;

  constructor(tripId: string, riderId: string, scooterId: string) {
    this.occurredOn = new Date();
    this.payload = { tripId, riderId, scooterId };
  }
}

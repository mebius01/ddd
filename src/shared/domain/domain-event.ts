/**
 * Domain Event — подія, що сталася в домені.
 * Контексти комунікують через події, не знаючи один про одного напряму.
 */
export interface DomainEvent {
  readonly eventName: string;
  readonly occurredOn: Date;
  readonly payload: Record<string, unknown>;
}

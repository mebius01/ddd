import { AggregateRoot } from "../../../shared/domain/aggregate-root";
import { UniqueId } from "../../../shared/domain/unique-id";
import { Location } from "../valueObjects/location";
import { RoutePoint } from "../valueObjects/route-point";
import { Scooter } from "../entities/scooter";
import { TripStarted } from "../events/trip-started";
import { TripFinished } from "../events/trip-finished";

export enum TripStatus {
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

interface TripProps {
  riderId: UniqueId;
  scooter: Scooter;
  status: TripStatus;
  route: RoutePoint[];
  startedAt: Date;
  finishedAt: Date | null;
}

/**
 * Trip — Aggregate Root.
 *
 * Правило: Всі зміни йдуть через Root.
 * Ви не можете додати нову точку маршруту напряму в БД.
 * Ви викликаєте trip.addLocation(newLocation).
 * Це гарантує, що поїздка не закінчена і самокат не розряджений.
 */
export class Trip extends AggregateRoot<TripProps> {
  private constructor(props: TripProps, id?: UniqueId) {
    super(props, id);
  }

  /**
   * Factory method — створення нової поїздки (Unlock).
   * Самокат розблоковується, фіксується початкова точка маршруту.
   */
  static start(riderId: UniqueId, scooter: Scooter): Trip {
    // Бізнес-правило: самокат має бути доступний
    scooter.unlock();

    const startLocation = scooter.location;
    const now = new Date();

    const trip = new Trip({
      riderId,
      scooter,
      status: TripStatus.IN_PROGRESS,
      route: [RoutePoint.create(startLocation, now)],
      startedAt: now,
      finishedAt: null,
    });

    // Публікуємо доменну подію
    trip.addDomainEvent(
      new TripStarted(
        trip.id.toString(),
        riderId.toString(),
        scooter.id.toString(),
      ),
    );

    return trip;
  }

  get riderId(): UniqueId {
    return this.props.riderId;
  }

  get scooter(): Scooter {
    return this.props.scooter;
  }

  get status(): TripStatus {
    return this.props.status;
  }

  get route(): ReadonlyArray<RoutePoint> {
    return this.props.route;
  }

  get startedAt(): Date {
    return this.props.startedAt;
  }

  get finishedAt(): Date | null {
    return this.props.finishedAt;
  }

  /**
   * Додати нову точку маршруту.
   * Бізнес-правило: поїздка має бути активною.
   */
  addLocation(location: Location): void {
    if (this.props.status !== TripStatus.IN_PROGRESS) {
      throw new Error("Cannot add location to a finished trip");
    }

    const point = RoutePoint.create(location, new Date());
    this.props.route.push(point);

    // Оновлюємо позицію самоката
    this.props.scooter.updateLocation(location);
  }

  /**
   * Завершити поїздку (Park).
   * Самокат паркується, генерується подія TripFinished.
   */
  finish(parkingLocation: Location): void {
    if (this.props.status !== TripStatus.IN_PROGRESS) {
      throw new Error("Trip is already finished");
    }

    // Додаємо фінальну точку маршруту
    this.props.route.push(RoutePoint.create(parkingLocation, new Date()));

    // Паркуємо самокат
    this.props.scooter.park(parkingLocation);

    this.props.status = TripStatus.FINISHED;
    this.props.finishedAt = new Date();

    // Розраховуємо тривалість та відстань
    const durationMinutes = this.calculateDurationMinutes();
    const distanceKm = this.calculateDistanceKm();

    // Публікуємо доменну подію — Billing "почує" її
    this.addDomainEvent(
      new TripFinished(
        this.id.toString(),
        this.props.riderId.toString(),
        this.props.scooter.id.toString(),
        durationMinutes,
        distanceKm,
      ),
    );
  }

  private calculateDurationMinutes(): number {
    const end = this.props.finishedAt ?? new Date();
    return (end.getTime() - this.props.startedAt.getTime()) / 1000 / 60;
  }

  private calculateDistanceKm(): number {
    let totalDistance = 0;
    for (let i = 1; i < this.props.route.length; i++) {
      const prev = this.props.route[i - 1].location;
      const curr = this.props.route[i].location;
      totalDistance += this.haversineDistance(prev, curr);
    }
    return Math.round(totalDistance * 100) / 100;
  }

  /**
   * Формула Гаверсина для обчислення відстані між двома GPS-точками.
   */
  private haversineDistance(a: Location, b: Location): number {
    const R = 6371; // Радіус Землі в км
    const dLat = this.toRad(b.latitude - a.latitude);
    const dLon = this.toRad(b.longitude - a.longitude);
    const lat1 = this.toRad(a.latitude);
    const lat2 = this.toRad(b.latitude);

    const x =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}

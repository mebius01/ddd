import { Entity } from "../../../shared/domain/entity";
import { UniqueId } from "../../../shared/domain/unique-id";
import { Location } from "../valueObjects/location";

export enum ScooterStatus {
  AVAILABLE = "AVAILABLE",
  IN_USE = "IN_USE",
  LOW_BATTERY = "LOW_BATTERY",
  MAINTENANCE = "MAINTENANCE",
}

interface ScooterProps {
  serialNumber: string;
  status: ScooterStatus;
  batteryLevel: number; // 0-100
  location: Location;
}

/**
 * Scooter — Entity в контексті Riding.
 * Має унікальний ID (серійний номер). Навіть якщо пофарбувати в інший колір — це той самий самокат.
 */
export class Scooter extends Entity<ScooterProps> {
  private constructor(props: ScooterProps, id?: UniqueId) {
    super(props, id);
  }

  static create(
    serialNumber: string,
    location: Location,
    batteryLevel: number = 100,
    id?: UniqueId,
  ): Scooter {
    if (batteryLevel < 0 || batteryLevel > 100) {
      throw new Error("Battery level must be between 0 and 100");
    }
    const status =
      batteryLevel < 15 ? ScooterStatus.LOW_BATTERY : ScooterStatus.AVAILABLE;

    return new Scooter({ serialNumber, status, batteryLevel, location }, id);
  }

  get serialNumber(): string {
    return this.props.serialNumber;
  }

  get status(): ScooterStatus {
    return this.props.status;
  }

  get batteryLevel(): number {
    return this.props.batteryLevel;
  }

  get location(): Location {
    return this.props.location;
  }

  isAvailable(): boolean {
    return this.props.status === ScooterStatus.AVAILABLE;
  }

  unlock(): void {
    if (!this.isAvailable()) {
      throw new Error(
        `Scooter ${this.props.serialNumber} is not available (status: ${this.props.status})`,
      );
    }
    this.props.status = ScooterStatus.IN_USE;
  }

  park(location: Location): void {
    this.props.location = location;
    this.props.status =
      this.props.batteryLevel < 15
        ? ScooterStatus.LOW_BATTERY
        : ScooterStatus.AVAILABLE;
  }

  drainBattery(percent: number): void {
    this.props.batteryLevel = Math.max(0, this.props.batteryLevel - percent);
    if (this.props.batteryLevel < 5) {
      throw new Error("Battery critically low! Trip must end.");
    }
  }

  updateLocation(location: Location): void {
    this.props.location = location;
  }
}

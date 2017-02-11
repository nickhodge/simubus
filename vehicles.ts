// (c) 2017 The Digital Cottage Pty Ltd
// By Nick Hodge
// Licensed under GPLv3 https://www.gnu.org/licenses/gpl-3.0.en.html

import * as Infrastructure from "./infrastructure";
import * as Config from "./config";
import * as Interfaces from './interfaces';

// TBD vehicle, external set intent
// .intent
// .target x,y
// .target speed
// in source lane until target reached

export class BaseVehicle implements Interfaces.IVehicle {
  description: string;
  lane: Interfaces.ILane;
  config: Interfaces.ISimConfig;
  x_M: number;
  y_M: number;
  maxSpeed_Kmph: number;
  initialSpeed_Kmph: number;
  currentSpeed_Kmph: number;
  deltaT_s: number;
  deltaD_M: number;
  length_M: number;
  stoppedTime_s: number;
  pixelLength: number;
  width_M: number;
  pixelWidth: number;
  currentState: Interfaces.VehicleMovementState;
  currentIntent: Interfaces.VehicleMovementIntent;
  stopCountdown: number; // stop countdown, in seconds
  acceleration_MpS: number;
  fillcolour_rgb: string;
  strokecolour_rgb: string;

  constructor(_description: string, _vehicleLength_M: number, _acceleration_MpS: number, _x_M: number, _y_M: number, _initialSpeed_Kmph: number, _maxSpeed_Kmph: number, _config: Interfaces.ISimConfig, _lane: Interfaces.ILane) {
    this.description = _description;
    this.lane = _lane;
    this.config = _config;
    this.x_M = _x_M - _vehicleLength_M; // start offset correctly
    this.y_M = _y_M; // x,y coordinates in m is bottom left corner
    this.maxSpeed_Kmph = _maxSpeed_Kmph;
    this.stoppedTime_s = 0; // seconds stopped
    this.deltaT_s = 0; // seconds active (delta - T)
    this.deltaD_M = 0; // meters travelled (delta - D)
    this.initialSpeed_Kmph = _initialSpeed_Kmph;
    this.currentSpeed_Kmph = this.initialSpeed_Kmph;
    this.length_M = _vehicleLength_M;
    this.pixelLength = this.length_M * this.config.simScale_PpM;
    this.width_M = 3;
    this.pixelWidth = this.width_M * this.config.simScale_PpM;
    this.currentState = Interfaces.VehicleMovementState.stopped;
    this.currentIntent = Interfaces.VehicleMovementIntent.normal;
    this.stopCountdown = 0; // stop countdown, in seconds
    this.acceleration_MpS = _acceleration_MpS; // acc in metres / second
    this.fillcolour_rgb = "#aaa";
    this.strokecolour_rgb = this.fillcolour_rgb;
  }

  stopping_distance(): number {
    // ref: http://www.softschools.com/formulas/physics/stopping_distance_formula/89/
    return ((this.config.KmphToMps(this.currentSpeed_Kmph) ** 2) / (2 * this.config.coefficientfriction * this.config.gravity));
  }

  queued_update() {
    this.deltaT_s += this.config.simFrameRate_Ps;
    this.stoppedTime_s += this.config.simFrameRate_Ps;
  }

  update() {
    if (this.stopCountdown > 0) {
      this.stopCountdown -= (this.config.simFrameRate_Ps);
      if (this.stopCountdown <= 0) {
        this.currentState = Interfaces.VehicleMovementState.accelerating;
      } else {
        this.currentState = Interfaces.VehicleMovementState.stopped;
      }
    }

    // based on the current state, and intent
    switch (this.currentState) {
      case Interfaces.VehicleMovementState.decelerating:
        this.strokecolour_rgb = "#f00";
        this.currentSpeed_Kmph -= this.config.MpsToKmphTick(this.acceleration_MpS);
        if (this.currentSpeed_Kmph < 0) {
          this.strokecolour_rgb = this.fillcolour_rgb;
          this.currentSpeed_Kmph = 0;
        }
        this.x_M = this.x_M + (this.config.KmphPerTick(this.currentSpeed_Kmph));
        break;
      case Interfaces.VehicleMovementState.stopped:
        this.strokecolour_rgb = this.fillcolour_rgb;
        this.currentSpeed_Kmph = 0;
        this.x_M = this.x_M;
        this.stoppedTime_s += this.config.simFrameRate_Ps;
        break;
      case Interfaces.VehicleMovementState.accelerating:
        this.strokecolour_rgb = "#0f0";
        this.currentSpeed_Kmph += this.config.MpsToKmphTick(this.acceleration_MpS);
        if (this.currentSpeed_Kmph > this.maxSpeed_Kmph) {
          this.strokecolour_rgb = "#070";
          this.currentSpeed_Kmph = this.maxSpeed_Kmph;
          this.currentState = Interfaces.VehicleMovementState.cruising;
        }
        this.x_M = this.x_M + (this.config.KmphPerTick(this.currentSpeed_Kmph));
        break;
      case Interfaces.VehicleMovementState.cruising:
        this.strokecolour_rgb = "#070";
        this.x_M = this.x_M + (this.config.KmphPerTick(this.currentSpeed_Kmph));
        break;
      default:
    }
    this.deltaD_M += (this.config.KmphPerTick(this.currentSpeed_Kmph));
    this.deltaT_s += this.config.simFrameRate_Ps;
  }

  draw(p: any) {
    p.fill(this.fillcolour_rgb);
    p.stroke(this.strokecolour_rgb);
    if (this.currentSpeed_Kmph < this.maxSpeed_Kmph) {
      p.strokeWeight(3); // fatter == currently below maximum speed
    } else {
      p.strokeWeight(1);
    }
    p.rect(this.x_M * this.config.simScale_PpM, this.y_M * this.config.simScale_PpM, this.pixelLength, this.pixelWidth);
  }
}

export class AbstractBus extends BaseVehicle {
  constructor(_description: string, _vehicleLength_M: number, _acceleration_MpS: number, _x_M: number, _y_M: number, _initialSpeed_Kmph: number, _maxSpeed_Kmph: number, _config: Interfaces.ISimConfig, _lane: Interfaces.ILane) {
    super(_description, _vehicleLength_M, _acceleration_MpS, _x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane);
  }
}

export class SmallBus extends AbstractBus {
  constructor(_x_M: number, _y_M: number, _initialSpeed_Kmph: number, _maxSpeed_Kmph: number, _config: Interfaces.ISimConfig, _lane: Interfaces.ILane) {
    super("Small Bus 12.5m", 12.5, 1.25, _x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane);
    this.fillcolour_rgb = "#00f";
  }
}

export class LargeBus extends AbstractBus {
  constructor(_x_M: number, _y_M: number, _initialSpeed_Kmph: number, _maxSpeed_Kmph: number, _config: Interfaces.ISimConfig, _lane: Interfaces.ILane) {
    super("Large Articulated Bus 18m", 18, 1.0, _x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane);
    this.fillcolour_rgb = "#00f";
  }
}

export class M30Bus extends AbstractBus {
  constructor(_x_M: number, _y_M: number, _initialSpeed_Kmph: number, _maxSpeed_Kmph: number, _config: Interfaces.ISimConfig, _lane: Interfaces.ILane) {
    super("M30 Bus 18m", 18, 1.0, _x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane);
    this.fillcolour_rgb = "#f00";
  }
}

export class BLineBus extends AbstractBus {
  constructor(_x_M: number, _y_M: number, _initialSpeed_Kmph: number, _maxSpeed_Kmph: number, _config: Interfaces.ISimConfig, _lane: Interfaces.ILane) {
    super("BLine Bus 12.5m", 12, 1.15, _x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane);
    this.fillcolour_rgb = "#ff0";
  }
}

export class Car extends BaseVehicle {
  constructor(_x_M: number, _y_M: number, _initialSpeed_Kmph: number, _maxSpeed_Kmph: number, _config: Interfaces.ISimConfig, _lane: Interfaces.ILane) {
    super("Car 4.9m", 4.9, 2.5, _x_M, _y_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane);
    this.acceleration_MpS += (0.5 - Math.random()) * 2;
    this.maxSpeed_Kmph += (0.5 - Math.random()) * 8;
  }
}
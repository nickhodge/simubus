// (c) 2017 The Digital Cottage Pty Ltd
// By Nick Hodge
// Licensed under GPLv3 https://www.gnu.org/licenses/gpl-3.0.en.html

import * as Infrastructure from "./infrastructure";
import * as Config from "./config";
import * as Interfaces from './interfaces';
import * as Collections from 'typescript-collections';
import * as Stops from './stops';

// TBD vehicle, external set intent
// .intent
// .target x,y
// .target speed
// in source lane until target reached

export abstract class BaseVehicle implements Interfaces.IVehicle, Interfaces.IRoadThing {
  xStart_M: number;
  yStart_M: number;
  length_M: number;
  width_M: number;
  description: string;
  lane: Interfaces.ILane;
  config: Interfaces.ISimConfig;
  maxSpeed_Kmph: number;
  initialSpeed_Kmph: number;
  currentSpeed_Kmph: number;
  deltaT_S: number;
  deltaD_M: number;
  stoppedTime_s: number;
  pixelLength: number;
  pixelWidth: number;
  currentState: Interfaces.VehicleMovementState;
  currentIntent: Interfaces.VehicleMovementIntent;
  stopCountdown_S: number; // stop countdown, in seconds
  acceleration_MpS: number;
  deleration_MpS: number;
  fillcolour_rgb: string;
  strokecolour_rgb: string;
  stoppedTime_S: number;

  constructor(_description: string, _vehicleLength_M: number, _acceleration_MpS: number, _deleration_MpS: number, _x_M: number, _y_M: number, _initialSpeed_Kmph: number, _maxSpeed_Kmph: number, _config: Interfaces.ISimConfig, _lane: Interfaces.ILane) {
    this.description = _description;
    this.lane = _lane;
    this.config = _config;
    this.xStart_M = _x_M - _vehicleLength_M - this.config.minimumDistance_M; // start offset correctly
    this.yStart_M = _y_M; // x,y coordinates in m is bottom left corner
    this.length_M = _vehicleLength_M;
    this.maxSpeed_Kmph = _maxSpeed_Kmph;
    this.width_M = 3;
    this.stoppedTime_S = 0; // seconds stopped
    this.deltaT_S = 0; // seconds active (delta - T)
    this.deltaD_M = 0; // meters travelled (delta - D)
    this.initialSpeed_Kmph = _initialSpeed_Kmph;
    this.currentSpeed_Kmph = this.initialSpeed_Kmph;
    this.pixelLength = this.length_M * this.config.simScale_PpM;
    this.pixelWidth = this.width_M * this.config.simScale_PpM;
    this.currentState = Interfaces.VehicleMovementState.stopped;
    this.currentIntent = Interfaces.VehicleMovementIntent.normal;
    this.stopCountdown_S = 0; // stop countdown, in seconds
    this.acceleration_MpS = _acceleration_MpS; // acc in metres / second
    this.deleration_MpS = _deleration_MpS; // acc in metres / second
    this.fillcolour_rgb = "#aaa";
    this.strokecolour_rgb = this.fillcolour_rgb;
  }

  stopping_distance(): number {
    // ref: http://www.softschools.com/formulas/physics/stopping_distance_formula/89/
    return ((this.config.KmphToMps(this.currentSpeed_Kmph) ** 2) / (2 * this.config.coefficientfriction * this.config.gravity)) + this.config.reactionTimeToM(this.currentSpeed_Kmph);
  }

  front_of(): number {
    return (this.xStart_M + this.length_M);
  }

  rear_of(): number {
    return (this.xStart_M);
  }

  stop_ahead(s: Interfaces.IStop): boolean {
    if (s.front_of() > this.front_of())
      return true;
    else
      return false;
  }

  any_stops_ahead(s: Collections.LinkedList<Interfaces.IStop>): boolean {
    var that = this;
    var stopAhead: boolean = false;
    s.forEach(st => {
      if (st instanceof Stops.TrafficStop && that.stop_ahead(st)) {
        stopAhead = true;
      }
    });
    return stopAhead;
  }

  distance_between(r: Interfaces.IRoadThing): number {
    return ((r.xStart_M + r.length_M) - this.front_of());
  }

  near_stop(s: Interfaces.IRoadThing): boolean {
    if (this.distance_between(s) <= this.stopping_distance())
      return true;
    else
      return false;
  }

  close_enough(s: Interfaces.IRoadThing): boolean {
    if (Math.abs(this.distance_between(s)) <= this.config.minimumDistance_M)
      return true;
    else
      return false;
  }

  queued_update() {
    this.deltaT_S += this.config.simFrameRate_Ps;
    this.stoppedTime_S += this.config.simFrameRate_Ps;
  }

  update() {
    if (this.stopCountdown_S > 0) {
      this.stopCountdown_S -= (this.config.simFrameRate_Ps);
      this.currentState = Interfaces.VehicleMovementState.stopped;
      if (this.stopCountdown_S <= 0) {
        this.currentIntent = Interfaces.VehicleMovementIntent.leavingstop;
         this.currentState = Interfaces.VehicleMovementState.accelerating;
      }
    }

    // based on the current state, and intent
    switch (this.currentState) {
      case Interfaces.VehicleMovementState.decelerating:
        this.strokecolour_rgb = "#f00";
        this.currentSpeed_Kmph -= this.config.MpsToKmphTick(this.deleration_MpS);
        if (this.currentSpeed_Kmph < 0) {
          this.strokecolour_rgb = this.fillcolour_rgb;
          this.currentSpeed_Kmph = 0;
        }
        this.xStart_M = this.xStart_M + (this.config.KmphPerTick(this.currentSpeed_Kmph));
        break;

      case Interfaces.VehicleMovementState.stopped:
        this.strokecolour_rgb = this.fillcolour_rgb;
        this.currentSpeed_Kmph = 0;
        this.xStart_M = this.xStart_M;
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
        this.xStart_M = this.xStart_M + (this.config.KmphPerTick(this.currentSpeed_Kmph));
        break;

      case Interfaces.VehicleMovementState.cruising:
        this.strokecolour_rgb = "#070";
        this.xStart_M = this.xStart_M + (this.config.KmphPerTick(this.currentSpeed_Kmph));
        break;

      default:
    }
    this.deltaD_M += this.config.KmphPerTick(this.currentSpeed_Kmph);
    this.deltaT_S += this.config.simFrameRate_Ps;
  }

  draw(p: any) {
    p.fill(this.fillcolour_rgb);
    p.stroke(this.strokecolour_rgb);
    if (this.currentSpeed_Kmph < this.maxSpeed_Kmph) {
      p.strokeWeight(3); // fatter == currently below maximum speed
    } else {
      p.strokeWeight(1);
    }
    p.rect(this.xStart_M * this.config.simScale_PpM, this.yStart_M * this.config.simScale_PpM, this.pixelLength, this.pixelWidth);
  }
}

export abstract class Bus extends BaseVehicle {
  islocalstopping : boolean;
  constructor(_description: string, _vehicleLength_M: number, _acceleration_MpS: number, _deleration_MpS: number, _xStart_M: number, _yStart_M: number, _initialSpeed_Kmph: number, _maxSpeed_Kmph: number, _config: Interfaces.ISimConfig, _lane: Interfaces.ILane) {
    super(_description, _vehicleLength_M, _acceleration_MpS, _deleration_MpS, _xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane);
      this.islocalstopping = false;
    }
}

export class SmallBus extends Bus {
  constructor(_xStart_M: number, _yStart_M: number, _initialSpeed_Kmph: number, _maxSpeed_Kmph: number, _config: Interfaces.ISimConfig, _lane: Interfaces.ILane) {
    super("Small Bus 12.5m", 12.5, 1.25, 2.2, _xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane);
    this.fillcolour_rgb = "#00d";
    this.islocalstopping = (this.config.getRandomInRange(1, 3) === 2);
  }
}

export class LargeBus extends Bus {
  constructor(_xStart_M: number, _yStart_M: number, _initialSpeed_Kmph: number, _maxSpeed_Kmph: number, _config: Interfaces.ISimConfig, _lane: Interfaces.ILane) {
    super("Large Articulated Bus 18m", 18, 1.0, 2.0, _xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane);
    this.fillcolour_rgb = "#00f";
  }
}

export class M30Bus extends Bus {
  constructor(_xStart_M: number, _yStart_M: number, _initialSpeed_Kmph: number, _maxSpeed_Kmph: number, _config: Interfaces.ISimConfig, _lane: Interfaces.ILane) {
    super("M30 Bus 18m", 18, 1.0, 2.0, _xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane);
    this.fillcolour_rgb = "#f00";
    this.islocalstopping = (this.config.getRandomInRange(1, 2) === 2);
  }
}

export class BLineBus extends Bus {
  constructor(_xStart_M: number, _yStart_M: number, _initialSpeed_Kmph: number, _maxSpeed_Kmph: number, _config: Interfaces.ISimConfig, _lane: Interfaces.ILane) {
    super("BLine Bus 12.5m", 12, 1.15, 2.0, _xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane);
    this.fillcolour_rgb = "#ff0";
  }
}

export class Car extends BaseVehicle {
  constructor(_xStart_M: number, _yStart_M: number, _initialSpeed_Kmph: number, _maxSpeed_Kmph: number, _config: Interfaces.ISimConfig, _lane: Interfaces.ILane) {
    super("Car 4.9m", 4.9, 2.5, 3.2, _xStart_M, _yStart_M, _initialSpeed_Kmph, _maxSpeed_Kmph, _config, _lane);
    this.acceleration_MpS += (0.5 - Math.random()) * 2;
    this.maxSpeed_Kmph += (0.5 - Math.random()) * 8;
  }
}
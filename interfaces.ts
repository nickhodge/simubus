// (c) 2017 The Digital Cottage Pty Ltd
// By Nick Hodge
// Licensed under GPLv3 https://www.gnu.org/licenses/gpl-3.0.en.html

import * as Collections from 'typescript-collections';

export interface ILaneStatistics {
  bline_pause_time: number;
  queued_vehicles: number;
  queued_buses: number;
}

export interface ISimStatistics {
  vehicles_in_queue : KnockoutObservable<number>;
  vehicles_average_Kmph : KnockoutObservable<number>;
  vehicles_finished : KnockoutObservable<number>;
  vehicles_finished_distance_M : KnockoutObservable<number>;
  vehicles_finished_time_S : KnockoutObservable<number>;
  bline_pause_time_S :KnockoutObservable<number>;
  buses_in_queue : KnockoutObservable<number>;
  absoluteTime_S: KnockoutObservable<number>;
  vehicles_finish_pH : KnockoutObservable<number>;
  update_vehicle_finished(d: number, s : number) : void;
}

export interface ILaneSimConfig {
    config: ISimConfig;
    smallbus_pH: number;
    largebus_pH: number;
    blinebus_pH: number;
    car_pH: number;
    start(): void;
    update_smallbus(): boolean;
    update_largebus(): boolean;
    update_blinebus(): boolean;
    update_car(): boolean;
}

export interface ISimConfig {
    absoluteTime_s: number; // absolute time 0 this sim has been running (s)
    pixelHeight_P: number;
    pixelWidth_P: number; // measured in pixels
    simDistance_M: number; //measured in metres
    simScale_PpM: number; // each pixel == simScale metres
    frameRate_Ps: number; // render frames per second
    simFrameRate_Ps: number; // each frame is this much of a second
    simSpeed: number;     // factor speed in framerate (1 == same as frameRate_Ps)
    stoppingDistance_S: number; // stopping distance, in seconds between moving vehicles
    minimumDistance_M: number; // minimum distance, m, between stationary vehicles
    fromStopGapRatio: number; // ratio of length of vehicle ahead before start from zero
    braking_MpS: number;
    KmphPerTick(kmph: number): number;
    KmphToMps(kmph: number): number;
    MpsPerTick(m: number): number;
    MpsToKmphTick(mps: number): number;
    TicksToSeconds(ticks: number): number;
    getRandomInRange(min: number, max: number): number;
    secondsToHMS(secs: number) :string;
}

export enum VehicleMovementState {
  accelerating,
  decelerating,
  cruising,
  stoppping,
  stopped,
  waiting
}

export enum VehicleMovementIntent {
  mergingright,
  mergingleft
}

export interface IVehicle {
  description: string;
  config: ISimConfig;
  lane: ILane;
  maxSpeed_Kmph: number;
  stoppedTime_s: number;
  initialSpeed_Kmph: number;
  currentSpeed_Kmph: number;
  deltaT_s: number;
  deltaD_M: number;
  currentState: VehicleMovementState;
  length_M: number;
  width_M: number;
  x_M: number;
  y_M: number;
  acceleration_MpS: number;
  fillcolour_rgb: string;
  strokecolour_rgb: string;
  queued_update():void;
  update(): void;
  draw(p : any): void;
}

export interface ILane {
  config: ISimConfig;
  laneconfig: ILaneSimConfig;
  vehicles: Collections.LinkedList<IVehicle>;
  queued_vehicles: Collections.LinkedList<IVehicle>;
  sim_statistics: ISimStatistics;
  length_M: number;
  xStart_M: number;
  xEnd_M: number;
  update(): ILaneStatistics;
  draw(p : any): void;
}

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
    m30bus_pH: number;
    blinebus_pH: number;
    car_pH: number;
    start(): void;
    update_smallbus(): boolean;
    update_largebus(): boolean;
    update_blinebus(): boolean;
    update_m30bus(): boolean;
    update_car(): boolean;
}

export interface IRoadThing {
  xStart_M : number; // starting position (x) in absolute meters
  yStart_M : number; // starting position (y) in absolute meters
  length_M : number; // length in meters
  width_M : number; // width in meters
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
    minimumDistance_M: number; // minimum distance, m, between stationary vehicles
    coefficientfriction: number;
    gravity:number;
    reactionTime_S:number;
    KmphPerTick(kmph: number): number;
    KmphToMps(kmph: number): number;
    MpsPerTick(m: number): number;
    MpsToKmphTick(mps: number): number;
    TicksToSeconds(ticks: number): number;
    getRandomInRange(min: number, max: number): number;
    secondsToHMS(secs: number) :string;
    KmphToMps(kmph: number): number;
    reactionTimeToM(kmph : number) : number
}

export enum VehicleMovementState {
  accelerating,
  decelerating,
  cruising,
  stopped
}

export enum VehicleMovementIntent {
  normal,
  stopping,
  leavingstop,
  mergingright,
  mergingleft
}

export interface IVehicle {
  description: string;
  config: ISimConfig;
  lane: ILane;
  maxSpeed_Kmph: number;
  stoppedTime_S: number;
  initialSpeed_Kmph: number;
  currentSpeed_Kmph: number;
  deltaT_S: number; // time active, in seconds
  deltaD_M: number; // distance moved, in meters
  currentState: VehicleMovementState;
  currentIntent: VehicleMovementIntent;
  acceleration_MpS: number;
  deleration_MpS: number;
  fillcolour_rgb: string;
  strokecolour_rgb: string;
  stopCountdown_S : number;
  front_of():number;
  rear_of():number;
  stop_ahead(s : IStop) :boolean;
  near_stop(s : IRoadThing) : boolean;
  any_stops_ahead(s : Collections.LinkedList<IStop>) : boolean;
  close_enough(s : IRoadThing) : boolean
  queued_update():void;
  update(): void;
  stopping_distance() : number;
  draw(p : any): void;
}

export interface IStop {
  stopping: boolean;
  stopping_S: number;
  lane: IRoadThing;
  trafficStop_Trigger_S : number;
  config: ISimConfig;
  strokecolour_rgb : string;
  front_of():number;
  rear_of():number;
  near_vehicles(v: Collections.LinkedList<IVehicle>): boolean;
  near_vehicle(v: IVehicle): boolean
  update(): boolean;
  draw(p : any): void;
}

export interface ILane {
   xStart_M : number; // starting position (x) in absolute meters
  yStart_M : number; // starting position (y) in absolute meters
  length_M : number; // length in meters
  width_M : number; // width in meters
  config: ISimConfig;
  laneconfig: ILaneSimConfig;
  vehicles: Collections.LinkedList<IVehicle>;
  queued_vehicles: Collections.LinkedList<IVehicle>;
  stops: Collections.LinkedList<IStop>;
  sim_statistics: ISimStatistics;
  front_of():number;
  rear_of():number;
  update(lanes : Collections.LinkedList<ILane>): ILaneStatistics;
  draw(p : any): void;
}

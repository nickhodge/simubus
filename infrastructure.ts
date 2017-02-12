// (c) 2017 The Digital Cottage Pty Ltd
// By Nick Hodge
// Licensed under GPLv3 https://www.gnu.org/licenses/gpl-3.0.en.html

import * as Collections from 'typescript-collections';

import * as Vehicles from "./vehicles";
import * as Interfaces from './interfaces';
import * as Stops from './stops';
import * as Statistics from './statistics';


export class Lane implements Interfaces.ILane, Interfaces.IRoadThing {
  config: Interfaces.ISimConfig;
  laneconfig: Interfaces.ILaneSimConfig;
  sim_statistics: Interfaces.ISimStatistics;
  vehicles: Collections.LinkedList<Interfaces.IVehicle>;
  queued_vehicles: Collections.LinkedList<Interfaces.IVehicle>;
  stops: Collections.LinkedList<Interfaces.IStop>;
  length_M: number;
  xStart_M: number;
  xEnd_M: number;
  num: number;
  width_M: number;
  yStart_M: number;
  yEnd_M: number;
  pixelStartX: number;
  pixelStartY: number;
  pixelEndX: number;
  pixelEndY: number;

  constructor(_num: number, _xStart_M: number, _xEnd_M: number, _config: Interfaces.ISimConfig, _laneconfig: Interfaces.ILaneSimConfig, _simstatistics: Interfaces.ISimStatistics) {
    this.config = _config; // passed in configuration
    this.laneconfig = _laneconfig;
    this.sim_statistics = _simstatistics;
    this.num = _num; // lane number, lower == more curbside
    this.xStart_M = _xStart_M; // starting
    this.xEnd_M = _xEnd_M; // end
    this.width_M = 4; // lane is 4m wide
    this.yStart_M = (this.num * this.width_M) + (this.width_M / 2);
    this.yEnd_M = this.yStart_M;
    this.pixelStartX = this.xStart_M * this.config.simScale_PpM;
    this.pixelStartY = this.yStart_M * this.config.simScale_PpM;
    this.pixelEndX = this.xEnd_M * this.config.simScale_PpM;
    this.pixelEndY = this.yEnd_M * this.config.simScale_PpM;
    this.length_M = this.xEnd_M - this.xStart_M; // length of this lane, in m

    this.vehicles = new Collections.LinkedList<Interfaces.IVehicle>();
    this.queued_vehicles = new Collections.LinkedList<Interfaces.IVehicle>();
    this.stops = new Collections.LinkedList<Interfaces.IStop>();
    this.laneconfig.start();
  }

  front_of(): number {
    return (this.xEnd_M);
  }

  end_of(): number {
    return (this.xEnd_M);
  }

  rear_of(): number {
    return (this.xStart_M)
  }

  update(lanes: Collections.LinkedList<Interfaces.ILane>): Interfaces.ILaneStatistics {
    // move all vehichles along by the appropriate distance for the timescale
    // start from front of lane, moving backward to rear of lane

    var response = new Statistics.LaneStatistics();

    this.stops.forEach(s => {
      if (s.update()) {
        this.vehicles.forEach(v => {
          if (s.near_vehicle(v)) {
            if (!s.stopping) {
              v.stopCountdown_S = 0;
              v.currentState = Interfaces.VehicleMovementState.accelerating;
            }
          }
        });
      }
    });

    this.queued_vehicles.forEach(qv => {
      qv.queued_update();

      // gather count of queued buses specifically
      if (qv instanceof Vehicles.Bus) {
        response.queued_buses += 1;
      }

      // grab bline stats for reporting
      if (qv instanceof Vehicles.BLineBus) {
        response.bline_pause_time += qv.stoppedTime_s;
      }
    });

    // each in lane
    this.vehicles.forEach(v => {

      // if vehicle is past the end of this lane, delete it.  
      if (v.rear_of() >= this.end_of()) {
        this.sim_statistics.update_vehicle_finished(v.deltaD_M, v.deltaT_S);
        this.vehicles.remove(v);
      }

      this.stops.forEach(s => {

        if (v.stop_ahead(s)) { // only process this stop if it is "ahead" of current vehicle
          if (s instanceof Stops.BusStop && v instanceof Vehicles.Bus) { // bus stop work        
            if (v.islocalstopping) {
              if (v.currentState !== Interfaces.VehicleMovementState.stopped) { // if vehicle is not already at a stop
                if (v.close_enough(s)) {
                  v.currentState = Interfaces.VehicleMovementState.stopped;
                  v.stopCountdown_S = s.trafficStop_Trigger_S;
                }

                if (v.near_stop(s) && v.stopCountdown_S === 0) { // getting closer, decelerate
                  v.currentState = Interfaces.VehicleMovementState.decelerating;
                  v.currentIntent = Interfaces.VehicleMovementIntent.stopping;
                }
              }
            }
          }

          if (s instanceof Stops.TrafficStop) {
            // traffic stop work 
            if (s.stopping) {
              if (v.close_enough(s)) {
                v.currentState = Interfaces.VehicleMovementState.stopped;
                v.stopCountdown_S = s.trafficStop_Trigger_S / this.config.simFrameRate_Ps;
              }

              if (v.near_stop(s) && v.stopCountdown_S === 0) {
                v.currentState = Interfaces.VehicleMovementState.decelerating;
                v.currentIntent = Interfaces.VehicleMovementIntent.stopping;
              }
            } else {
              v.stopCountdown_S = 0;
            }
          }
        }
      });
      v.update();
    });



    // update all the vehicle types: need to enqueue more?
    // TBD: implement as visitor pattern
    if (this.laneconfig.update_smallbus()) {
      this.queued_vehicles.add(new Vehicles.SmallBus(0, this.yStart_M, 0, 50, this.config, this));
    }

    if (this.laneconfig.update_largebus()) {
      this.queued_vehicles.add(new Vehicles.LargeBus(0, this.yStart_M, 0, 50, this.config, this));
    }

    if (this.laneconfig.update_m30bus()) {
      this.queued_vehicles.add(new Vehicles.M30Bus(0, this.yStart_M, 0, 50, this.config, this));
    }

    if (this.laneconfig.update_blinebus()) {
      this.queued_vehicles.add(new Vehicles.BLineBus(0, this.yStart_M, 0, 50, this.config, this));
    }

    if (this.laneconfig.update_car()) {
      this.queued_vehicles.add(new Vehicles.Car(0, this.yStart_M, 0, 60, this.config, this));
    }

    // nothing in the lane, and something in the queue - dequeue it
    if (this.vehicles.size() === 0 && this.queued_vehicles.size() > 0) {
      // special case for start
      var nextinqueue = this.queued_vehicles.first();
      this.vehicles.add(nextinqueue);
      this.queued_vehicles.remove(nextinqueue);
      nextinqueue.currentState = Interfaces.VehicleMovementState.accelerating;
    } else {

      // otherwise, normal de-queue event 
      var backmostinlane = this.vehicles.last();
      var nextinqueue = this.queued_vehicles.first();

      if (backmostinlane !== undefined && nextinqueue !== undefined) {
        if (backmostinlane.front_of() > this.config.minimumDistance_M) {
          // release one from the queue as there is enough space ahead
          this.vehicles.add(nextinqueue);
          this.queued_vehicles.remove(nextinqueue);
        }
      }
    }

    if (this.vehicles.size() >= 1) {
      var f = this.vehicles.elementAtIndex(0);
      if (f.currentState === Interfaces.VehicleMovementState.decelerating && f.stopCountdown_S <= 0 && !f.any_stops_ahead(this.stops)) {
        f.currentState = Interfaces.VehicleMovementState.accelerating;
      }
    }

    if (this.vehicles.size() >= 2) { // more than 2 in the lane, so manage
      for (var i = 1; i < this.vehicles.size(); i++) {
        var ahead = this.vehicles.elementAtIndex(i - 1);
        var behind = this.vehicles.elementAtIndex(i);

        var distance = ahead.rear_of() - behind.front_of(); // distance from front of one vehicle to the other
        var moving_gap = behind.stopping_distance(); // based on rear vehicle speed, what is stopping distance?
        // TBD: relative speed slow down?

        // this block only if the vehicle to the rear is moving
        if (behind.currentSpeed_Kmph > 0) {

          // car ahead is too close, slow down
          if (distance < moving_gap || distance <= this.config.minimumDistance_M) {
            behind.currentState = Interfaces.VehicleMovementState.decelerating; // change to cruise
          }

          // car ahead stopped, and we are getting close. stop!
          if (ahead.currentSpeed_Kmph === 0 && distance <= this.config.minimumDistance_M) {
            behind.currentState = Interfaces.VehicleMovementState.stopped; // change to stop
          }
        }

        // if distance is wide enough, accelerate (and let vehicle decide to 'cruise' if at max speed)
        if (distance >= moving_gap && behind.currentIntent === Interfaces.VehicleMovementIntent.normal) { // otherwise, OK to start accelerate
          behind.currentState = Interfaces.VehicleMovementState.accelerating;
        }
      }


      // TBD if car, and below max speed
      // check lane to right
      // if space, move over
      // if lane ending, zip merge left

      // TBD if bus
      // if local bus or m30; and indented bus bay stop to left
      // - % chance stopping
      // 
      // not leftmost, merge left
      // 
      // if bus stopped ahead, and not stopping, zip merge right

    }
    response.queued_vehicles = this.queued_vehicles.size();
    return response;
  }

  draw(p: any) {

    p.stroke(255);
    p.strokeWeight(1);
    p.line(this.pixelStartX, this.pixelStartY, this.pixelEndX, this.pixelEndY);
    p.stroke(0);

    this.stops.forEach(s => {
      s.draw(p);
    });

    this.vehicles.forEach(v => {
      v.draw(p);
    });
  }
}
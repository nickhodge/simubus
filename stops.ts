// (c) 2017 The Digital Cottage Pty Ltd
// By Nick Hodge
// Licensed under GPLv3 https://www.gnu.org/licenses/gpl-3.0.en.html

import * as Collections from 'typescript-collections';

import * as Vehicles from "./vehicles";
import * as Interfaces from './interfaces';

export abstract class Stop implements Interfaces.IStop, Interfaces.IRoadThing {
    xStart_M: number;
    xEnd_M: number;
    yStart_M: number;
    yEnd_M: number;
    length_M: number;
    width_M: number;
    lane : Interfaces.IRoadThing;
    stopping: boolean;
    stopping_S: number;
    config: Interfaces.ISimConfig;
    pixelStartX: number;
    pixelStartY: number;
    pixelEndX: number;
    pixelEndY: number;
    strokecolour_rgb: string;
    trafficStop_Trigger_S: number;

    constructor(_xStart_M: number, stopping_s: number, _config: Interfaces.ISimConfig, _lane: Interfaces.IRoadThing) {
        this.config = _config;
        this.lane = _lane;
        this.xStart_M = _xStart_M;
        this.length_M = 1;
        this.width_M = this.lane.width_M;
        this.xEnd_M = _xStart_M;
        this.yStart_M = this.lane.yStart_M;
        this.yEnd_M = this.lane.yStart_M + this.lane.width_M;
        this.trafficStop_Trigger_S = 0;
        this.pixelStartX = this.xStart_M * this.config.simScale_PpM;
        this.pixelStartY = this.yStart_M * this.config.simScale_PpM;
        this.pixelEndX = this.xEnd_M * this.config.simScale_PpM;
        this.pixelEndY = this.yEnd_M * this.config.simScale_PpM;
    }

    near_vehicles(v: Collections.LinkedList<Interfaces.IVehicle>): boolean {
        var that = this;
        var vehicles_near: boolean = false;
        v.forEach(vi => {
            if (that.near_vehicle(vi)) {
                vehicles_near = true;
            }
        });
        return vehicles_near;
    }

    near_vehicle(v: Interfaces.IVehicle): boolean {      
        if (this.xStart_M < (v.front_of() + this.config.minimumDistance_M * 4) && 
        this.xStart_M > v.rear_of() - (this.config.minimumDistance_M * 4))
            return true;
        else
            return false;
    }

    front_of(): number {
        return (this.xStart_M);
    }

    rear_of(): number {
        return (this.xStart_M);
    }
    update(): boolean {
        return false;
    }

    draw(p: any) {
        p.stroke(this.strokecolour_rgb); // bus stops blue
        p.strokeWeight(3);
        p.line(this.pixelStartX, this.pixelStartY, this.pixelEndX, this.pixelEndY);
        p.stroke(0);
    }
}

export class BusStop extends Stop {
    stop_timing_S: number;
    constructor(_xStart_M: number, stopping_s: number, _config: Interfaces.ISimConfig, _lane: Interfaces.IRoadThing) {
        super(_xStart_M, stopping_s, _config, _lane);
        this.strokecolour_rgb = "#00f";
        this.trafficStop_Trigger_S = stopping_s;
    }
    update(): boolean {
        return false;
    }
}

export class TrafficStop extends Stop {
    go_timing_S: number; // wait this number of seconds before "GO"
    stop_timing_S : number; // how long for stop

    constructor(_initial_sync_pause: number, _go_timing_S: number, _stop_timing_S: number, _xStart_M: number, _config: Interfaces.ISimConfig, _lane: Interfaces.IRoadThing) {
        super(_xStart_M, 0, _config, _lane);
        this.strokecolour_rgb = "#f00";
        this.stopping = true;
        this.stop_timing_S = _stop_timing_S;
        this.go_timing_S = _go_timing_S;
        this.trafficStop_Trigger_S = _initial_sync_pause;
    }

    update(): boolean {

        this.trafficStop_Trigger_S -= (this.config.simFrameRate_Ps);
        var stateChange = false;

        if (this.trafficStop_Trigger_S <= 0) {
            if (this.stopping) {
                this.stopping = false;
                this.trafficStop_Trigger_S = this.go_timing_S;
                this.strokecolour_rgb = "#0f0"; // green light
                stateChange = true;
            }
            else {
                this.stopping = true;
                this.trafficStop_Trigger_S = this.stop_timing_S;
                this.strokecolour_rgb = "#f00"; // red light
                stateChange = true;
            }
        }
        return stateChange;
    }
}
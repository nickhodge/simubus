// (c) 2017 The Digital Cottage Pty Ltd
// By Nick Hodge
// Licensed under GPLv3 https://www.gnu.org/licenses/gpl-3.0.en.html

import * as Interfaces from './interfaces';

export class LaneSimConfig implements Interfaces.ILaneSimConfig {
    config: Interfaces.ISimConfig;
    smallbus_pH: number;
    largebus_pH: number;
    m30bus_pH: number;
    blinebus_pH: number;
    car_pH: number;

    smallbus_Trigger: number;
    largebus_Trigger: number;
    m30bus_Trigger: number;
    blinebus_Trigger: number;
    car_Trigger: number;

    constructor(_smallbus_pH: number, _largebus_pH: number,_m30bus_pH:number, _blinebus_pH: number, _car_pH: number, _config: Interfaces.ISimConfig) {
        this.config = _config;
        this.smallbus_pH = _smallbus_pH;
        this.largebus_pH = _largebus_pH;
        this.m30bus_pH = _m30bus_pH;
        this.blinebus_pH = _blinebus_pH;
        this.car_pH = _car_pH;

        // initially set all to -1, meaning no countdown
        this.smallbus_Trigger = -1;
        this.largebus_Trigger = -1;
        this.m30bus_Trigger = -1;
        this.blinebus_Trigger = -1;
        this.car_Trigger = -1;
    }

    start(): void {
        if (this.smallbus_pH !== 0)
            this.smallbus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.smallbus_pH;
        if (this.largebus_pH !== 0)
            this.largebus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.largebus_pH;
        if (this.m30bus_pH !== 0)
            this.m30bus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.m30bus_pH;
        if (this.blinebus_pH !== 0)
            this.blinebus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.blinebus_pH;
        if (this.car_pH !== 0)
            this.car_Trigger = ((60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.car_pH) * this.config.getRandomInRange(0.95, 1.05);
    }

    update_smallbus(): boolean {
        if (this.smallbus_Trigger < 0) return false; // set -1, therefore don't seed new vehicles
        this.smallbus_Trigger--;
        if (this.smallbus_Trigger < 1) {
            this.smallbus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.smallbus_pH;
            return true; // yes, enqueue
        } else {
            return false;
        }
    }

    update_largebus(): boolean {
        if (this.largebus_Trigger < 0) return false;
        this.largebus_Trigger--;
        if (this.largebus_Trigger < 1) {
            this.largebus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.largebus_pH;
            return true; // yes, enqueue
        } else {
            return false;
        }
    }

    update_m30bus(): boolean {
        if (this.m30bus_Trigger < 0) return false;
        this.m30bus_Trigger--;
        if (this.m30bus_Trigger < 1) {
            this.m30bus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.m30bus_pH;
            return true; // yes, enqueue
        } else {
            return false;
        }
    }

    update_blinebus(): boolean {
        if (this.blinebus_Trigger < 0) return false;
        this.blinebus_Trigger--;
        if (this.blinebus_Trigger < 1) {
            this.blinebus_Trigger = (60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.blinebus_pH;
            return true; // yes, enqueue
        } else {
            return false;
        }
    }

    update_car(): boolean {
        if (this.car_Trigger < 0) return false;
        this.car_Trigger--;
        if (this.car_Trigger < 1) {
            this.car_Trigger = ((60 * 60 * this.config.frameRate_Ps * this.config.simSpeed) / this.car_pH) * this.config.getRandomInRange(0.95, 1.05);
            return true; // yes, enqueue
        } else {
            return false;
        }
    }
}

export class SimConfig implements Interfaces.ISimConfig {
    absoluteTime_s: number;
    pixelHeight_P: number;
    pixelWidth_P: number; // measured in pixels
    simDistance_M: number; //measured in metres
    simScale_PpM: number; // each pixel == simScale metres
    frameRate_Ps: number; // render frames per second
    simFrameRate_Ps: number; // each frame is this much of a second
    simSpeed: number; // factor speed in framerate (1 == same as frameRate_Ps)
    stoppingDistance_S: number; // stopping distance, in seconds between moving vehicles
    minimumDistance_M: number; // minimum distance, m, between stationary vehicles
    fromStopGapRatio: number; // ratio of length of vehicle ahead before start from zero
    braking_MpS: number;
    coefficientfriction: number;
    gravity:number;

    constructor(c?: any) {
        this.absoluteTime_s = 0;
        this.pixelHeight_P = 160; // measured in pixels
        this.pixelWidth_P = 1000; // measured in pixels
        this.simDistance_M = 300; //measured in metres
        this.simScale_PpM = this.pixelWidth_P / this.simDistance_M; // each pixel == simScale metres
        this.frameRate_Ps = 30; // frames per second to run animation
        this.simFrameRate_Ps = 1 / this.frameRate_Ps; // simulation running at framerate per second
        this.simSpeed = 1.0; // factor speed in framerate (1 == same as frameRate_Ps)

        this.stoppingDistance_S = 1.4; // stopping distance, in seconds between moving vehicles
        this.minimumDistance_M = 2; // minimum distance, m, between stationary vehicles
        this.fromStopGapRatio = 0.5; // ratio of length of vehicle ahead before start from zero
        this.braking_MpS = 4; // http://nacto.org/docs/usdg/vehicle_stopping_distance_and_time_upenn.pdf
        this.coefficientfriction = 0.6; // asphalt
        this.gravity = 9.8; //m per second    
    }

    KmphPerTick(kmph: number): number { //given a km/h and a number of ticks per second give me pixels on current scale 
        return (((kmph * 1000) / 60) / 60 / (this.frameRate_Ps * this.simSpeed));
    };

    MpsPerTick(m: number): number { //given a m/s and a number of ticks per second give me pixels on current scale 
        return (m / (this.frameRate_Ps * this.simSpeed));
    };

    MpsToKmphTick(mps: number): number { // given m/s, convert to Km/hr
        return (mps / 1000) * 60 * 60 / (this.frameRate_Ps * this.simSpeed);
    };

    TicksToSeconds(ticks: number): number { // given a tick value, what is this in seconds?
        return (ticks * (this.frameRate_Ps * this.simSpeed));
    }

    KmphToMps(kmph: number): number { // given km/hr what is this in m/s?
        return (kmph * 1000 / 60 / 60);
    }

    getRandomInRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    secondsToHMS(secs: number) : string {
        var date = new Date(null);
        date.setSeconds(secs); 
        return date.toISOString().substr(11, 8);
    }
}
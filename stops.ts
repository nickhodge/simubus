// (c) 2017 The Digital Cottage Pty Ltd
// By Nick Hodge
// Licensed under GPLv3 https://www.gnu.org/licenses/gpl-3.0.en.html

import * as Collections from 'typescript-collections';

import * as Vehicles from "./vehicles";
import * as Interfaces from './interfaces';

export class AbstractStop implements Interfaces.IStop {
    xStart_M: number;
    yStart_M: number;
    stopping: boolean;
    stopping_S: number;
    config: Interfaces.ISimConfig;
    pixelStartX: number;
    pixelStartY: number;
    pixelEndX: number;
    pixelEndY: number;
    strokecolour_rgb: string;

    constructor(_xStart_M: number, _yStart_M: number, _yEnd_M: number, stopping_s: number, _config: Interfaces.ISimConfig) {
        this.config = _config;
        this.xStart_M = _xStart_M;
        this.yStart_M = _yStart_M;
        this.pixelStartX = this.xStart_M * this.config.simScale_PpM;
        this.pixelStartY = _yStart_M * this.config.simScale_PpM;
        this.pixelEndX = this.xStart_M * this.config.simScale_PpM;
        this.pixelEndY = _yEnd_M * this.config.simScale_PpM;
    }

    update() {
        // nothing to update periodically
    }

    draw(p: any) {
        p.stroke(this.strokecolour_rgb); // bus stops blue
        p.strokeWeight(3);
        p.line(this.pixelStartX, this.pixelStartY, this.pixelEndX, this.pixelEndY);
        p.stroke(0);
    }
}

export class BusStop extends AbstractStop {
    stop_timing_S: number;
    constructor(_xStart_M: number, _yStart_M: number, _yEnd_M: number, stopping_s: number, _config: Interfaces.ISimConfig) {
        super(_xStart_M, _yStart_M, _yEnd_M, stopping_s, _config);
        this.strokecolour_rgb = "#00f";
        this.stop_timing_S = 10;
    }
    update() {
        // nothing to update periodically
    }
}

export class TrafficStop extends AbstractStop {
    go_timing_S: number; // wait this number of seconds before "GO"
    stop_timing_S: number;
    trafficStop_Trigger: number;

    constructor(_initial_sync_pause: number, _go_timing_S: number, _stop_timing_S: number, _xStart_M: number, _yStart_M: number, _yEnd_M: number, stopping_s: number, _config: Interfaces.ISimConfig) {
        super(_xStart_M, _yStart_M, _yEnd_M, stopping_s, _config);
        this.strokecolour_rgb = "#f00";
        this.stopping = true;
        this.stop_timing_S = _stop_timing_S;
        this.go_timing_S = _go_timing_S;
        this.trafficStop_Trigger = _initial_sync_pause;
    }

    update() {

        this.trafficStop_Trigger -= (this.config.simFrameRate_Ps);

        if (this.trafficStop_Trigger <= 0) {
            if (this.stopping) {
                this.stopping = false;
                this.trafficStop_Trigger = this.go_timing_S;
                this.strokecolour_rgb = "#0f0"; // green light
            }
            else {
               this.stopping = true;
                this.trafficStop_Trigger = this.stop_timing_S;
                this.strokecolour_rgb = "#f00"; // red light
            }
        }
    }
}
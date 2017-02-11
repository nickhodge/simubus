// (c) 2017 The Digital Cottage Pty Ltd
// By Nick Hodge
// Licensed under GPLv3 https://www.gnu.org/licenses/gpl-3.0.en.html

import * as Collections from 'typescript-collections';

import * as Vehicles from "./vehicles";
import * as Interfaces from './interfaces';

// TBD add stops at particular _m
// stop causes vehicles that touch it for _s time
// add check as approach

export class BusStop implements Interfaces.IStop {
  xStart_M: number;
  stopping_s: number;
  config: Interfaces.ISimConfig;
  pixelStartX: number;
  pixelStartY: number;
  pixelEndX: number;
  pixelEndY: number;

  constructor(xStart_M: number, _yStart_M: number, _yEnd_M: number, stopping_s: number, _config: Interfaces.ISimConfig) {
    this.config = _config;
    this.pixelStartX = this.xStart_M * this.config.simScale_PpM;
    this.pixelStartY = _yStart_M * this.config.simScale_PpM;
    this.pixelEndX = this.xStart_M * this.config.simScale_PpM;
    this.pixelEndY = _yEnd_M * this.config.simScale_PpM;
  }

  draw(p: any) {
    p.stroke("#00f"); // bus stops blue
    p.strokeWeight(2);
    p.line(this.pixelStartX, this.pixelStartY, this.pixelEndX, this.pixelEndY);
    p.stroke(0);
  }
}

export class TrafficStop implements Interfaces.IStop {
  xStart_M: number;
  stopping: boolean;
  stopping_s: number;
  config: Interfaces.ISimConfig;
  pixelStartX: number;
  pixelStartY: number;
  pixelEndX: number;
  pixelEndY: number;

  constructor(xStart_M: number, _yStart_M: number, _yEnd_M: number, stopping_s: number, _config: Interfaces.ISimConfig) {
    this.config = _config;
    this.pixelStartX = this.xStart_M * this.config.simScale_PpM;
    this.pixelStartY = _yStart_M * this.config.simScale_PpM;
    this.pixelEndX = this.xStart_M * this.config.simScale_PpM;
    this.pixelEndY = _yEnd_M * this.config.simScale_PpM;
  }

  strokecolour() : string {
      if (this.stopping)
        return "#f00"; // red light
      else
        return "#0f0"; // green light
  }

  draw(p: any) {
    p.stroke(this.strokecolour());
    p.strokeWeight(2);
    p.line(this.pixelStartX, this.pixelStartY, this.pixelEndX, this.pixelEndY);
    p.stroke(0);
  }
}
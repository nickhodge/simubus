var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    var Stop = (function () {
        function Stop(_xStart_M, stopping_s, _config, _lane) {
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
        Stop.prototype.near_vehicles = function (v) {
            var that = this;
            var vehicles_near = false;
            v.forEach(function (vi) {
                if (that.near_vehicle(vi)) {
                    vehicles_near = true;
                }
            });
            return vehicles_near;
        };
        Stop.prototype.near_vehicle = function (v) {
            if (this.xStart_M < (v.front_of() + this.config.minimumDistance_M * 4) &&
                this.xStart_M > v.rear_of() - (this.config.minimumDistance_M * 4))
                return true;
            else
                return false;
        };
        Stop.prototype.front_of = function () {
            return (this.xStart_M);
        };
        Stop.prototype.rear_of = function () {
            return (this.xStart_M);
        };
        Stop.prototype.update = function () {
            return false;
        };
        Stop.prototype.draw = function (p) {
            p.stroke(this.strokecolour_rgb);
            p.strokeWeight(3);
            p.line(this.pixelStartX, this.pixelStartY, this.pixelEndX, this.pixelEndY);
            p.stroke(0);
        };
        return Stop;
    }());
    exports.Stop = Stop;
    var BusStop = (function (_super) {
        __extends(BusStop, _super);
        function BusStop(_xStart_M, stopping_s, _config, _lane) {
            var _this = _super.call(this, _xStart_M, stopping_s, _config, _lane) || this;
            _this.strokecolour_rgb = "#00f";
            _this.trafficStop_Trigger_S = stopping_s;
            return _this;
        }
        BusStop.prototype.update = function () {
            return false;
        };
        return BusStop;
    }(Stop));
    exports.BusStop = BusStop;
    var TrafficStop = (function (_super) {
        __extends(TrafficStop, _super);
        function TrafficStop(_initial_sync_pause, _go_timing_S, _stop_timing_S, _xStart_M, _config, _lane) {
            var _this = _super.call(this, _xStart_M, 0, _config, _lane) || this;
            _this.strokecolour_rgb = "#f00";
            _this.stopping = true;
            _this.stop_timing_S = _stop_timing_S;
            _this.go_timing_S = _go_timing_S;
            _this.trafficStop_Trigger_S = _initial_sync_pause;
            return _this;
        }
        TrafficStop.prototype.update = function () {
            this.trafficStop_Trigger_S -= (this.config.simFrameRate_Ps);
            var stateChange = false;
            if (this.trafficStop_Trigger_S <= 0) {
                if (this.stopping) {
                    this.stopping = false;
                    this.trafficStop_Trigger_S = this.go_timing_S;
                    this.strokecolour_rgb = "#0f0";
                    stateChange = true;
                }
                else {
                    this.stopping = true;
                    this.trafficStop_Trigger_S = this.stop_timing_S;
                    this.strokecolour_rgb = "#f00";
                    stateChange = true;
                }
            }
            return stateChange;
        };
        return TrafficStop;
    }(Stop));
    exports.TrafficStop = TrafficStop;
});
//# sourceMappingURL=stops.js.map
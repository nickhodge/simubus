var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    var AbstractStop = (function () {
        function AbstractStop(_xStart_M, _yStart_M, _yEnd_M, stopping_s, _config) {
            this.config = _config;
            this.xStart_M = _xStart_M;
            this.yStart_M = _yStart_M;
            this.pixelStartX = this.xStart_M * this.config.simScale_PpM;
            this.pixelStartY = _yStart_M * this.config.simScale_PpM;
            this.pixelEndX = this.xStart_M * this.config.simScale_PpM;
            this.pixelEndY = _yEnd_M * this.config.simScale_PpM;
        }
        AbstractStop.prototype.update = function () {
        };
        AbstractStop.prototype.draw = function (p) {
            p.stroke(this.strokecolour_rgb);
            p.strokeWeight(3);
            p.line(this.pixelStartX, this.pixelStartY, this.pixelEndX, this.pixelEndY);
            p.stroke(0);
        };
        return AbstractStop;
    }());
    exports.AbstractStop = AbstractStop;
    var BusStop = (function (_super) {
        __extends(BusStop, _super);
        function BusStop(_xStart_M, _yStart_M, _yEnd_M, stopping_s, _config) {
            var _this = _super.call(this, _xStart_M, _yStart_M, _yEnd_M, stopping_s, _config) || this;
            _this.strokecolour_rgb = "#00f";
            _this.stop_timing_S = 10;
            return _this;
        }
        BusStop.prototype.update = function () {
        };
        return BusStop;
    }(AbstractStop));
    exports.BusStop = BusStop;
    var TrafficStop = (function (_super) {
        __extends(TrafficStop, _super);
        function TrafficStop(_initial_sync_pause, _go_timing_S, _stop_timing_S, _xStart_M, _yStart_M, _yEnd_M, stopping_s, _config) {
            var _this = _super.call(this, _xStart_M, _yStart_M, _yEnd_M, stopping_s, _config) || this;
            _this.strokecolour_rgb = "#f00";
            _this.stopping = true;
            _this.stop_timing_S = _stop_timing_S;
            _this.go_timing_S = _go_timing_S;
            _this.trafficStop_Trigger = _initial_sync_pause;
            return _this;
        }
        TrafficStop.prototype.update = function () {
            this.trafficStop_Trigger -= (this.config.simFrameRate_Ps);
            if (this.trafficStop_Trigger <= 0) {
                if (this.stopping) {
                    this.stopping = false;
                    this.trafficStop_Trigger = this.go_timing_S;
                    this.strokecolour_rgb = "#0f0";
                }
                else {
                    this.stopping = true;
                    this.trafficStop_Trigger = this.stop_timing_S;
                    this.strokecolour_rgb = "#f00";
                }
            }
        };
        return TrafficStop;
    }(AbstractStop));
    exports.TrafficStop = TrafficStop;
});
//# sourceMappingURL=stops.js.map
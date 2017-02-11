define(["require", "exports"], function (require, exports) {
    "use strict";
    var BusStop = (function () {
        function BusStop(_xStart_M, _yStart_M, _yEnd_M, stopping_s, _config) {
            this.config = _config;
            this.xStart_M = _xStart_M;
            this.yStart_M = _yStart_M;
            this.pixelStartX = this.xStart_M * this.config.simScale_PpM;
            this.pixelStartY = _yStart_M * this.config.simScale_PpM;
            this.pixelEndX = this.xStart_M * this.config.simScale_PpM;
            this.pixelEndY = _yEnd_M * this.config.simScale_PpM;
        }
        BusStop.prototype.draw = function (p) {
            p.stroke("#00f");
            p.strokeWeight(2);
            p.line(this.pixelStartX, this.pixelStartY, this.pixelEndX, this.pixelEndY);
            p.stroke(0);
        };
        return BusStop;
    }());
    exports.BusStop = BusStop;
    var TrafficStop = (function () {
        function TrafficStop(_xStart_M, _yStart_M, _yEnd_M, stopping_s, _config) {
            this.config = _config;
            this.stopping = true;
            this.xStart_M = _xStart_M;
            this.yStart_M = _yStart_M;
            this.pixelStartX = this.xStart_M * this.config.simScale_PpM;
            this.pixelStartY = _yStart_M * this.config.simScale_PpM;
            this.pixelEndX = this.xStart_M * this.config.simScale_PpM;
            this.pixelEndY = _yEnd_M * this.config.simScale_PpM;
        }
        TrafficStop.prototype.strokecolour = function () {
            if (this.stopping)
                return "#f00";
            else
                return "#0f0";
        };
        TrafficStop.prototype.draw = function (p) {
            p.stroke(this.strokecolour());
            p.strokeWeight(2);
            p.line(this.pixelStartX, this.pixelStartY, this.pixelEndX, this.pixelEndY);
            p.stroke(0);
        };
        return TrafficStop;
    }());
    exports.TrafficStop = TrafficStop;
});
//# sourceMappingURL=stops.js.map
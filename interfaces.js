define(["require", "exports"], function (require, exports) {
    "use strict";
    var VehicleMovementState;
    (function (VehicleMovementState) {
        VehicleMovementState[VehicleMovementState["accelerating"] = 0] = "accelerating";
        VehicleMovementState[VehicleMovementState["decelerating"] = 1] = "decelerating";
        VehicleMovementState[VehicleMovementState["cruising"] = 2] = "cruising";
        VehicleMovementState[VehicleMovementState["stoppping"] = 3] = "stoppping";
        VehicleMovementState[VehicleMovementState["stopped"] = 4] = "stopped";
        VehicleMovementState[VehicleMovementState["waiting"] = 5] = "waiting";
    })(VehicleMovementState = exports.VehicleMovementState || (exports.VehicleMovementState = {}));
    var VehicleMovementIntent;
    (function (VehicleMovementIntent) {
        VehicleMovementIntent[VehicleMovementIntent["mergingright"] = 0] = "mergingright";
        VehicleMovementIntent[VehicleMovementIntent["mergingleft"] = 1] = "mergingleft";
    })(VehicleMovementIntent = exports.VehicleMovementIntent || (exports.VehicleMovementIntent = {}));
});
//# sourceMappingURL=interfaces.js.map
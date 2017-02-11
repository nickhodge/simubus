define(["require", "exports"], function (require, exports) {
    "use strict";
    var VehicleMovementState;
    (function (VehicleMovementState) {
        VehicleMovementState[VehicleMovementState["accelerating"] = 0] = "accelerating";
        VehicleMovementState[VehicleMovementState["decelerating"] = 1] = "decelerating";
        VehicleMovementState[VehicleMovementState["cruising"] = 2] = "cruising";
        VehicleMovementState[VehicleMovementState["stopped"] = 3] = "stopped";
    })(VehicleMovementState = exports.VehicleMovementState || (exports.VehicleMovementState = {}));
    var VehicleMovementIntent;
    (function (VehicleMovementIntent) {
        VehicleMovementIntent[VehicleMovementIntent["normal"] = 0] = "normal";
        VehicleMovementIntent[VehicleMovementIntent["stopping"] = 1] = "stopping";
        VehicleMovementIntent[VehicleMovementIntent["mergingright"] = 2] = "mergingright";
        VehicleMovementIntent[VehicleMovementIntent["mergingleft"] = 3] = "mergingleft";
    })(VehicleMovementIntent = exports.VehicleMovementIntent || (exports.VehicleMovementIntent = {}));
});
//# sourceMappingURL=interfaces.js.map
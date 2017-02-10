# simubus : Simulate Bus Traffic

A visual simulator for Buses in a multi-lane traffic flow.

## Source data & assumptions

- Traffic flow: Westbound on Military Road ([from RMS Data](http://www.rms.nsw.gov.au/about/corporate-publications/statistics/traffic-volumes/aadt-map/index.html#/?z=14&lat=-33.83227592801272&lon=151.25472343847647&id=21029))

    (2600 per hour on weekdays, peak, 7am to 10am)

- Vehicle Stopping Distance/Reaction Times

    [From Upenn Data](http://nacto.org/docs/usdg/vehicle_stopping_distance_and_time_upenn.pdf)

- Bus speed, acceleration, deceleration: 

    


## The code 

[TypeScript](https://www.typescriptlang.org/) 2.1.x (with [typescript-collections]https://github.com/basarat/typescript-collections))

Browserified manually with [require.js](http://requirejs.org/)

[Visual display using p5](https://p5js.org/download/)

Databinding with [KnockoutJS](http://knockoutjs.com/)
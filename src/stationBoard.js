const d = require('../data/direction.js');

class StationBoard {
    schedules;
    direction;

    constructor(schedules, direction) {
        this.schedules = schedules;

        if(direction === d.ARRIVALS || direction === d.DEPARTURES){
            this.direction = direction;
        } else {
            throw new Error('Invalid direction specified');
        }
    }
}

module.exports = StationBoard;
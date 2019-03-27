const d = require('../data/direction.js');

class StationBoard {
    // schedules;
    // direction;

    // board;

    constructor(schedules, direction, tiploc) {
        this.schedules = schedules;
        this.board = [];
        this.tiploc = tiploc;
        if(direction === d.ARRIVALS || direction === d.DEPARTURES){
            this.direction = direction;
        } else {
            throw new Error('Invalid direction specified');
        }
    }

    createBoard() {
        this.schedules.forEach((schedule, i) => {
            this.board.push({});

            this.getJourneyOperator(schedule, i);
            this.getJourneyUID(schedule, i);
            this.getJourneyCategory(schedule, i);
            
            if(schedule['location_records'] !== undefined){
                schedule['location_records'].forEach(record => {
                    this.getJourneyPlatform(record, i);
                });
            }
        });

        return this.board;
    }

    getJourneyOperator(schedule, i) {
        const operator = schedule['atoc_code'];

        this.board[i]['operator'] = operator;
    }

    getJourneyUID(schedule, i) {
        const UID = schedule['train_category'];

        this.board[i]['uid'] = UID;
    }

    getJourneyCategory(schedule, i) {
        const category = schedule['train_category'];

        this.board[i]['category'] = category;
    }

    getJourneyPlatform(record, i) {
        const recordTiploc = record['tiploc'];

        if(this.tiploc === recordTiploc){
            this.board[i]['platform'] = record['platform'];
        }

    }

    getJourneyLocation(record, i) {
        const recordType = (this.direction == d.ARRIVALS) ?  'LO' : 'LT';

        if(record['type'] === recordType) {
            const locationKey = (this.direction == d.ARRIVALS) ?  'origin' : 'destination';
            this.board[i][locationKey] = record['location'][0]['name'];
        }
    }
}

module.exports = StationBoard;
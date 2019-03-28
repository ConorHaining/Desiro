const d = require('../data/direction.js');
const helper = require('./helpers.js');

class StationBoard {

    static fromPromise(schedules, direction, tiploc) {
        return new Promise((resolve, reject) => {
            tiploc.then(t => {
                try {
                    resolve(new StationBoard(schedules, direction, t).createBoard());
                } catch (error) {
                    reject({message: 'Station Board Error', status: 500, details: error.message, schedule: error.schedule});
                }
            })
        });
    }

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
            try {
                this.board.push({});

                this.getJourneyOperator(schedule, i);
                this.getJourneyUID(schedule, i);
                this.getJourneyCategory(schedule, i);
                
                if(schedule['location_records'] !== undefined){
                    schedule['location_records'].forEach(record => {
                        this.getJourneyPlatform(record, i);
                        this.getJourneyLocation(record, i);
                        this.getJourneyPublicTime(record, i);
                        this.getJourneyPredictedTime(record, i);
                        this.getJourneyActualTime(record, i);
                        this.getIfJoruneyCancelled(record, i);
                    });
                }
            } catch (error) {
                let err = new Error(`${error.message} | Error for schedule ${schedule['uid']}`);
                err.schedule = schedule;
                throw err;
            }
        });

        return this.board;
    }

    getJourneyOperator(schedule, i) {
        const operator = schedule['atoc_code'];

        this.board[i]['operator'] = operator;
    }

    getJourneyUID(schedule, i) {
        const UID = schedule['uid'];

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
            this.board[i][locationKey] = helper.toProperCase(record['location'][0]['name']);
        }
    }

    getJourneyPublicTime(record, i) {
        const publicTimeKey = (this.direction == d.ARRIVALS) ?  'public_arrival' : 'public_departure';
        const recordTiploc = record['tiploc'];

        if(this.tiploc === recordTiploc) {
            this.board[i][publicTimeKey] = record[publicTimeKey];
        }
    }

    getJourneyPredictedTime(record, i) {
        const predictedTimeKey = (this.direction == d.ARRIVALS) ?  'predicted_arrival' : 'predicted_departure';
        const recordTiploc = record['tiploc'];

        if(this.tiploc === recordTiploc && record[predictedTimeKey] !== undefined) {
            this.board[i][predictedTimeKey] = record[predictedTimeKey];
        }
    }

    getJourneyActualTime(record, i) {
        const actualTimeKey = (this.direction == d.ARRIVALS) ?  'actual_arrival' : 'actual_departure';
        const recordTiploc = record['tiploc'];

        if(this.tiploc === recordTiploc && record[actualTimeKey] !== undefined) {
            this.board[i][actualTimeKey] = record[actualTimeKey];
        }
    }

    getIfJoruneyCancelled(record, i) {
        if(record['MVTCancel'] !== undefined) {
            this.board[i]['cancelled'] = true;
            this.board[i]['cancelCode'] = record['MVTCancel']['canx_reason_code'];
        }

    }
}

module.exports = StationBoard;
const d = require('../data/direction.js');
const helper = require('./helpers.js');
const { DateTime } = require('luxon');

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
                let tiplocList = this.reconstructFullJourney(schedule);
                this.board.push({});

                this.getJourneyOperator(schedule, i);
                this.getJourneyUID(schedule, i);
                this.getJourneyCategory(schedule, i);
                
                if(schedule['location_records'] !== undefined) {
                    schedule['location_records'].forEach(record => {
                        this.getJourneyPlatform(record, i);
                        this.getJourneyPublicTime(record, i);
                        this.getJourneyPredictedTime(record, i);
                        this.getJourneyActualTime(record, i);
                        this.getIfJoruneyCancelled(record, i);
                    });
                }

                this.getJourneyLocation(tiplocList, i);

            } catch (error) {
                let err = new Error(`${error.message} | Error for schedule ${schedule['uid']}`);
                err.schedule = schedule;
                throw err;
            }
        });

        return this.board;
    }

    reconstructFullJourney(schedule) {
        let journeys = [];
        if(schedule['associations'] !== undefined && schedule['location_records'] !== undefined) {
            let actvityPoint = {};
            for (let i = 0; i < schedule['associations'].length; i++) {
                const association = schedule['associations'][i];
                journeys.push(association['location_records']);
                for (let j = 0; j < association['location_records'].length; j++) {
                    const assocRecord = association['location_records'][j];
                    
                    for (let k = 0; k < schedule['location_records'].length; k++) {
                        const record = schedule['location_records'][k];
                        if (record['tiploc'] == assocRecord['tiploc']) {
                            actvityPoint = record;
                        }
                    }
                }
            }

            journeys = journeys.map(journey => {
                let index = journey.findIndex(record => {
                    return record['tiploc'] == actvityPoint['tiploc'];
                });

                if (index === 0) { // A Splitter
                    let otherIndex = schedule['location_records'].findIndex(record => {
                        return record['tiploc'] == actvityPoint['tiploc'];
                    });
                    let missingRecords = schedule['location_records'].slice(0, otherIndex);
                    missingRecords.forEach(record => journey.unshift(record));
                } else { // A Joiner
                    // let otherIndex = schedule['location_records'].findIndex(record => {
                    //     return record['tiploc'] == actvityPoint['tiploc'];
                    // });
                    // let missingRecords = schedule['location_records'].slice(0, otherIndex);
                    // journey.unshift(missingRecords);
                }

                return journey;
            });
            
        }
        journeys.push(schedule['location_records']);
        return journeys;
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

        if(this.tiploc.includes(recordTiploc)){
            this.board[i]['platform'] = record['platform'];
        }

    }

    getJourneyLocation(tiplocList, i) {
        const boardKey = (this.direction == d.ARRIVALS) ?  'origin' : 'destination';
        this.board[i][boardKey] = [];
        tiplocList.forEach((journey, j) => {
            if(journey !== undefined) {
                const tiplocs = journey.map(record => {return record['tiploc']});
                if(tiplocs.includes(this.tiploc)) {
                    let locationRecord;
                    if (this.direction == d.ARRIVALS) {
                        locationRecord = journey.shift();
                    } else {
                        locationRecord = journey.pop();
                    }

                    if (locationRecord['location']) {
                        this.board[i][boardKey].push(locationRecord['location'][0]['name']);
                    }
                }
            }
        });

        if (this.board[i][boardKey].length === 1) {
            this.board[i][boardKey] = this.board[i][boardKey][0];
        }
    }

    getJourneyPublicTime(record, i) {
        const publicTimeKey = (this.direction == d.ARRIVALS) ?  'public_arrival' : 'public_departure';
        const recordTiploc = record['tiploc'];

        if(this.tiploc.includes(recordTiploc) && record[publicTimeKey] !== undefined) {
            this.board[i][publicTimeKey] = record[publicTimeKey];
            this.board[i][publicTimeKey] = DateTime.fromFormat(record[publicTimeKey], 'HH:mm:ss')
                                                        .toFormat('HH:mm');
        }
    }

    getJourneyPredictedTime(record, i) {
        const predictedTimeKey = (this.direction == d.ARRIVALS) ?  'predicted_arrival' : 'predicted_departure';
        const recordTiploc = record['tiploc'];

        if(this.tiploc.includes(recordTiploc) && record[predictedTimeKey] !== undefined) {
            this.board[i][predictedTimeKey] = record[predictedTimeKey];
        }
    }

    getJourneyActualTime(record, i) {
        const actualTimeKey = (this.direction == d.ARRIVALS) ?  'MVTARRIVAL' : 'MVTDEPARTURE';
        const actualTimeBoardKey = (this.direction == d.ARRIVALS) ?  'actual_arrival' : 'actual_departure';
        const recordTiploc = record['tiploc'];

        if(this.tiploc.includes(recordTiploc) && record[actualTimeKey] !== undefined) {
            if(record[actualTimeKey]['actual_timestamp'] !== undefined) {
                this.board[i][actualTimeBoardKey] = DateTime.fromMillis(record[actualTimeKey]['actual_timestamp'])
                                                    .toFormat('HH:mm');
            }
        }
    }

    getIfJoruneyCancelled(record, i) {
        if(record['MVTCancel'] !== undefined) {
            this.board[i]['cancelled'] = true;
            this.board[i]['cancelCode'] = record['MVTCancel']['cancel_reason_code'];
        }

    }
}

module.exports = StationBoard;
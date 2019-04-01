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
                this.board.push({});
                let activityPoint = this.getActivtyPoint(schedule);
                let tiplocList = this.reconstructFullJourney(schedule, activityPoint);
                
                this.getJourneyLocation(tiplocList, activityPoint, i);

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


            } catch (error) {
                let err = new Error(`${error.message} | Error for schedule ${schedule['uid']}`);
                err.schedule = schedule;
                throw err;
            }
        });

        return this.board;
    }

    getActivtyPoint(schedule) {
        let activityPoint = {};
        if (schedule['associations'] !== undefined && schedule['location_records'] !== undefined) {
            for (let i = 0; i < schedule['associations'].length; i++) {
                const association = schedule['associations'][i];
                for (let j = 0; j < association['location_records'].length; j++) {
                    const assocRecord = association['location_records'][j];
                    
                    for (let k = 0; k < schedule['location_records'].length; k++) {
                        const record = schedule['location_records'][k];
                        if (record['tiploc'] == assocRecord['tiploc']) {
                            activityPoint = record;
                        }
                    }
                }
            }
        }

        return activityPoint;
    }
    reconstructFullJourney(schedule, activityPoint) {
        let journeys = [];
        if(schedule['associations'] !== undefined && schedule['location_records'] !== undefined) {
            journeys = schedule['associations'].map(assoc => {
                return assoc['location_records'];
            });

            journeys = journeys.map(journey => {
                let index = journey.findIndex(record => {
                    return record['tiploc'] == activityPoint['tiploc'];
                });

                if (index === 0) { // A Splitter
                    let otherIndex = schedule['location_records'].findIndex(record => {
                        return record['tiploc'] == activityPoint['tiploc'];
                    });
                    let missingRecords = schedule['location_records'].slice(0, otherIndex).reverse();
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

    getJourneyLocation(tiplocList, activityPoint, i) {
        const boardKey = (this.direction == d.ARRIVALS) ?  'origin' : 'destination';
        this.board[i][boardKey] = [];

        for (let j = 0; j < tiplocList.length; j++) {
            const journey = tiplocList[j];
            
            if(journey !== undefined) {
                const tiplocs = journey.map(record => {return record['tiploc']});
                const intersection = this.tiploc.filter(value => -1 !== tiplocs.indexOf(value));
                if(intersection.length > 0) {
                    let locationRecord;
                    if (this.direction == d.ARRIVALS) {
                        locationRecord = journey.shift();
                    } else {
                        locationRecord = journey.pop();
                    }

                    if (locationRecord['location']) {
                        this.board[i][boardKey].push(helper.toProperCase(locationRecord['location'][0]['name']));
                    }

                    if (intersection.includes(activityPoint['tiploc'])){
                        break;
                    }
                }
            }
        }

        if (this.board[i][boardKey].length === 1) {
            this.board[i][boardKey] = this.board[i][boardKey][0];
        }
    }

    getJourneyPublicTime(record, i) {
        const publicTimeKey = (this.direction == d.ARRIVALS) ?  'public_arrival' : 'public_departure';
        const recordTiploc = record['tiploc'];

        if(this.tiploc.includes(recordTiploc) && record[publicTimeKey] !== undefined && record[publicTimeKey] !== null) {
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
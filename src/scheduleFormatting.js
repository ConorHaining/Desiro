const Direction = require('../data/direction.js');
const { DateTime } = require('luxon');
const helpers = require('./helpers.js');

module.exports = {
    filterValidRunningDaysFromSchedules: (schedules, when) => {
        return new Promise((resolve, reject) => {
            let validSchedules = [];
            try {
                validSchedules = schedules.filter(element => module.exports.filterValidRunningDays(element, when));
            } catch (error) {
                reject({'message': 'Valid Schedule Filter', 'status': 500, 'details': error.message});
            }
            resolve(validSchedules);
        });
    },
    
    filterValidRunningDays: (schedule, when) => {
        let runningDayIndex = when.weekday - 1;
        if(runningDayIndex < 0){
            runningDayIndex = 6;
        }

        const runningDays = schedule['running_days'];
        return runningDays.charAt(runningDayIndex) === '1';
    },
    
    
    filterValidSTPIndicatorsFromSchedules: (schedules) => {
        let groupedSchedules = {};

        schedules.forEach(schedule => {
            const uid = schedule['uid'];
            if(groupedSchedules[uid]){
                groupedSchedules[uid].push(schedule); 
            } else {
                groupedSchedules[uid] = [schedule]; 
            }
        });

        return new Promise((resolve, reject) => {
            let validSchedules = [];
            validSchedules = Object.values(groupedSchedules)
                .map(element => module.exports.filterValidSTPIndicators(element));
            
            resolve(validSchedules);
        });
    },
    
    filterValidSTPIndicators: (schedules) => {
      
        let validSchedule = schedules[0];

        for (let i = 0; i < schedules.length; i++) {
            const schedule = schedules[i];
            const scheduleSTP = schedule['stp_indicator'];
            const validScheduleSTP = validSchedule['stp_indicator'];

            if (
                (scheduleSTP == 'P') ||
                (validScheduleSTP == 'P' && (scheduleSTP == 'O' || scheduleSTP == 'C')) ||
                (validScheduleSTP == 'O' && scheduleSTP == 'C') ||
                (scheduleSTP == 'N') ||
                (validScheduleSTP == 'N' && scheduleSTP == 'C')
            ) {
                validSchedule = schedule;
                schedules.splice(i, 1);
                i = -1; 
                continue;
            }
        }

        return validSchedule;

    },

    filterValidTiplocFromSchedules: (schedules, direction, tiploc) => {
        let field;
        if(direction === Direction.DEPARTURES) {
            field = 'public_departure';
        } else if (direction === Direction.ARRIVALS){
            field = 'public_arrival';
        }
        
        return new Promise((resolve, reject) => {
            Promise.resolve(tiploc).then(tiploc => {
                schedules = schedules.filter(schedule => {
                    const location_records = schedule['location_records'];
                    let found = false;
                    
                    if(location_records !== undefined) {
                        location_records.forEach(record => {
                            if(tiploc.includes(record['tiploc']) && field in record) {
                                found = true;
                            }
                        });
                    }
                    
                    return found;
                });
                
                resolve(schedules);
            });
        });
    },

    createJourneyBoard: (schedules) => {
        let schedule = schedules[0];
        let board = {
            locations: []
        }
        return new Promise((resolve, reject) => {
            board.locations = schedule['location_records'].map(record => {
                if(record['public_departure'] || record['public_arrival']){
                    let actualDeparture;
                    let actualArrival;
                    if(record['MVTDEPARTURE']) {
                        actualDeparture = (record['MVTDEPARTURE']['actual_timestamp']) ? DateTime.fromMillis(record['MVTDEPARTURE']['actual_timestamp']).toFormat('HH:mm:ss'): null;
                    }
                    if(record['MVTARRIVAL']) {
                        actualArrival = (record['MVTARRIVAL']['actual_timestamp']) ? DateTime.fromMillis(record['MVTARRIVAL']['actual_timestamp']).toFormat('HH:mm:ss'): null;
                    }
                    if(record['MVTCancel']) {
                        console.log(record['MVTCancel']);
                        board['cancelled'] = true;
                        board['cancelCode'] = record['MVTCancel']['cancel_reason_code'];
                        board['cancelledAt'] = record['MVTCancel']['location_stanox'];
                    }

                    return {
                        platform: record['platform'],
                        publicDeparture: record['public_departure'],
                        publicArrival: record['public_arrival'],
                        actualDeparture: actualDeparture,
                        actualArrival: actualArrival,
                        predictedDeparture: record['predicted_departure'],
                        predictedArrival: record['predicted_arrival'],
                        station: {
                            name: helpers.toProperCase(record['location'][0]['name']),
                            crs: record['location'][0]['crs']
                        }
                    }

                }
            }).filter(x => x != null);
            board['operator'] = schedule['atoc_code'];
            board['uid'] = schedule['uid'];
            board['category'] = schedule['train_category'];
            resolve(board);
        });
    },
    
}

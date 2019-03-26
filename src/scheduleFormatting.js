const Direction = require('../data/direction.js');
const { DateTime } = require('luxon');

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
                    
                    location_records.forEach(record => {
                        if(record['tiploc'] === tiploc && field in record) {
                            found = true;
                        }
                    });
                    
                    return found;
                });
                
                resolve(schedules);
            });
        });
    },

    createStationBoard: (schedules, direction, crs) => {
        return new Promise((resolve, reject) => {
            let board = schedules.map(schedule => {
                let record = {};
                const association = schedule['associations'];
                record['operator'] = schedule['atoc_code'];
                record['uid'] = schedule['uid'];
                record['category'] = schedule['train_category'];
                const listOfCrs = schedule['location_records'].map(x => {
                    if(x['location'].length === 1) {
                        return x['location'][0]['crs'];
                    }
                });
                
                schedule['location_records'].forEach(item => {
                    if(item['MVTCancel']){
                        record['cancelled'] = true;
                    }

                    try {
                        if(item['location'].length === 1) {
                            if (item['location'][0]['crs'] == crs){
                                let last = schedule['location_records'].pop()['location'][0];
                                let first = schedule['location_records'].shift()['location'][0]
                                console.log(last);
                                console.log(first);
                                record['platform'] = item['platform'];
                                if (direction == Direction.DEPARTURES && item['MVTDEPARTURE'] === undefined) {
                                    record['public_departure'] = item['public_departure'];
                                    record['destination'] = module.exports.toProperCase(last['name']);
                                } else if (direction == Direction.DEPARTURES && item['MVTDEPARTURE'] !== undefined) {
                                    record['public_departure'] = item['public_departure'];
                                    record['destination'] = module.exports.toProperCase(last['name']);
    
                                    if(item['MVTDEPARTURE']['actual_timestamp'] !== undefined){
                                        record['actual_departure'] = DateTime.fromMillis(item['MVTDEPARTURE']['actual_timestamp']).toFormat('HH:mm');
                                    } else {
                                        record['predicted_departure'] = item['predicted_departure'];
                                    }
                                } else if (direction == Direction.ARRIVALS && item['MVTARRIVAL'] === undefined) {
                                    record['public_arrival'] = item['public_arrival'];
                                    record['origin'] = module.exports.toProperCase(first['name']);
                                } else if (direction == Direction.ARRIVALS && item['MVTARRIVAL'] !== undefined) {
                                    record['public_arrival'] = item['public_arrival'];
                                    record['origin'] = module.exports.toProperCase(first['name']);
                                    
                                    if(item['MVTARRIVAL']['actual_timestamp'] !== undefined){
                                        record['actual_arrival'] = DateTime.fromMillis(item['MVTARRIVAL']['actual_timestamp']).toFormat('HH:mm');
                                    } else {
                                        record['predicted_arrival'] = item['predicted_arrival'];
                                    }
                                }
                            }
                        }
                                if(association !== undefined) {
                                    console.info(`UID ${schedule['uid']} | Association`)
                                    let found = false;
                                    const assocLocation = association['location_records'];
                                    listOfAssocCrs = assocLocation.map(x => {
                                        if(x['location'].length === 1) {
                                            return x['location'][0]['crs'];
                                        }
                                    });
                                    const split = listOfCrs.filter(value => (listOfAssocCrs.includes(value) && value !== null))[0];
        
                                    if(direction === Direction.DEPARTURES) {
                                       if(listOfCrs.includes(crs) && !listOfAssocCrs.includes(crs)) {
                                           console.log(listOfCrs.includes(crs) && !listOfAssocCrs.includes(crs))
                                           found = true;
                                       }
                                       if(!listOfCrs.includes(crs) && listOfAssocCrs.includes(crs)) {
                                           console.log(!listOfCrs.includes(crs) && listOfAssocCrs.includes(crs))
                                           found = false;
                                       }
        
                                       if(listOfCrs.indexOf(crs) > listOfCrs.indexOf(split)){
                                           found = false;
                                       }
                                       try {
                                           if (found) {
                                               let lastAssoc = assocLocation.pop()['location'][0];
                                               record['destination'] = `${module.exports.toProperCase(last['name'])} & ${module.exports.toProperCase(lastAssoc['name'])}`
                                           }
                                       } catch (error) {
                                           reject({'message': 'Station Board Error', 'status': 500, 'details': error.message, 'uid': JSON.stringify(schedule)});
                                       }
        
                                    } else if(direction == Direction.ARRIVALS){
        
                                        try {
                                            if (found) {
                                                let firstAssoc = assocLocation.shift()['location'][0];
                                                record['origin'] = `${module.exports.toProperCase(first['name'])} & ${module.exports.toProperCase(firstAssoc['name'])}`
                                            }
                                        } catch (error) {
                                            reject({'message': 'Station Board Error', 'status': 500, 'details': error.message, 'uid': JSON.stringify(schedule)});
                                        }
                                    }
                                    
                                }
                    } catch (error) {
                        reject({'message': 'Station Board Error', 'status': 500, 'details': error.message, 'e': error});
                    }
    
                }); 

                return record;

    
            });
    
            resolve(board);
    
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

                    return {
                        platform: record['platform'],
                        publicDeparture: record['public_departure'],
                        publicArrival: record['public_arrival'],
                        actualDeparture: actualDeparture,
                        actualArrival: actualArrival,
                        predictedDeparture: record['predicted_departure'],
                        predictedArrival: record['predicted_arrival'],
                        station: {
                            name: module.exports.toProperCase(record['location'][0]['name']),
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
    
    /**
     * Helpers
     */

    toProperCase: (string) => {
        return string.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }
}

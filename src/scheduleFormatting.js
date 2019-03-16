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

    createStationBoard: (schedules, direction, crs) => {
        return new Promise((resolve, reject) => {
            let board = schedules.map(schedule => {
                let record = {};
                const association = schedule['associations'];
                record['operator'] = schedule['atoc_code'];
                record['uid'] = schedule['uid'];
                record['category'] = schedule['train_category'];

                listOfCrs = schedule['location_records'].map((x) => {return x['location'][0]['crs']});
                
                schedule['location_records'].forEach(item => {

                    if(item['MVTCancel']){
                        record['cancelled'] = true;
                    }

                    if (item['location'][0]['crs'] == crs){
                        let last = schedule['location_records'].pop()['location'][0];
                        let first = schedule['location_records'].shift()['location'][0]
                        record['platform'] = item['platform'];
                        try {
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
                        } catch (error) {
                            reject({'message': 'Station Board Error', 'status': 500, 'details': error.message, 'uid': JSON.stringify(schedule)});
                        }
                        if(association !== undefined) {
                            console.info(`UID ${schedule['uid']} | Association`)
                            let found = false;
                            const assocLocation = association['location_records'];
                            listOfAssocCrs = assocLocation.map((x) => {return x['location'][0]['crs']});
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
        console.log(schedule);
        return new Promise((resolve, reject) => {
            board.locations = schedule['location_records'].map(record => {
                if(record['public_departure'] || record['public_arrival']){
                    return {
                        public_departure: record['public_departure'],
                        public_arrival: record['public_arrival'],
                        actual_departure: (record['MVTDEPARTURE']) ? record['MVTDEPARTURE']['actual_timestamp']: null,
                        actual_arrival: (record['MVTARRIVAL']) ? record['MVTARRIVAL']['actual_timestamp']: null,
                        predicted_departure: record['predicted_departure'],
                        predicted_arrival: record['predicted_arrival'],
                        name: module.exports.toProperCase(record['location'][0]['name'])
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

const Direction = require('../data/direction.js');

module.exports = {
    filterValidRunningDaysFromSchedules: (schedules) => {
        return new Promise((resolve, reject) => {
            let validSchedules = [];
            try {
                validSchedules = schedules.filter(element => module.exports.filterValidRunningDays(element));
            } catch (error) {
                reject({'message': 'Valid Schedule Filter', 'status': 500, 'details': error.message});
            }
            resolve(validSchedules);
        });
    },
    
    filterValidRunningDays: (schedule) => {
        const today = new Date();
        let runningDayIndex = today.getDay() - 1;
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
      
        let validSchedule = {
            'stp_indicator': undefined
        };

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
                record['operator'] = schedule['atoc_code'];
                record['uid'] = schedule['uid'];
                record['category'] = schedule['train_category'];
                
                schedule['location_records'].forEach(item => {
                   if (item['location'][0]['crs'] == crs){
                        let last = schedule['location_records'].pop()['location'][0];
                        record['platform'] = item['platform'];
                        if (direction == Direction.DEPARTURES && item['DEPARTURE'] === undefined) {
                            record['public_departure'] = item['public_departure'].substring(0, 5);
                            record['destination'] = module.exports.toProperCase(last['name']);
                            
                        } else if (direction == Direction.DEPARTURES && item['DEPARTURE'] !== undefined) {
                            record['public_departure'] = item['public_departure'].substring(0, 5);
                            record['destination'] = module.exports.toProperCase(last['name']);
                            record['predicted_departure'] = item['DEPARTURE']['predicted_departure'].substring(0, 5);
                            
                        } else if (direction == Direction.ARRIVALS && item['ARRIVAL'] === undefined) {
                            record['public_arrival'] = item['public_arrival'].substring(0, 5);
                            record['origin'] = module.exports.toProperCase(last['name']);
    
                        } else if (direction == Direction.ARRIVALS && item['ARRIVAL'] !== undefined) {
                            record['public_arrival'] = item['public_arrival'].substring(0, 5);
                            record['origin'] = module.exports.toProperCase(last['name']);
                            record['predicted_arrival'] = item['ARRIVAL']['predicted_arrival'].substring(0, 5);
    
                        }
    
                   }
                });

                return record;
    
            });
    
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

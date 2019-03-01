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

        let board = schedules.map(schedule => {

            let record = {};
            record['operator'] = schedule['atoc_code'];

            schedule['location_records'].forEach(item => {
               if (item['location']['crs'] == crs){
                    let last = schedule['location_records'].pop();
                    record['platform'] = item['platform'];

                    if (direction == Direction.DEPARTURES && item['DEPARTURE'] === undefined) {
                        record['public_departure'] = item['public_departure'];
                        record['destination'] = last['location']['name'];

                    } else if (direction == Direction.DEPARTURES && item['DEPARTURE'] !== undefined) {
                        record['public_departure'] = item['public_departure'];
                        record['destination'] = last['location']['name'];
                        record['predicted_departure'] = item['predicted_departure'];

                    } else if (direction == Direction.ARRIVALS && item['ARRIVAL'] === undefined) {
                        record['public_arrival'] = item['public_arrival'];
                        record['destination'] = last['location']['name'];

                    } else if (direction == Direction.ARRIVALS && item['ARRIVAL'] !== undefined) {
                        record['public_arrival'] = item['public_arrival'];
                        record['destination'] = last['location']['name'];
                        record['predicted_arrival'] = item['predicted_arrival'];

                    }

               }
            });

            return record;

        });

        return board;

    },

    /**
     * Helpers
     */
}
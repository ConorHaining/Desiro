var { DateTime } = require('luxon');

module.exports = {
    performHeuristicsFromSchedules: (schedules) => {

        return new Promise((resolve, reject) => {
            let newSchedules;
            try {
                newSchedules = schedules.map(schedule => module.exports.performHeuristics(schedule));
            } catch (error) {
                reject({'message': 'Heuristics Error', 'status': 500, 'details': error.message});
            }
            resolve(newSchedules);
        });

    },

    performHeuristics: (schedule) => {
        let locationRecords = schedule['location_records'];
        let previousTimetableVariationArrival = undefined;
        let previousTimetableVariationDeparture = undefined;

        locationRecords = locationRecords.map(record => {
            
            let timetableVariationArrival = (record['MVTARRIVAL'] == undefined) ?  undefined : record['MVTARRIVAL']['timetable_variation'];
            let timetableVariationDeparture = (record['MVTDEPARTURE'] == undefined) ?  undefined : record['MVTDEPARTURE']['timetable_variation'];

            // console.log(`Arrival: ${timetableVariationArrival} | Prediction ${}`);
            // console.log(`Departure: ${} | Prediction ${}`);

            if (timetableVariationDeparture === undefined && previousTimetableVariationDeparture !== undefined){
                record['MVTDEPARTURE'] = {'timetable_variation_prediction': previousTimetableVariationDeparture};
            } else {
                previousTimetableVariationDeparture = timetableVariationDeparture;
            }

            if (timetableVariationArrival === undefined && previousTimetableVariationArrival !== undefined){
                record['MVTARRIVAL'] = {'timetable_variation_prediction': previousTimetableVariationArrival};
            } else {
                previousTimetableVariationArrival = timetableVariationArrival;
            }
            // console.log(JSON.stringify(record));
            return record;
        });

        schedule['location_records'] = locationRecords;
        
        return schedule;
    },

    calculatePredictedTime: (schedule) => {
        let locationRecords = schedule['location_records'];

        locationRecords = locationRecords.map(record => {
            let timetableVariationArrival = record['MVTARRIVAL']['timetable_variation_prediction'];
            let timetableVariationDeparture = record['MVTDEPARTURE']['timetable_variation_prediction'];

            if (timetableVariationArrival !== undefined) {
                let arrivalTime = module.exports.chopUpTime(record['arrival']);
                arrivalTime = DateTime.fromObject(arrivalTime);
                
                let predictedArrival = arrivalTime.plus({minutes: timetableVariationArrival});
                record['MVTARRIVAL']['predicted_arrival'] = predictedArrival.toLocaleString(DateTime.TIME_24_SIMPLE);
            }
            
            if (timetableVariationDeparture !== undefined) {
                let departureTime = module.exports.chopUpTime(record['departure']);
                departureTime = DateTime.fromObject(departureTime);

                let predictedDeparture = departureTime.plus({minutes: Math.max(0, timetableVariationDeparture)});
                record['MVTDEPARTURE']['predicted_departure'] = predictedDeparture.toLocaleString(DateTime.TIME_24_SIMPLE);
            }

            return record;
        });

        return schedule;
    },

    createBasicMovementData: (schedule) => {
        
    },

    /**
     * Helpers
     */
    chopUpTime: (time) => {
        return {
            hour: parseInt(time.substring(0, 2)),
            minute: parseInt(time.substring(3, 5))
        }
    }
}
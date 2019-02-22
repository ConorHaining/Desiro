var { DateTime } = require('luxon');

module.exports = {
    performHeuristics: (schedule) => {
        let locationRecords = schedule['location_records'];
        let previousTimetableVariationArrival = undefined;
        let previousTimetableVariationDeparture = undefined;

        locationRecords = locationRecords.map(record => {
            
            let timetableVariationArrival = (record['ARRIVAL'] == undefined) ?  undefined : record['ARRIVAL']['timetable_variation'];
            let timetableVariationDeparture = (record['DEPARTURE'] == undefined) ?  undefined : record['DEPARTURE']['timetable_variation'];

            // console.log(`Arrival: ${timetableVariationArrival} | Prediction ${}`);
            // console.log(`Departure: ${} | Prediction ${}`);

            if (timetableVariationDeparture === undefined && previousTimetableVariationDeparture !== undefined){
                record['DEPARTURE'] = {'timetable_variation_prediction': previousTimetableVariationDeparture};
            } else {
                previousTimetableVariationDeparture = timetableVariationDeparture;
            }

            if (timetableVariationArrival === undefined && previousTimetableVariationArrival !== undefined){
                record['ARRIVAL'] = {'timetable_variation_prediction': previousTimetableVariationArrival};
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
            let timetableVariationArrival = record['ARRIVAL']['timetable_variation_prediction'];
            let timetableVariationDeparture = record['DEPARTURE']['timetable_variation_prediction'];

            if (timetableVariationArrival !== undefined) {
                let arrivalTime = module.exports.chopUpTime(record['arrival']);
                arrivalTime = DateTime.fromObject(arrivalTime);
                
                let predictedArrival = arrivalTime.plus({minutes: timetableVariationArrival});
                record['ARRIVAL']['predicted_arrival'] = predictedArrival.toLocaleString(DateTime.TIME_24_SIMPLE);
            }
            
            if (timetableVariationDeparture !== undefined) {
                let departureTime = module.exports.chopUpTime(record['departure']);
                departureTime = DateTime.fromObject(departureTime);

                let predictedDeparture = departureTime.plus({minutes: Math.max(0, timetableVariationDeparture)});
                record['DEPARTURE']['predicted_departure'] = predictedDeparture.toLocaleString(DateTime.TIME_24_SIMPLE);
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
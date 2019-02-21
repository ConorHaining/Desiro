module.exports = {
    performHeuristics: (schedule) => {
        let locationRecords = schedule['location_records'];
        let previousTimetableVariationArrival = undefined;
        let previousTimetableVariationDeparture = undefined;

        locationRecords = locationRecords.map(record => {
            
            let timetableVariationArrival = (record['ARRIVAL'] == undefined) ?  undefined : record['ARRIVAL']['timetable_variation'];
            let timetableVariationDeparture = (record['DEPARTURE'] == undefined) ?  undefined : record['ARRIVAL']['timetable_variation'];

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
        return schedule;
    },

    createBasicMovementData: (schedule) => {
        
    }
}
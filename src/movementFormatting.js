module.exports = {
    performHeuristics: (schedule) => {
        let locationRecords = schedule['location_records'];
        let previousVariation = undefined;

        locationRecords = locationRecords.map(record => {
            let timetableVariation = record['timetable_variation'];
            
            if (timetableVariation === undefined && previousVariation !== undefined){
                record['timetable_variation_prediction'] = previousVariation;
            } else {
                previousVariation = timetableVariation;
            }
            
            return record;
        });

        schedule['location_records'] = locationRecords;

        return schedule;
    },

    createBasicMovementData: (schedule) => {
        
    }
}
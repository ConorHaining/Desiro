module.exports = {
    filterValidRunningDaysFromSchedules: (schedules) => {
        return new Promise((resolve, reject) => {
            schedules = schedules.map(schedule => {
                try {
                    if('associations' in schedule) {
                        schedule['associations'] = schedule['associations'].filter(association => module.exports.filterValidRunningDays(association));
                    }
                } catch (error) {
                    reject({'message': 'Association Valid Running Days', status: 500, details: error.message});            
                }
                return schedule;
            });
            resolve(schedules);
        });
    },
    
    filterValidRunningDays: (association) => {
        const today = new Date();
        let runningDayIndex = today.getDay() - 1;
        if(runningDayIndex < 0){
            runningDayIndex = 6;
        }

        const runningDays = association['running_days'];

        return runningDays.charAt(runningDayIndex) === '1';
    },
    
    
    filterValidSTPIndicatorsFromSchedules: (schedules) => {
        return new Promise((resolve, reject) => {
            schedules = schedules.map(schedule => {
                if('associations' in schedule) {
                    schedule['associations'] = module.exports.filterValidSTPIndicators(schedule['associations']);
                }
    
                return schedule;
            });
            resolve(schedules);
        });
    },
    
    filterValidSTPIndicators: (associations) => {
      
        let validAssociation = associations[0];

        for (let i = 0; i < associations.length; i++) {
            const association = associations[i];
            const associationSTP = association['stp_indicator'];
            const validAssociationSTP = validAssociation['stp_indicator'];

            if (
                (associationSTP == 'P') ||
                (validAssociationSTP == 'P' && (associationSTP == 'O' || associationSTP == 'C')) ||
                (validAssociationSTP == 'O' && associationSTP == 'C') ||
                (associationSTP == 'N') ||
                (validAssociationSTP == 'N' && associationSTP == 'C')
            ) {
                validAssociation = association;
                associations.splice(i, 1);
                i = -1; 
                continue;
            }
        }
        
        return validAssociation;

    },

    discardNextAssociations: (association) => {
        let category = association['category'];

        return category === 'JJ' || category === 'VV';
    },

    createStationBoard: (schedules, direction) => {

    },

    /**
     * Helpers
     */
}
module.exports = {
    filterValidRunningDaysFromSchedules: (schedules, when) => {
        return new Promise((resolve, reject) => {
            schedules = schedules.map(schedule => {
                try {
                    if('associations' in schedule) {
                        schedule['associations'] = schedule['associations'].filter(association => module.exports.filterValidRunningDays(association, when));
                    }
                } catch (error) {
                    reject({'message': 'Association Valid Running Days', status: 500, details: error.message});            
                }
                return schedule;
            });
            resolve(schedules);
        });
    },
    
    filterValidRunningDays: (association, when) => {
        let runningDayIndex = when.weekday - 1;
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
      
        let validAssociations = [];
        let groupedAssociations = {};

        associations.forEach(association => {
            const uid = association['assoc_train'];
            if(groupedAssociations[uid]){
                groupedAssociations[uid].push(association); 
            } else {
                groupedAssociations[uid] = [association]; 
            }
        });

        Object.values(groupedAssociations).forEach(group => {
            let validAssociation = group[0];

            for (let i = 0; i < group.length; i++) {
                const association = group[i];
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
                    group.splice(i, 1);
                    i = -1; 
                    continue;
                }
            }

            validAssociations.push(validAssociation);
        });

        return validAssociations;
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
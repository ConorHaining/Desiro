module.exports = {
    filterValidRunningDaysFromSchedules: (schedules) => {

    },
    
    filterValidRunningDays: (association) => {
        const today = new Date();
        let runningDayIndex = today.getDay() - 1;
        if(runningDayIndex < 0){
            runningDayIndex = 6;
        }

        const runningDays = association['assoc_days'];

        return runningDays.charAt(runningDayIndex) === '1';
    },
    
    
    filterValidSTPIndicatorsFromSchedules: (schedules) => {
    
    },
    
    filterValidSTPIndicators: (associations) => {
      
        let validAssociation = {
            'stp_indicator': undefined
        };

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

    discardNextAssociations: (schedules) => {

    },

    createStationBoard: (schedules, direction) => {

    },

    /**
     * Helpers
     */
}
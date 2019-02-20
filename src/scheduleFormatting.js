module.exports = {
    filterValidRunningDaysFromSchedules: (schedules) => {

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

    createStationBoard: (schedules, direction) => {

    },

    /**
     * Helpers
     */
}
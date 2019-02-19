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
        
    },

    createStationBoard: (schedules, direction) => {

    },

    /**
     * Helpers
     */
}
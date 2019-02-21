const expect = require('chai').expect;

describe('Movements', function() {

    describe('Perform heuristics', function() {

        const movementFormatting = require('../src/movementFormatting.js');

        it('should infer an on time schedule', () =>{
            let schedule = {
                'location_records': [
                    {
                        'timetable_variation': 0
                    },
                    {
                        'timetable_variation': 0
                    },
                    {
                        'timetable_variation': 0
                    },
                    { },
                    { }
                ]
            }

            schedule = movementFormatting.performHeuristics(schedule);

            schedule['location_records'].forEach((record) => {
                expect(record).to.have.any.keys('timetable_variation', 'timetable_variation_prediction');
                expect(record['timetable_variation_prediction']).to.satisfy((x) => {
                    return x === undefined || x === 0;
                });
            });

        });

        it('should infer an early schedule', () =>{
            let schedule = {
                'location_records': [
                    {
                        'timetable_variation': 0
                    },
                    {
                        'timetable_variation': 0
                    },
                    {
                        'timetable_variation': -1
                    },
                    { },
                    { }
                ]
            }

            schedule = movementFormatting.performHeuristics(schedule);

            schedule['location_records'].forEach((record) => {
                expect(record).to.have.any.keys('timetable_variation', 'timetable_variation_prediction');
                expect(record['timetable_variation_prediction']).to.satisfy((x) => {
                    return x === undefined || x < 0;
                });
            });
        });

        it('should infer a late schedule', () =>{
            let schedule = {
                'location_records': [
                    {
                        'timetable_variation': 0
                    },
                    {
                        'timetable_variation': 0
                    },
                    {
                        'timetable_variation': 1
                    },
                    { },
                    { }
                ]
            }

            schedule = movementFormatting.performHeuristics(schedule);

            schedule['location_records'].forEach((record) => {
                expect(record).to.have.any.keys('timetable_variation', 'timetable_variation_prediction');
                expect(record['timetable_variation_prediction']).to.satisfy((x) => {
                    return x === undefined || x > 0;
                });
            });
        });

        it('should not infer when there is no movements', () =>{
            let schedule = {
                'location_records': [
                    {},
                    {},
                    {},
                    {},
                    {}
                ]
            }

            schedule = movementFormatting.performHeuristics(schedule);

            schedule['location_records'].forEach((record) => {
                expect(record).to.not.have.any.keys('timetable_variation', 'timetable_variation_prediction');
            });
        });

        it('should not infer once a train has terminated', () =>{
            let schedule = {
                'location_records': [
                    {
                        'timetable_variation': 0
                    },
                    {
                        'timetable_variation': 0
                    },
                    {
                        'timetable_variation': 0
                    },
                    {
                        'timetable_variation': 0
                    },
                    {
                        'timetable_variation': 0
                    }
                ]
            }

            schedule = movementFormatting.performHeuristics(schedule);

            schedule['location_records'].forEach((record) => {
                expect(record).to.have.any.keys('timetable_variation');
                expect(record).to.not.have.any.keys('timetable_variation_prediction');
            });
        });
        
    });

    describe('Basic Details', function() {
        
        it('should only return the most basic fields', () =>{
            expect(true).to.be.false;
        });

    });

});
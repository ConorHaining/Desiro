const expect = require('chai').expect;

describe('Movements', function() {

    describe('Perform heuristics', function() {

        const movementFormatting = require('../src/movementFormatting.js');

        it('should infer an on time schedule', () =>{
            let schedule = {
                'location_records': [
                    {
                        'ARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'DEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'ARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'DEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'ARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'DEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    { },
                    { }
                ]
            };

            schedule = movementFormatting.performHeuristics(schedule);

            
            schedule['location_records'].forEach((record) => {
                
                expect(record['ARRIVAL']).to.satisfy((x) => {
                    return x['timetable_variation'] == 0 || x['timetable_variation_prediction'] == 0;
                });
                
                expect(record['DEPARTURE']).to.satisfy((x) => {
                    return x['timetable_variation'] == 0 || x['timetable_variation_prediction'] == 0;
                });

            });

        });

        it('should infer an early schedule', () =>{
            let schedule = {
                'location_records': [
                    {
                        'ARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'DEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'ARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'DEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'ARRIVAL' : {
                            'timetable_variation': -1
                        },
                        'DEPARTURE' : {
                            'timetable_variation': -1
                        }
                    },
                    { },
                    { }
                ]
            };

            schedule = movementFormatting.performHeuristics(schedule);
            schedule['location_records'].forEach((record) => {
                expect(record['ARRIVAL']).to.satisfy((x) => {
                    return x['timetable_variation'] <= 0 || x['timetable_variation_prediction'] <= 0;
                });
                
                expect(record['DEPARTURE']).to.satisfy((x) => {
                    return x['timetable_variation'] <= 0 || x['timetable_variation_prediction'] <= 0;
                });
            });
            
        });

        it('should infer a late schedule', () =>{
            let schedule = {
                'location_records': [
                    {
                        'ARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'DEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'ARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'DEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'ARRIVAL' : {
                            'timetable_variation': 1
                        },
                        'DEPARTURE' : {
                            'timetable_variation': 1
                        }
                    },
                    { },
                    { }
                ]
            };

            schedule = movementFormatting.performHeuristics(schedule);

            schedule['location_records'].forEach((record) => {
                expect(record['ARRIVAL']).to.satisfy((x) => {
                    return x['timetable_variation'] >= 0 || x['timetable_variation_prediction'] >= 0;
                });
                
                expect(record['DEPARTURE']).to.satisfy((x) => {
                    return x['timetable_variation'] >= 0 || x['timetable_variation_prediction'] >= 0;
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
                expect(record['ARRIVAL']).to.be.undefined;
                expect(record['DEPARTURE']).to.be.undefined;
            });
        });

        it('should not infer once a train has terminated', () =>{
            let schedule = {
                'location_records': [
                    {
                        'ARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'DEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'ARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'DEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'ARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'DEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'ARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'DEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'ARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'DEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                ]
            };

            schedule = movementFormatting.performHeuristics(schedule);

            schedule['location_records'].forEach((record) => {
                expect(record['ARRIVAL']).to.have.any.keys('timetable_variation');
                expect(record['ARRIVAL']).to.not.have.any.keys('timetable_variation_prediction');

                expect(record['DEPARTURE']).to.have.any.keys('timetable_variation');
                expect(record['DEPARTURE']).to.not.have.any.keys('timetable_variation_prediction');
            });
        });
        
    });

    

    describe('Basic Details', function() {
        
        it('should only return the most basic fields', () =>{
            expect(true).to.be.false;
        });

    });

});
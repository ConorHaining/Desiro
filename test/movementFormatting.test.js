const expect = require('chai').expect;

describe('Movements', function() {

    describe('Perform heuristics', function() {

        const movementFormatting = require('../src/movementFormatting.js');

        it('should infer an on time schedule', () =>{
            let schedule = {
                'location_records': [
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTMVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    { },
                    { }
                ]
            };

            schedule = movementFormatting.performHeuristics(schedule);

            
            schedule['location_records'].forEach((record) => {
                
                expect(record['MVTARRIVAL']).to.satisfy((x) => {
                    return x['timetable_variation'] == 0 || x['timetable_variation_prediction'] == 0;
                });
                
                expect(record['MVTDEPARTURE']).to.satisfy((x) => {
                    return x['timetable_variation'] == 0 || x['timetable_variation_prediction'] == 0;
                });

            });

        });

        it('should infer an early schedule', () =>{
            let schedule = {
                'location_records': [
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': -1
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': -1
                        }
                    },
                    { },
                    { }
                ]
            };

            schedule = movementFormatting.performHeuristics(schedule);
            schedule['location_records'].forEach((record) => {
                expect(record['MVTARRIVAL']).to.satisfy((x) => {
                    return x['timetable_variation'] <= 0 || x['timetable_variation_prediction'] <= 0;
                });
                
                expect(record['MVTDEPARTURE']).to.satisfy((x) => {
                    return x['timetable_variation'] <= 0 || x['timetable_variation_prediction'] <= 0;
                });
            });
            
        });

        it('should infer a late schedule', () =>{
            let schedule = {
                'location_records': [
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 1
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 1
                        }
                    },
                    { },
                    { }
                ]
            };

            schedule = movementFormatting.performHeuristics(schedule);

            schedule['location_records'].forEach((record) => {
                expect(record['MVTARRIVAL']).to.satisfy((x) => {
                    return x['timetable_variation'] >= 0 || x['timetable_variation_prediction'] >= 0;
                });
                
                expect(record['MVTDEPARTURE']).to.satisfy((x) => {
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
                expect(record['MVTARRIVAL']).to.be.undefined;
                expect(record['MVTDEPARTURE']).to.be.undefined;
            });
        });

        it('should not infer once a train has terminated', () =>{
            let schedule = {
                'location_records': [
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                ]
            };

            schedule = movementFormatting.performHeuristics(schedule);

            schedule['location_records'].forEach((record) => {
                expect(record['MVTARRIVAL']).to.have.any.keys('timetable_variation');
                expect(record['MVTARRIVAL']).to.not.have.any.keys('timetable_variation_prediction');

                expect(record['MVTDEPARTURE']).to.have.any.keys('timetable_variation');
                expect(record['MVTDEPARTURE']).to.not.have.any.keys('timetable_variation_prediction');
            });
        });
        
    });

    describe('Calculate time', function() {

        const movementFormatting = require('../src/movementFormatting.js');

        it('should calculate the correct time for on-time predictions', () =>{
            let schedule = {
                'location_records': [
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'public_arrival': '12:00',
                        'public_departure': '12:01',
                        'MVTARRIVAL' : {
                            'timetable_variation_prediction': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation_prediction': 0
                        }
                    }
                ]
            };

            schedule = movementFormatting.calculatePredictedTime(schedule);
            schedule['location_records'].forEach((record) => {
                expect(record).to.satisfy((x) => {
                    return (x['MVTARRIVAL']['timetable_variation_prediction'] != undefined && x['predicted_arrival'] == '12:00')
                        || (x['MVTARRIVAL']['timetable_variation'] != undefined);
                });
                
                expect(record).to.satisfy((x) => {
                    return (x['MVTDEPARTURE']['timetable_variation_prediction'] != undefined && x['predicted_departure'] == '12:01')
                        || (x['MVTDEPARTURE']['timetable_variation'] != undefined);
                });
            });
        });

        it('should calculate the correct time for early predictions', () =>{
            let schedule = {
                'location_records': [
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'public_arrival': '12:00',
                        'public_departure': '12:01',
                        'MVTARRIVAL' : {
                            'timetable_variation_prediction': -1
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation_prediction': -1
                        }
                    }
                ]
            };

            schedule = movementFormatting.calculatePredictedTime(schedule);
            schedule['location_records'].forEach((record) => {
                expect(record).to.satisfy((x) => {
                    return (x['MVTARRIVAL']['timetable_variation_prediction'] != undefined && x['predicted_arrival'] == '11:59')
                        || (x['MVTARRIVAL']['timetable_variation'] != undefined);
                });
                
                expect(record).to.satisfy((x) => {
                    return (x['MVTDEPARTURE']['timetable_variation_prediction'] != undefined && x['predicted_departure'] == '12:01')
                        || (x['MVTDEPARTURE']['timetable_variation'] != undefined);
                });
            });
        });

        it('should calculate the correct time for late predictions', () =>{
            let schedule = {
                'location_records': [
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'public_arrival': '12:00',
                        'public_departure': '12:01',
                        'MVTARRIVAL' : {
                            'timetable_variation_prediction': 1
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation_prediction': 1
                        }
                    }
                ]
            };

            schedule = movementFormatting.calculatePredictedTime(schedule);
            schedule['location_records'].forEach((record) => {
                expect(record).to.satisfy((x) => {
                    return (x['MVTARRIVAL']['timetable_variation_prediction'] != undefined && x['predicted_arrival'] == '12:01')
                        || (x['MVTARRIVAL']['timetable_variation'] != undefined);
                });
                
                expect(record).to.satisfy((x) => {
                    return (x['MVTDEPARTURE']['timetable_variation_prediction'] != undefined && x['predicted_departure'] == '12:02')
                        || (x['MVTDEPARTURE']['timetable_variation'] != undefined);
                });
            });
        });

        it('should not calculate anything for no predictions', () =>{
            let schedule = {
                'location_records': [
                    {
                        'public_arrival': '12:00',
                        'public_departure': '12:01',
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'public_arrival': '12:00',
                        'public_departure': '12:01',
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    },
                    {
                        'public_arrival': '12:00',
                        'public_departure': '12:01',
                        'MVTARRIVAL' : {
                            'timetable_variation': 0
                        },
                        'MVTDEPARTURE' : {
                            'timetable_variation': 0
                        }
                    }
                ]
            };

            schedule = movementFormatting.calculatePredictedTime(schedule);
            schedule['location_records'].forEach((record) => {
                expect(record['MVTARRIVAL']).to.satisfy((x) => {
                    return x['predicted_arrival'] === undefined;
                });
                
                expect(record['MVTDEPARTURE']).to.satisfy((x) => {
                    return x['predicted_departure'] === undefined;
                });
            });
        });

    });

    // describe('Basic Details', function() {
        
    //     it('should only return the most basic fields', () =>{
    //         expect(true).to.be.false;
    //     });

    // });

});
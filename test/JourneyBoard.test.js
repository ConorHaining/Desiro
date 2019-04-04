const expect = require('chai').expect;
const direction = require('../data/direction.js');

describe('Journey Board', function() {

    const JourneyBoard = require('../src/JourneyBoard.js');
    
    describe('Location Records', () => {
        it('should contain an array of locations', async () => {
            const schedule = {
                'location_records': [
                    {
                        'public_departure': '12:00:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'ABC',
                                'name': 'STATION 1'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:06:00',
                        'public_departure': '12:07:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'DEF',
                                'name': 'STATION 2'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:09:00',
                        'public_departure': '12:10:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'GHI',
                                'name': 'STATION 3'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:20:00',
                        'platform': '3',
                        'location': [
                            {
                                'crs': 'XYZ',
                                'name': 'STATION 4'
                            }
                        ]
                    },
                ]
            }  

            const board = await JourneyBoard.createBoard(schedule);

            expect(board['locations']).to.be.an('array');
        });

        it('they should contain a platform', async () => {
            const schedule = {
                'location_records': [
                    {
                        'public_departure': '12:00:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'ABC',
                                'name': 'STATION 1'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:06:00',
                        'public_departure': '12:07:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'DEF',
                                'name': 'STATION 2'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:09:00',
                        'public_departure': '12:10:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'GHI',
                                'name': 'STATION 3'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:20:00',
                        'platform': '3',
                        'location': [
                            {
                                'crs': 'XYZ',
                                'name': 'STATION 4'
                            }
                        ]
                    },
                ]
            }  

            const board = await JourneyBoard.createBoard(schedule);

            board['locations'].forEach(item => {
                expect(item).to.have.any.keys('platform');
            });
        });

        it('they should contain a station', async () => {
            const schedule = {
                'location_records': [
                    {
                        'public_departure': '12:00:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'ABC',
                                'name': 'STATION 1'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:06:00',
                        'public_departure': '12:07:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'DEF',
                                'name': 'STATION 2'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:09:00',
                        'public_departure': '12:10:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'GHI',
                                'name': 'STATION 3'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:20:00',
                        'platform': '3',
                        'location': [
                            {
                                'crs': 'XYZ',
                                'name': 'STATION 4'
                            }
                        ]
                    },
                ]
            }  

            const board = await JourneyBoard.createBoard(schedule);

            board['locations'].forEach(item => {
                expect(item).to.have.any.keys('station');
                expect(item.station).to.be.an('object');
            });
        });

        it('should only include records with public arrivals or departures', async () => {
            const schedule = {
                'location_records': [
                    {
                        'public_departure': '12:00:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'ABC',
                                'name': 'STATION 1'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:06:00',
                        'public_departure': '12:07:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'DEF',
                                'name': 'STATION 2'
                            }
                        ]
                    },
                    {
                        'arrival': '12:08:00',
                        'departure': '12:09:00',
                        'platform': '',
                        'location': [
                            {
                                'crs': 'DEF',
                                'name': 'STATION 2'
                            }
                        ]
                    },
                    {
                        'public_departure': '12:10:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'GHI',
                                'name': 'STATION 3'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:20:00',
                        'platform': '3',
                        'location': [
                            {
                                'crs': 'XYZ',
                                'name': 'STATION 4'
                            }
                        ]
                    },
                ]
            } 

            const board = await JourneyBoard.createBoard(schedule);

            expect(board.locations).to.have.lengthOf(4);          
        })
        
        describe('Public Time', () => {
            it('the originating station should have a public departure', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:09:00',
                            'public_departure': '12:10:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ]
                        },
                    ]
                }  
    
                const board = await JourneyBoard.createBoard(schedule);
    
                expect(board.locations[0]).to.have.any.keys('public_departure');
                expect(board.locations[0].public_departure).to.equal('12:00');
            });
            
            it('the intermediate stations should have a public arrival and departure', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:09:00',
                            'public_departure': '12:10:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ]
                        },
                    ]
                }  
    
                const board = await JourneyBoard.createBoard(schedule);
    
                expect(board.locations[1]).to.have.any.keys('public_departure', 'public_arrival');
                expect(board.locations[1].public_arrival).to.equal('12:06');
                expect(board.locations[1].public_departure).to.equal('12:07');

                expect(board.locations[2]).to.have.any.keys('public_departure', 'public_arrival');
                expect(board.locations[2].public_arrival).to.equal('12:09');
                expect(board.locations[2].public_departure).to.equal('12:10');
            });
    
            it('the intermediate stations should have a public arrival when they are drop off only', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:09:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ]
                        },
                    ]
                }  
    
                const board = await JourneyBoard.createBoard(schedule);
    
                expect(board.locations[1]).to.have.any.keys('public_departure', 'public_arrival');
                expect(board.locations[1].public_arrival).to.equal('12:06');
                expect(board.locations[1].public_departure).to.equal('12:07');

                expect(board.locations[2]).to.have.any.keys('public_arrival');
                expect(board.locations[2]).to.not.have.any.keys('public_departure');
                expect(board.locations[2].public_arrival).to.equal('12:09');
            });
    
            it('the intermediate stations should have a public departure when they are pick up only', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ]
                        },
                        {
                            'public_departure': '12:10:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ]
                        },
                    ]
                }  
    
                const board = await JourneyBoard.createBoard(schedule);
    
                expect(board.locations[1]).to.have.any.keys('public_departure', 'public_arrival');
                expect(board.locations[1].public_arrival).to.equal('12:06');
                expect(board.locations[1].public_departure).to.equal('12:07');

                expect(board.locations[2]).to.have.any.keys('public_departure');
                expect(board.locations[2]).to.not.have.any.keys('public_arrival');
                expect(board.locations[2].public_departure).to.equal('12:10');
            });
    
            it('the terminating station should have a public arrival', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:09:00',
                            'public_departure': '12:10:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ]
                        },
                    ]
                }  
    
                const board = await JourneyBoard.createBoard(schedule);
    
                expect(board.locations[3]).to.have.any.keys('public_arrival');
                expect(board.locations[3]).to.not.have.any.keys('public_departure');
                expect(board.locations[3].public_arrival).to.equal('12:20');
            });
        });

        describe('Actual Time', () => {
            it('the originating station should have a actual departure if there is a movement', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ],
                            'MVTDEPARTURE': {
                                'actual_timestamp': 1554202800000
                            }
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:09:00',
                            'public_departure': '12:10:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ]
                        },
                    ]
                } 

                const board = await JourneyBoard.createBoard(schedule);

                expect(board.locations[0]).to.have.any.keys('actual_departure');
                expect(board.locations[0].actual_departure).to.be.equal('12:00');
            });
            
            it('the intermediate stations should have a actual arrival and departure if there is a movement', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ],
                            'MVTDEPARTURE': {
                                'actual_timestamp': 1554202800000
                            }
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ],
                            'MVTDEPARTURE': {
                                'actual_timestamp': 1554203160000
                            },
                            'MVTARRIVAL': {
                                'actual_timestamp': 1554203220000
                            }
                        },
                        {
                            'public_arrival': '12:09:00',
                            'public_departure': '12:10:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ],
                            'MVTDEPARTURE': {
                                'actual_timestamp': 1554203340000
                            },
                            'MVTARRIVAL': {
                                'actual_timestamp': 1554203400000
                            }
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ]
                        },
                    ]
                } 

                const board = await JourneyBoard.createBoard(schedule);

                expect(board.locations[1]).to.have.any.keys('actual_departure', 'actual_arrival');
                expect(board.locations[1].actual_departure).to.be.equal('12:06');
                expect(board.locations[1].actual_arrival).to.be.equal('12:07');

                expect(board.locations[2]).to.have.any.keys('actual_departure', 'actual_arrival');
                expect(board.locations[2].actual_departure).to.be.equal('12:09');
                expect(board.locations[2].actual_arrival).to.be.equal('12:10');
            });
            
            it('the intermediate stations should have a actual arrival when they are drop off only, if there is a movement', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ],
                            'MVTDEPARTURE': {
                                'actual_timestamp': 1554202800000
                            }
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ],
                            'MVTDEPARTURE': {
                                'actual_timestamp': 1554203160000
                            },
                            'MVTARRIVAL': {
                                'actual_timestamp': 1554203220000
                            }
                        },
                        {
                            'public_arrival': '12:09:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ],
                            'MVTARRIVAL': {
                                'actual_timestamp': 1554203400000
                            }
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ]
                        },
                    ]
                } 

                const board = await JourneyBoard.createBoard(schedule);

                expect(board.locations[1]).to.have.any.keys('actual_departure', 'actual_arrival');
                expect(board.locations[1].actual_departure).to.be.equal('12:06');
                expect(board.locations[1].actual_arrival).to.be.equal('12:07');

                expect(board.locations[2]).to.have.any.keys('actual_arrival');
                expect(board.locations[2].actual_arrival).to.be.equal('12:10');
            });
            
            it('the intermediate stations should have a actual departure when they are pick up only, if there is a movement', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ],
                            'MVTDEPARTURE': {
                                'actual_timestamp': 1554202800000
                            }
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ],
                            'MVTDEPARTURE': {
                                'actual_timestamp': 1554203160000
                            },
                            'MVTARRIVAL': {
                                'actual_timestamp': 1554203220000
                            }
                        },
                        {
                            'public_departure': '12:10:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ],
                            'MVTDEPARTURE': {
                                'actual_timestamp': 1554203340000
                            }
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ]
                        },
                    ]
                } 

                const board = await JourneyBoard.createBoard(schedule);

                expect(board.locations[1]).to.have.any.keys('actual_departure', 'actual_arrival');
                expect(board.locations[1].actual_departure).to.be.equal('12:06');
                expect(board.locations[1].actual_arrival).to.be.equal('12:07');

                expect(board.locations[2]).to.have.any.keys('actual_departure');
                expect(board.locations[2].actual_departure).to.be.equal('12:09');
            });
            
            it('the terminating station should have a actual arrival if there is a movement', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ],
                            'MVTDEPARTURE': {
                                'actual_timestamp': 1554202800000
                            }
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ],
                            'predicted_arrival': '12:06',
                            'predicted_departure': '12:07',
                        },
                        {
                            'public_departure': '12:10:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ],
                            'MVTDEPARTURE': {
                                'actual_timestamp': 1554203340000
                            },
                            'MVTARRIVAL': {
                                'actual_timestamp': 1554203400000
                            }
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ],
                            'MVTARRIVAL': {
                                'actual_timestamp': 1554204000000
                            }
                        },
                    ]
                } 

                const board = await JourneyBoard.createBoard(schedule);

                expect(board.locations[3]).to.have.any.keys('actual_arrival');
                expect(board.locations[3].actual_arrival).to.be.equal('12:20');
            });

            describe('Backfilling Predictions', () => {
                it('the intermediate stations should have an estimated actual arrival and departure time if there is a single gap in reporting', async () => {
                    const schedule = {
                        'location_records': [
                            {
                                'public_departure': '12:00:00',
                                'platform': '1',
                                'location': [
                                    {
                                        'crs': 'ABC',
                                        'name': 'STATION 1'
                                    }
                                ],
                                'MVTDEPARTURE': {
                                    'actual_timestamp': 1554202800000
                                }
                            },
                            {
                                'public_arrival': '12:06:00',
                                'public_departure': '12:07:00',
                                'platform': '1',
                                'location': [
                                    {
                                        'crs': 'DEF',
                                        'name': 'STATION 2'
                                    }
                                ],
                                'predicted_arrival': '12:06',
                                'predicted_departure': '12:07',
                                'MVTDEPARTURE': {
                                    'timetable_variation_prediction': '0'
                                },
                                'MVTARRIVAL': {
                                    'timetable_variation_prediction': '0'
                                },
                            },
                            {
                                'public_arrival': '12:09:00',
                                'public_departure': '12:10:00',
                                'platform': '1',
                                'location': [
                                    {
                                        'crs': 'GHI',
                                        'name': 'STATION 3'
                                    }
                                ],
                                'actual_arrival': '12:09',
                                'actual_departure': '12:10',
                                'MVTDEPARTURE': {
                                    'actual_timestamp': 1554203340000
                                },
                                'MVTARRIVAL': {
                                    'actual_timestamp': 1554203400000
                                }
                            },
                            {
                                'public_arrival': '12:20:00',
                                'platform': '3',
                                'location': [
                                    {
                                        'crs': 'XYZ',
                                        'name': 'STATION 4'
                                    }
                                ]
                            },
                        ]
                    } 
    
                    const board = await JourneyBoard.createBoard(schedule);
                    
                    expect(board.locations[1]).to.have.any.keys('actual_departure', 'actual_arrival');
                    expect(board.locations[1]).to.not.have.any.keys('predicted_departure', 'predicted_arrival');
                    expect(board.locations[1].actual_arrival).to.be.equal('12:06');
                    expect(board.locations[1].actual_departure).to.be.equal('12:07');
    
                });

                it('the intermediate stations should have an estimated actual arrival and departure time if there is two gaps in reporting', async () => {
                    const schedule = {
                        'location_records': [
                            {
                                'public_departure': '12:00:00',
                                'platform': '1',
                                'location': [
                                    {
                                        'crs': 'ABC',
                                        'name': 'STATION 1'
                                    }
                                ],
                                'MVTDEPARTURE': {
                                    'actual_timestamp': 1554202800000
                                }
                            },
                            {
                                'public_arrival': '12:06:00',
                                'public_departure': '12:07:00',
                                'platform': '1',
                                'location': [
                                    {
                                        'crs': 'DEF',
                                        'name': 'STATION 2'
                                    }
                                ],
                                'predicted_arrival': '12:06',
                                'predicted_departure': '12:07',
                                'MVTDEPARTURE': {
                                    'timetable_variation_prediction': '0'
                                },
                                'MVTARRIVAL': {
                                    'timetable_variation_prediction': '0'
                                },
                            },
                            {
                                'public_arrival': '12:09:00',
                                'public_departure': '12:10:00',
                                'platform': '1',
                                'location': [
                                    {
                                        'crs': 'GHI',
                                        'name': 'STATION 3'
                                    }
                                ],
                                'actual_arrival': '12:09',
                                'actual_departure': '12:10',
                                'MVTDEPARTURE': {
                                    'actual_timestamp': 1554203340000
                                },
                                'MVTARRIVAL': {
                                    'actual_timestamp': 1554203400000
                                }
                            },
                            {
                                'public_arrival': '12:06:00',
                                'public_departure': '12:07:00',
                                'platform': '1',
                                'location': [
                                    {
                                        'crs': 'DEF',
                                        'name': 'STATION 4'
                                    }
                                ],
                                'predicted_arrival': '12:06',
                                'predicted_departure': '12:07',
                                'MVTDEPARTURE': {
                                    'timetable_variation_prediction': '0'
                                },
                                'MVTARRIVAL': {
                                    'timetable_variation_prediction': '0'
                                },
                            },
                            {
                                'public_arrival': '12:09:00',
                                'public_departure': '12:10:00',
                                'platform': '1',
                                'location': [
                                    {
                                        'crs': 'GHI',
                                        'name': 'STATION 5'
                                    }
                                ],
                                'actual_arrival': '12:09',
                                'actual_departure': '12:10',
                                'MVTDEPARTURE': {
                                    'actual_timestamp': 1554203340000
                                },
                                'MVTARRIVAL': {
                                    'actual_timestamp': 1554203400000
                                }
                            },
                            {
                                'public_arrival': '12:20:00',
                                'platform': '3',
                                'location': [
                                    {
                                        'crs': 'XYZ',
                                        'name': 'STATION 6'
                                    }
                                ]
                            },
                        ]
                    } 
    
                    const board = await JourneyBoard.createBoard(schedule);
                    
                    expect(board.locations[1]).to.have.any.keys('actual_departure', 'actual_arrival');
                    expect(board.locations[1]).to.not.have.any.keys('predicted_departure', 'predicted_arrival');
                    expect(board.locations[1].actual_arrival).to.be.equal('12:06');
                    expect(board.locations[1].actual_departure).to.be.equal('12:07');

                    expect(board.locations[3]).to.have.any.keys('actual_departure', 'actual_arrival');
                    expect(board.locations[3]).to.not.have.any.keys('predicted_departure', 'predicted_arrival');
                    expect(board.locations[3].actual_arrival).to.be.equal('12:06');
                    expect(board.locations[3].actual_departure).to.be.equal('12:07');
    
                });

                it('the intermediate stations should have an estimated actual arrival and departure time if there is a single gap in reporting larger than 1', async () => {
                    const schedule = {
                        'location_records': [
                            {
                                'public_departure': '12:00:00',
                                'platform': '1',
                                'location': [
                                    {
                                        'crs': 'ABC',
                                        'name': 'STATION 1'
                                    }
                                ],
                                'MVTDEPARTURE': {
                                    'actual_timestamp': 1554202800000
                                }
                            },
                            {
                                'public_arrival': '12:06:00',
                                'public_departure': '12:07:00',
                                'platform': '1',
                                'location': [
                                    {
                                        'crs': 'DEF',
                                        'name': 'STATION 2'
                                    }
                                ],
                                'predicted_arrival': '12:06',
                                'predicted_departure': '12:07',
                                'MVTDEPARTURE': {
                                    'timetable_variation_prediction': '0'
                                },
                                'MVTARRIVAL': {
                                    'timetable_variation_prediction': '0'
                                },
                            },
                            {
                                'public_arrival': '12:06:00',
                                'public_departure': '12:07:00',
                                'platform': '1',
                                'location': [
                                    {
                                        'crs': 'DEF',
                                        'name': 'STATION 3'
                                    }
                                ],
                                'predicted_arrival': '12:06',
                                'predicted_departure': '12:07',
                                'MVTDEPARTURE': {
                                    'timetable_variation_prediction': '0'
                                },
                                'MVTARRIVAL': {
                                    'timetable_variation_prediction': '0'
                                },
                            },
                            {
                                'public_arrival': '12:09:00',
                                'public_departure': '12:10:00',
                                'platform': '1',
                                'location': [
                                    {
                                        'crs': 'GHI',
                                        'name': 'STATION 4'
                                    }
                                ],
                                'actual_arrival': '12:09',
                                'actual_departure': '12:10',
                                'MVTDEPARTURE': {
                                    'actual_timestamp': 1554203340000
                                },
                                'MVTARRIVAL': {
                                    'actual_timestamp': 1554203400000
                                }
                            },
                            {
                                'public_arrival': '12:20:00',
                                'platform': '3',
                                'location': [
                                    {
                                        'crs': 'XYZ',
                                        'name': 'STATION 5'
                                    }
                                ]
                            },
                        ]
                    } 
    
                    const board = await JourneyBoard.createBoard(schedule);
                    
                    expect(board.locations[1]).to.have.any.keys('actual_departure', 'actual_arrival');
                    expect(board.locations[2]).to.not.have.any.keys('predicted_departure', 'predicted_arrival');
                    expect(board.locations[1].actual_arrival).to.be.equal('12:06');
                    expect(board.locations[1].actual_departure).to.be.equal('12:07');

                    expect(board.locations[2]).to.have.any.keys('actual_departure', 'actual_arrival');
                    expect(board.locations[2]).to.not.have.any.keys('predicted_departure', 'predicted_arrival');
                    expect(board.locations[2].actual_arrival).to.be.equal('12:06');
                    expect(board.locations[2].actual_departure).to.be.equal('12:07');
    
                });
            });
        });

        describe('Predicted Time', () => {
            it('the intermediate stations should have a predicted arrival and departure if there is a movement previously', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ],
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ],
                            'predicted_arrival': '12:06',
                            'predicted_departure': '12:07',
                            'MVTDEPARTURE': {
                                'timetable_variation_prediction': '0'
                            },
                            'MVTARRIVAL': {
                                'timetable_variation_prediction': '0'
                            },
                        },
                        {
                            'public_arrival': '12:09:00',
                            'public_departure': '12:10:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ]
                        },
                    ]
                }  

                const board = await JourneyBoard.createBoard(schedule);

                expect(board.locations[1]).to.have.any.keys('predicted_arrival', 'predicted_departure');
                expect(board.locations[1].predicted_arrival).to.equal('12:06');
                expect(board.locations[1].predicted_departure).to.equal('12:07');
            });
    
            it('the intermediate stations should have a predicted arrival when they are drop off only, if there is a movement previously', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ],
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ],
                            'predicted_arrival': '12:06',
                            'MVTARRIVAL': {
                                'timetable_variation_prediction': '0'
                            },
                            'predicted_arrival': '12:06'
                        },
                        {
                            'public_arrival': '12:09:00',
                            'public_departure': '12:10:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ]
                        },
                    ]
                }  

                const board = await JourneyBoard.createBoard(schedule);

                expect(board.locations[1]).to.have.any.keys('predicted_arrival');
                expect(board.locations[1].predicted_arrival).to.equal('12:06');
            });
    
            it('the intermediate stations should have a predicted departure when they are pick up only, if there is a movement previously', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ],
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ],
                            'predicted_departure': '12:07',
                            'MVTDEPARTURE': {
                                'timetable_variation_prediction': '0'
                            }
                        },
                        {
                            'public_arrival': '12:09:00',
                            'public_departure': '12:10:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ]
                        },
                    ]
                }  

                const board = await JourneyBoard.createBoard(schedule);

                expect(board.locations[1]).to.have.any.keys('predicted_departure');
                expect(board.locations[1].predicted_departure).to.equal('12:07');
            });
    
            it('the terminating station should have a predicted arrival, if there is a movement previously', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ],
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ],
                            'predicted_arrival': '12:06',
                            'predicted_departure': '12:07',
                            'MVTDEPARTURE': {
                                'timetable_variation_prediction': '0'
                            },
                            'MVTARRIVAL': {
                                'timetable_variation_prediction': '0'
                            },
                        },
                        {
                            'public_arrival': '12:09:00',
                            'public_departure': '12:10:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ],
                            'predicted_arrival': '12:20',
                            'MVTARRIVAL': {
                                'timetable_variation_prediction': '0'
                            },
                        },
                    ]
                }  

                const board = await JourneyBoard.createBoard(schedule);

                expect(board.locations[3]).to.have.any.keys('predicted_arrival');
                expect(board.locations[3].predicted_arrival).to.equal('12:20');
            });

        });

        describe('Stations', () => {
            it('should contain a CRS code', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:09:00',
                            'public_departure': '12:10:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ]
                        },
                    ]
                }  
    
                const board = await JourneyBoard.createBoard(schedule);
    
                board['locations'].forEach(item => {
                    expect(item.station).to.have.any.keys('crs');
                    expect(item.station.crs).to.not.be.undefined;
                });
            });

            it('should contain a station name', async () => {
                const schedule = {
                    'location_records': [
                        {
                            'public_departure': '12:00:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'ABC',
                                    'name': 'STATION 1'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:06:00',
                            'public_departure': '12:07:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'DEF',
                                    'name': 'STATION 2'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:09:00',
                            'public_departure': '12:10:00',
                            'platform': '1',
                            'location': [
                                {
                                    'crs': 'GHI',
                                    'name': 'STATION 3'
                                }
                            ]
                        },
                        {
                            'public_arrival': '12:20:00',
                            'platform': '3',
                            'location': [
                                {
                                    'crs': 'XYZ',
                                    'name': 'STATION 4'
                                }
                            ]
                        },
                    ]
                }  
    
                const board = await JourneyBoard.createBoard(schedule);
    
                board['locations'].forEach(item => {
                    expect(item.station).to.have.any.keys('name');
                    expect(item.station.name).to.not.be.undefined;
                });
            });
        });
    });

    describe('Cancellations', () => {
        it('should have a cancelled value if the service has been cancelled', async () => {
            const schedule = {
                'location_records': [
                    {
                        'public_departure': '12:00:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'ABC',
                                'name': 'STATION 1'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:06:00',
                        'public_departure': '12:07:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'DEF',
                                'name': 'STATION 2'
                            }
                        ],
                        'MVTCancel': {

                        }
                    },
                    {
                        'public_arrival': '12:09:00',
                        'public_departure': '12:10:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'GHI',
                                'name': 'STATION 3'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:20:00',
                        'platform': '3',
                        'location': [
                            {
                                'crs': 'XYZ',
                                'name': 'STATION 4'
                            }
                        ]
                    },
                ]
            } 

            const board = await JourneyBoard.createBoard(schedule);
            
            expect(board).to.have.any.keys('cancelled');
            expect(board.cancelled).to.be.true;
        });

        it('should not have a cancelled value if the service has not been cancelled', async () => {
            const schedule = {
                'location_records': [
                    {
                        'public_departure': '12:00:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'ABC',
                                'name': 'STATION 1'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:06:00',
                        'public_departure': '12:07:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'DEF',
                                'name': 'STATION 2'
                            }
                        ],
                    },
                    {
                        'public_arrival': '12:09:00',
                        'public_departure': '12:10:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'GHI',
                                'name': 'STATION 3'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:20:00',
                        'platform': '3',
                        'location': [
                            {
                                'crs': 'XYZ',
                                'name': 'STATION 4'
                            }
                        ]
                    },
                ]
            } 

            const board = await JourneyBoard.createBoard(schedule);
            
            expect(board).to.not.have.any.keys('cancelled');
            expect(board.cancelled).to.be.undefined;
        });

        it('should have a cancelCode value if the service has been cancelled', async () => {
            const schedule = {
                'location_records': [
                    {
                        'public_departure': '12:00:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'ABC',
                                'name': 'STATION 1'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:06:00',
                        'public_departure': '12:07:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'DEF',
                                'name': 'STATION 2'
                            }
                        ],
                        'MVTCancel': {
                            'cancel_reason_code': 'XX'
                        }
                    },
                    {
                        'public_arrival': '12:09:00',
                        'public_departure': '12:10:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'GHI',
                                'name': 'STATION 3'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:20:00',
                        'platform': '3',
                        'location': [
                            {
                                'crs': 'XYZ',
                                'name': 'STATION 4'
                            }
                        ]
                    },
                ]
            } 

            const board = await JourneyBoard.createBoard(schedule);
            
            expect(board).to.have.any.keys('cancelled', 'cancelCode');
            expect(board.cancelled).to.be.true;
            expect(board.cancelCode).to.be.equal('XX');
        });

        it('should not have a cancelCode value if the service has not been cancelled', async () => {
            const schedule = {
                'location_records': [
                    {
                        'public_departure': '12:00:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'ABC',
                                'name': 'STATION 1'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:06:00',
                        'public_departure': '12:07:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'DEF',
                                'name': 'STATION 2'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:09:00',
                        'public_departure': '12:10:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'GHI',
                                'name': 'STATION 3'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:20:00',
                        'platform': '3',
                        'location': [
                            {
                                'crs': 'XYZ',
                                'name': 'STATION 4'
                            }
                        ]
                    },
                ]
            } 

            const board = await JourneyBoard.createBoard(schedule);
            
            expect(board).to.not.have.any.keys('cancelled', 'cancelCode');
            expect(board.cancelled).to.be.undefined;
            expect(board.cancelCode).to.be.undefined;
        });

        it('should have a cancelledAt value if the service has been cancelled', async () => {
            const schedule = {
                'location_records': [
                    {
                        'public_departure': '12:00:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'ABC',
                                'name': 'STATION 1'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:06:00',
                        'public_departure': '12:07:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'DEF',
                                'name': 'STATION 2'
                            }
                        ],
                        'MVTCancel': {
                            'cancel_reason_code': 'XX'
                        }
                    },
                    {
                        'public_arrival': '12:09:00',
                        'public_departure': '12:10:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'GHI',
                                'name': 'STATION 3'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:20:00',
                        'platform': '3',
                        'location': [
                            {
                                'crs': 'XYZ',
                                'name': 'STATION 4'
                            }
                        ]
                    },
                ]
            } 

            const board = await JourneyBoard.createBoard(schedule);
            
            expect(board).to.have.any.keys('cancelled', 'cancelCode', 'cancelledAt');
            expect(board.cancelled).to.be.true;
            expect(board.cancelCode).to.be.equal('XX');
            expect(board.cancelledAt.name).to.be.equal('Station 2');
        });

        it('should indicate that subsequent records are cancelled', async () => {
            const schedule = {
                'location_records': [
                    {
                        'public_departure': '12:00:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'ABC',
                                'name': 'STATION 1'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:06:00',
                        'public_departure': '12:07:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'DEF',
                                'name': 'STATION 2'
                            }
                        ],
                        'MVTCancel': {
                            'cancel_reason_code': 'XX'
                        }
                    },
                    {
                        'public_arrival': '12:09:00',
                        'public_departure': '12:10:00',
                        'platform': '1',
                        'location': [
                            {
                                'crs': 'GHI',
                                'name': 'STATION 3'
                            }
                        ]
                    },
                    {
                        'public_arrival': '12:20:00',
                        'platform': '3',
                        'location': [
                            {
                                'crs': 'XYZ',
                                'name': 'STATION 4'
                            }
                        ]
                    },
                ]
            } 

            const board = await JourneyBoard.createBoard(schedule);
            
            expect(board.locations[0].cancelled).to.be.undefined;
            expect(board.locations[1].cancelled).to.be.true;
            expect(board.locations[2].cancelled).to.be.true;
            expect(board.locations[3].cancelled).to.be.true;
        });
    });

    describe('Operational Information', () => {
        it('should have a UID', async () => {
            const schedule = {
                'uid': 'A12345'
            }

            const board = await JourneyBoard.createBoard(schedule);

            expect(board).to.have.any.keys('uid');
            expect(board.uid).to.equal('A12345');

        });
        
        it('should have a category', async () => {
            const schedule = {
                'train_category': 'XX'
            }

            const board = await JourneyBoard.createBoard(schedule);

            expect(board).to.have.any.keys('category');
            expect(board.category).to.equal('XX');
        });
        
        it('should have an operator code', async () => {
            const schedule = {
                'atoc_code': 'SR'
            }

            const board = await JourneyBoard.createBoard(schedule);

            expect(board).to.have.any.keys('operator');
            expect(board.operator).to.equal('SR');
        });
    });

});
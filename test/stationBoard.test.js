const expect = require('chai').expect;
const direction = require('../data/direction.js');

describe('Station Boards', function() {

    const StationBoard = require('../src/stationBoard.js');
    
    it('should throw an error when given a weird direction', () => {
        const boardFnc = () => {new StationBoard({}, 4)};
        expect(boardFnc).to.throw(Error);
    });

    describe('Standard Keys', () => {
        describe('Should have an operator', () => {
            it('Departures', () => {
                const schedules = [
                    {'atoc_code': 'SR'}
                ];
    
                const board = new StationBoard(schedules, direction.DEPARTURES)
                                .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('operator');
            });

            it('Arrivals', () => {
                const schedules = [
                    {'atoc_code': 'SR'}
                ];
    
                const board = new StationBoard(schedules, direction.ARRIVALS)
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('operator');
            });
        });

        describe('Should have a UID', () => {
            it('Departures', () => {
                const schedules = [
                    {'uid': 'A12345'}
                ];

                const board = new StationBoard(schedules, direction.DEPARTURES)
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('uid');
            });

            it('Arrivals', () => {
                const schedules = [
                    {'uid': 'A12345'}
                ];

                const board = new StationBoard(schedules, direction.ARRIVALS)
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('uid');
            });
        });

        describe('Should have a category', () => {
            it('Departures', () => {
                const schedules = [
                    {'train_category': 'XX'}
                ];

                const board = new StationBoard(schedules, direction.DEPARTURES)
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('category');
            });

            it('Arrivals', () => {
                const schedules = [
                    {'train_category': 'XX'}
                ];

                const board = new StationBoard(schedules, direction.ARRIVALS)
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('category');
            });
        });
        
        describe('Should have a platform', () => {
            it('Departures', () => {
                const schedules = [
                    {'location_records': [
                        {'tiploc': 'ABCDEF', platform: '1'},
                        {'tiploc': 'GHIJKL', platform: '2'},
                        {'tiploc': 'MNOPQU', platform: '3'},
                    ]}
                ];

                const board = new StationBoard(schedules, direction.DEPARTURES, 'GHIJKL')
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('platform');
            });

            it('Arrivals', () => {
                const schedules = [
                    {'location_records': [
                        {'tiploc': 'ABCDEF', platform: '1'},
                        {'tiploc': 'GHIJKL', platform: '2'},
                        {'tiploc': 'MNOPQU', platform: '3'},
                    ]}
                ];

                const board = new StationBoard(schedules, direction.ARRIVALS, 'GHIJKL')
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('platform');
            });
        });
    });

    describe('Departures', () => {
        
        describe('Destination', () => {
            it('should contain a single destination', () => {
                const schedules = [
                    {'location_records': [
                        {'tiploc': 'ABCDEF', 'type': 'LO', location: [{'name': 'Station 1'}]},
                        {'tiploc': 'GHIJKL', 'type': 'LI', location: [{'name': 'Station 2'}]},
                        {'tiploc': 'MNOPQU', 'type': 'LT', location: [{'name': 'Station 3'}]},
                    ]}
                ];
    
                const board = new StationBoard(schedules, direction.DEPARTURES, 'GHIJKL')
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('destination');
                expect(board[0]['destination']).to.equal('Station 3');
            });

            it('should contain an array of destinations if there is one association', () => {
                const schedules = [
                    {'location_records': [
                        {'tiploc': 'ABCDEF', 'type': 'LO', location: [{'name': 'Station 1'}]},
                        {'tiploc': 'GHIJKL', 'type': 'LI', location: [{'name': 'Station 2'}]},
                        {'tiploc': 'MNOPQU', 'type': 'LT', location: [{'name': 'Station 3'}]},
                        ],
                    'associations': [
                        {'location_records': [
                            {'tiploc': 'QWERTY', 'type': 'LO', location: [{'name': 'Station 2'}]},
                            {'tiploc': 'ASDFGH', 'type': 'LI', location: [{'name': 'Station 4'}]},
                            {'tiploc': 'ZXCVBN', 'type': 'LT', location: [{'name': 'Station 5'}]},
                            ],
                        },
                    ]}
                ];
    
                const board = new StationBoard(schedules, direction.DEPARTURES, 'GHIJKL')
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('destination');
                expect(board[0]['destination']).to.have.lengthOf(2);
                expect(board[0]['destination']).to.have.members(['Station 3', 'Station 5']);
            });

            it('should contain an array of destinations if there is two associations', () => {
                const schedules = [
                    {
                        'location_records': [
                        {'tiploc': 'ABCDEF', 'type': 'LO', location: [{'name': 'Station 1'}]},
                        {'tiploc': 'GHIJKL', 'type': 'LI', location: [{'name': 'Station 2'}]},
                        {'tiploc': 'MNOPQU', 'type': 'LT', location: [{'name': 'Station 3'}]},
                        ],
                    'associations': [
                        {'location_records': [
                            {'tiploc': 'QWERTY', 'type': 'LO', location: [{'name': 'Station 2'}]},
                            {'tiploc': 'ASDFGH', 'type': 'LI', location: [{'name': 'Station 4'}]},
                            {'tiploc': 'ZXCVBN', 'type': 'LT', location: [{'name': 'Station 5'}]},
                            ],
                        },
                        {'location_records': [
                            {'tiploc': 'QWERTY', 'type': 'LO', location: [{'name': 'Station 2'}]},
                            {'tiploc': 'ASDFGH', 'type': 'LI', location: [{'name': 'Station 6'}]},
                            {'tiploc': 'ZXCVBN', 'type': 'LT', location: [{'name': 'Station 7'}]},
                            ],
                        },
                        ]
                    }
                ];
    
                const board = new StationBoard(schedules, direction.DEPARTURES, 'GHIJKL')
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('destination');
                expect(board[0]['destination']).to.have.lengthOf(3);
                expect(board[0]['destination']).to.have.members(['Station 3', 'Station 5', 'Station 7']);
            });

            it('should contain an array of destinations if there is three association', () => {
                const schedules = [
                    {'location_records': [
                        {'tiploc': 'ABCDEF', 'type': 'LO', location: [{'name': 'Station 1'}]},
                        {'tiploc': 'GHIJKL', 'type': 'LI', location: [{'name': 'Station 2'}]},
                        {'tiploc': 'MNOPQU', 'type': 'LT', location: [{'name': 'Station 3'}]},
                        ],
                    'associations': [
                        {'location_records': [
                            {'tiploc': 'QWERTY', 'type': 'LO', location: [{'name': 'Station 2'}]},
                            {'tiploc': 'ASDFGH', 'type': 'LI', location: [{'name': 'Station 4'}]},
                            {'tiploc': 'ZXCVBN', 'type': 'LT', location: [{'name': 'Station 5'}]},
                            ],
                        },
                        {'location_records': [
                            {'tiploc': 'QWERTY', 'type': 'LO', location: [{'name': 'Station 2'}]},
                            {'tiploc': 'ASDFGH', 'type': 'LI', location: [{'name': 'Station 6'}]},
                            {'tiploc': 'ZXCVBN', 'type': 'LT', location: [{'name': 'Station 7'}]},
                            ],
                        },
                        {'location_records': [
                            {'tiploc': 'QWERTY', 'type': 'LO', location: [{'name': 'Station 2'}]},
                            {'tiploc': 'ASDFGH', 'type': 'LI', location: [{'name': 'Station 8'}]},
                            {'tiploc': 'ZXCVBN', 'type': 'LT', location: [{'name': 'Station 9'}]},
                            ],
                        },
                    ]}
                ];
    
                const board = new StationBoard(schedules, direction.DEPARTURES, 'GHIJKL')
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('destination');
                expect(board[0]['destination']).to.have.lengthOf(4);
                expect(board[0]['destination']).to.have.members(['Station 3', 'Station 5', 'Station 7', 'Station 9']);
            });

        });

        it('should contain only a public departure when no predictions are made, or actual movements have happened', () => {
            const schedules = [
                {'location_records': [
                    {'tiploc': 'ABCDEF', 'public_departure': '12:00',},
                    {'tiploc': 'GHIJKL', 'public_departure': '12:06', 'public_arrival': '12:05'},
                    {'tiploc': 'MNOPQU', 'public_arrival': '12:10'},
                ]}
            ];

            const board = new StationBoard(schedules, direction.DEPARTURES, 'GHIJKL')
                          .createBoard();

            expect(board).have.lengthOf(1);
            expect(board[0]).to.include.any.keys('public_departure');
            expect(board[0]['public_departure']).to.equal('12:06');
        });

        it('should contain a public departure and predicted departure but no actual departure', () => {
            const schedules = [
                {'location_records': [
                    {'tiploc': 'ABCDEF', 'public_departure': '12:00', 'actual_departure': '12:01'},
                    {'tiploc': 'GHIJKL', 'public_departure': '12:06', 'public_arrival': '12:05', 'predicted_arrival': '12:06', 'predicted_departure': '12:07'},
                    {'tiploc': 'MNOPQU', 'public_arrival': '12:10', 'predicted_arrival': '12:11'},
                ]}
            ];

            const board = new StationBoard(schedules, direction.DEPARTURES, 'GHIJKL')
                          .createBoard();

            expect(board).have.lengthOf(1);
            expect(board[0]).to.include.any.keys('predicted_departure');
            expect(board[0]['predicted_departure']).to.equal('12:07');
        });

        it('should contain a public departure and an actual departure but no predicted departure', () => {
            const schedules = [
                {'location_records': [
                    {'tiploc': 'ABCDEF', 'public_departure': '12:00', 'actual_departure': '12:01'},
                    {'tiploc': 'GHIJKL', 'public_departure': '12:06', 'public_arrival': '12:05', 'actual_arrival': '12:06', 'actual_departure': '12:07'},
                    {'tiploc': 'MNOPQU', 'public_arrival': '12:10', 'predicted_arrival': '12:11'},
                ]}
            ];

            const board = new StationBoard(schedules, direction.DEPARTURES, 'GHIJKL')
                          .createBoard();

            expect(board).have.lengthOf(1);
            expect(board[0]).to.include.any.keys('actual_departure');
            expect(board[0]['actual_departure']).to.equal('12:07');
        });
    });

    describe('Arrivals', () => {
        
        describe('Origin', () => {
            it('should contain a single origin', () => {
                const schedules = [
                    {'location_records': [
                        {'tiploc': 'ABCDEF', 'type': 'LO', location: [{'name': 'Station 1'}]},
                        {'tiploc': 'GHIJKL', 'type': 'LI', location: [{'name': 'Station 2'}]},
                        {'tiploc': 'MNOPQU', 'type': 'LT', location: [{'name': 'Station 3'}]},
                    ]}
                ];
    
                const board = new StationBoard(schedules, direction.ARRIVALS, 'GHIJKL')
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('origin');
                expect(board[0]['origin']).to.equal('Station 1');
            });

            it('should contain an array of origins if there is one association', () => {
                const schedules = [
                    {'location_records': [
                        {'tiploc': 'ABCDEF', 'type': 'LO', location: [{'name': 'Station 1'}]},
                        {'tiploc': 'GHIJKL', 'type': 'LI', location: [{'name': 'Station 2'}]},
                        {'tiploc': 'MNOPQU', 'type': 'LT', location: [{'name': 'Station 3'}]},
                        ],
                    'associations': [
                        {'location_records': [
                            {'tiploc': 'QWERTY', 'type': 'LO', location: [{'name': 'Station 4'}]},
                            {'tiploc': 'ASDFGH', 'type': 'LI', location: [{'name': 'Station 5'}]},
                            {'tiploc': 'ZXCVBN', 'type': 'LT', location: [{'name': 'Station 2'}]},
                            ],
                        },
                    ]}
                ];
    
                const board = new StationBoard(schedules, direction.ARRIVALS, 'GHIJKL')
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('origin');
                expect(board[0]['origin']).to.have.lengthOf(2);
                expect(board[0]['origin']).to.have.members(['Station 1', 'Station 4']);
            });

            it('should contain an array of origins if there is two associations', () => {
                const schedules = [
                    {
                        'location_records': [
                        {'tiploc': 'ABCDEF', 'type': 'LO', location: [{'name': 'Station 1'}]},
                        {'tiploc': 'GHIJKL', 'type': 'LI', location: [{'name': 'Station 2'}]},
                        {'tiploc': 'MNOPQU', 'type': 'LT', location: [{'name': 'Station 3'}]},
                        ],
                    'associations': [
                        {'location_records': [
                            {'tiploc': 'QWERTY', 'type': 'LO', location: [{'name': 'Station 4'}]},
                            {'tiploc': 'ASDFGH', 'type': 'LI', location: [{'name': 'Station 5'}]},
                            {'tiploc': 'ZXCVBN', 'type': 'LT', location: [{'name': 'Station 2'}]},
                            ],
                        },
                        {'location_records': [
                            {'tiploc': 'QWERTY', 'type': 'LO', location: [{'name': 'Station 6'}]},
                            {'tiploc': 'ASDFGH', 'type': 'LI', location: [{'name': 'Station 7'}]},
                            {'tiploc': 'ZXCVBN', 'type': 'LT', location: [{'name': 'Station 2'}]},
                            ],
                        },
                        ]
                    }
                ];
    
                const board = new StationBoard(schedules, direction.ARRIVALS, 'GHIJKL')
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('origin');
                expect(board[0]['origin']).to.have.lengthOf(3);
                expect(board[0]['origin']).to.have.members(['Station 1', 'Station 4', 'Station 6']);
            });

            it('should contain an array of origins if there is three association', () => {
                const schedules = [
                    {'location_records': [
                        {'tiploc': 'ABCDEF', 'type': 'LO', location: [{'name': 'Station 1'}]},
                        {'tiploc': 'GHIJKL', 'type': 'LI', location: [{'name': 'Station 2'}]},
                        {'tiploc': 'MNOPQU', 'type': 'LT', location: [{'name': 'Station 3'}]},
                        ],
                    'associations': [
                        {'location_records': [
                            {'tiploc': 'QWERTY', 'type': 'LO', location: [{'name': 'Station 4'}]},
                            {'tiploc': 'ASDFGH', 'type': 'LI', location: [{'name': 'Station 5'}]},
                            {'tiploc': 'ZXCVBN', 'type': 'LT', location: [{'name': 'Station 2'}]},
                            ],
                        },
                        {'location_records': [
                            {'tiploc': 'QWERTY', 'type': 'LO', location: [{'name': 'Station 6'}]},
                            {'tiploc': 'ASDFGH', 'type': 'LI', location: [{'name': 'Station 7'}]},
                            {'tiploc': 'ZXCVBN', 'type': 'LT', location: [{'name': 'Station 2'}]},
                            ],
                        },
                        {'location_records': [
                            {'tiploc': 'QWERTY', 'type': 'LO', location: [{'name': 'Station 8'}]},
                            {'tiploc': 'ASDFGH', 'type': 'LI', location: [{'name': 'Station 9'}]},
                            {'tiploc': 'ZXCVBN', 'type': 'LT', location: [{'name': 'Station 2'}]},
                            ],
                        },
                    ]}
                ];
    
                const board = new StationBoard(schedules, direction.ARRIVALS, 'GHIJKL')
                              .createBoard();
    
                expect(board).have.lengthOf(1);
                expect(board[0]).to.include.any.keys('origin');
                expect(board[0]['origin']).to.have.lengthOf(4);
                expect(board[0]['origin']).to.have.members(['Station 1', 'Station 4', 'Station 6', 'Station 8']);
            });
        });

        it('should contain only a public arrival when no predictions are made, or actual movements have happened', () => {
            const schedules = [
                {'location_records': [
                    {'tiploc': 'ABCDEF', 'public_departure': '12:00',},
                    {'tiploc': 'GHIJKL', 'public_departure': '12:06', 'public_arrival': '12:05'},
                    {'tiploc': 'MNOPQU', 'public_arrival': '12:10'},
                ]}
            ];

            const board = new StationBoard(schedules, direction.ARRIVALS, 'GHIJKL')
                          .createBoard();

            expect(board).have.lengthOf(1);
            expect(board[0]).to.include.any.keys('public_arrival');
            expect(board[0]['public_arrival']).to.equal('12:05');
        });

        it('should contain a public arrival and predicted arrival but no actual arrival', () => {
            const schedules = [
                {'location_records': [
                    {'tiploc': 'ABCDEF', 'public_departure': '12:00', 'actual_departure': '12:01'},
                    {'tiploc': 'GHIJKL', 'public_departure': '12:06', 'public_arrival': '12:05', 'predicted_arrival': '12:06', 'predicted_departure': '12:07'},
                    {'tiploc': 'MNOPQU', 'public_arrival': '12:10', 'predicted_arrival': '12:11'},
                ]}
            ];

            const board = new StationBoard(schedules, direction.ARRIVALS, 'GHIJKL')
                          .createBoard();

            expect(board).have.lengthOf(1);
            expect(board[0]).to.include.any.keys('predicted_arrival');
            expect(board[0]['predicted_arrival']).to.equal('12:06');
        });

        it('should contain a public arrival and an actual arrival but no predicted arrival', () => {
            const schedules = [
                {'location_records': [
                    {'tiploc': 'ABCDEF', 'public_departure': '12:00', 'actual_departure': '12:01'},
                    {'tiploc': 'GHIJKL', 'public_departure': '12:06', 'public_arrival': '12:05', 'actual_arrival': '12:06', 'actual_departure': '12:07'},
                    {'tiploc': 'MNOPQU', 'public_arrival': '12:10', 'predicted_arrival': '12:11'},
                ]}
            ];

            const board = new StationBoard(schedules, direction.ARRIVALS, 'GHIJKL')
                          .createBoard();

            expect(board).have.lengthOf(1);
            expect(board[0]).to.include.any.keys('actual_arrival');
            expect(board[0]['actual_arrival']).to.equal('12:06');
        });
    });

    describe('Cancellation', () => {
        it('should not contain a cancellation when there is no cancel movement', () => {
            const schedules = [
                {'location_records': [
                    {'tiploc': 'ABCDEF', 'type': 'LO', location: [{'name': 'Station 1'}]},
                    {'tiploc': 'GHIJKL', 'type': 'LI', location: [{'name': 'Station 2'}]},
                    {'tiploc': 'MNOPQU', 'type': 'LT', location: [{'name': 'Station 3'}]},
                ]}
            ];

            const board = new StationBoard(schedules, direction.DEPARTURES, 'GHIJKL')
                          .createBoard();

            expect(board).have.lengthOf(1);
            expect(board[0]).to.not.include.any.keys('cancelled', 'cancelCode');
        });

        it('should contain a cancellation when there is cancel movement', () => {
            const schedules = [
                {'location_records': [
                    {'tiploc': 'ABCDEF', 'type': 'LO', location: [{'name': 'Station 1'}]},
                    {'tiploc': 'GHIJKL', 'type': 'LI', 'MVTCancel': {'canx_reason_code': 'XX'}, location: [{'name': 'Station 2'}]},
                    {'tiploc': 'MNOPQU', 'type': 'LT', location: [{'name': 'Station 3'}]},
                ]}
            ];

            const board = new StationBoard(schedules, direction.DEPARTURES, 'GHIJKL')
                            .createBoard();

            expect(board).have.lengthOf(1);
            expect(board[0]).to.include.any.keys('cancelled');
            expect(board[0]['cancelled']).to.be.true;
        });

        it('should contain the cancellation code', () => {
            const schedules = [
                {'location_records': [
                    {'tiploc': 'ABCDEF', 'type': 'LO', location: [{'name': 'Station 1'}]},
                    {'tiploc': 'GHIJKL', 'type': 'LI', 'MVTCancel': {'cancel_reason_code': 'XX'}, location: [{'name': 'Station 2'}]},
                    {'tiploc': 'MNOPQU', 'type': 'LT', location: [{'name': 'Station 3'}]},
                ]}
            ];

            const board = new StationBoard(schedules, direction.DEPARTURES, 'GHIJKL')
                            .createBoard();

            expect(board).have.lengthOf(1);
            expect(board[0]).to.include.any.keys('cancelCode');
            expect(board[0]['cancelCode']).to.not.be.undefined;
        });

    });

});
const expect = require('chai').expect;
const direction = require('../data/direction.js');

describe('Station Boards', function() {

    const StationBoard = require('../src/stationBoard.js');
    
    it('should throw an error when given a weird direction', () => {
        const boardFnc = () => {new StationBoard({}, 4)};
        expect(boardFnc).to.throw(Error);
    })

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
        it('should contain a destination', () => {
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
        it('should contain a origin', () => {
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
        });

        it('should contain the cancellation code', () => {
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
            expect(board[0]).to.include.any.keys('cancelCode');
        });

    });

});
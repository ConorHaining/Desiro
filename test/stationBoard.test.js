const expect = require('chai').expect;
const direction = require('../data/direction.js');

describe('Station Boards', function() {

    const StationBoard = require('../src/stationBoard.js');

    describe('Standard Keys', () => {
        describe('Should have an operator', () => {
            it('Departures', () => {
                const schedules = [
                    {'atoc_code': 'SR'}
                ];
    
                const board = new StationBoard(schedules, direction.DEPARTURES)
                                .createBoard();;
    
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
            expect(true).to.be.false;
        });

        it('should contain only a public departure when no predictions are made, or actual movements have happened', () => {
            expect(true).to.be.false;
        });

        it('should contain a public departure and predicted departure but no actual departure', () => {
            expect(true).to.be.false;
        });

        it('should contain a public departure and an actual departure but no predicted departure', () => {
            expect(true).to.be.false;
        });
    });

    describe('Arrivals', () => {
        it('should contain a origin', () => {
            expect(true).to.be.false;
        });

        it('should contain only a public arrival when no predictions are made, or actual movements have happened', () => {
            expect(true).to.be.false;
        });

        it('should contain a public arrival and predicted arrival but no actual arrival', () => {
            expect(true).to.be.false;
        });

        it('should contain a public arrival and an actual arrival but no predicted arrival', () => {
            expect(true).to.be.false;
        });
    });

});
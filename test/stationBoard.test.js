const expect = require('chai').expect;

describe('Station Boards', function() {

    const stationBoard = require('../src/stationBoard.js');

    describe('Standard Keys', () => {
        it('should have an operator', () => {
            expect(true).to.be.false;
        });

        it('should have a UID', () => {
            expect(true).to.be.false;
        });

        it('should have a category', () => {
            expect(true).to.be.false;
        });
        
        it('should have a platform', () => {
            expect(true).to.be.false;
        })
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
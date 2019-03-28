const expect = require('chai').expect;

describe('Helpers', function() {

    const helpers = require('../src/helpers.js');

    describe('Proper Case', () => {
        it('should return a proper case string from an upper case string', () =>{
            const string = 'THE NEXT STOP IS STIRLING';
            const result = helpers.toProperCase(string);
            expect(result).to.equal('The Next Stop Is Stirling');
        });
    
        it('should return a proper case string from a lower case', () => {
            const string = 'the next stop is stirling';
            const result = helpers.toProperCase(string);
            expect(result).to.equal('The Next Stop Is Stirling');
        });
    
        it('should return a proper case string from a mixed case string', () => {
            const string = 'thE NeXT STop iS sTiRLINg';
            const result = helpers.toProperCase(string);
            expect(result).to.equal('The Next Stop Is Stirling');
        });
    
        it('should return a proper case string from a proper case string', () => {
            const string = 'The Next Stop Is Stirling';
            const result = helpers.toProperCase(string);
            expect(result).to.equal('The Next Stop Is Stirling');
        });
    });

});
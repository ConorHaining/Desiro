const expect = require('chai').expect;

describe('Associations', function() {

    const associationFormatting = require('../src/associationFormatting.js');

    describe('Filter Valid Running Days', function() {
        describe('Sundays', () =>{
            
            beforeEach(() => {
                Date.prototype.getDay = function() { return 0; };
            });
            
            it('should return a schedule for ******1', () => {
                let association = {
                    'running_days': '0000001'
                };
                
                association = associationFormatting.filterValidRunningDays(association);

                expect(association).to.be.true;
            });
            
            it('should not return a schedule for ******0', () => {
                let association = {
                    'running_days': '1111110'
                };

                association = associationFormatting.filterValidRunningDays(association);

                expect(association).to.be.false;
            });
        });
    
        describe('Mondays', () =>{
            beforeEach(() => {
                Date.prototype.getDay = function() { return 1; };
            });
        
            it('should return a schedule for 1******', () => {
                let association = {
                    'running_days': '1000000'
                };
                
                association = associationFormatting.filterValidRunningDays(association);

                expect(association).to.be.true;
            });
            
            it('should not return a schedule for 0******', () => {
                let association = {
                    'running_days': '0111111'
                };

                association = associationFormatting.filterValidRunningDays(association);

                expect(association).to.be.false;
            });
        });
    
        describe('Saturdays', () =>{
            beforeEach(() => {
                Date.prototype.getDay = function() { return 6; };
            });
        
            it('should return a schedule for *****1*', () => {
                let association = {
                    'running_days': '0000010'
                };
                
                association = associationFormatting.filterValidRunningDays(association);

                expect(association).to.be.true;
            });
            
            it('should not return a schedule for *****0*', () => {
                let association = {
                    'running_days': '1111101'
                };

                association = associationFormatting.filterValidRunningDays(association);

                expect(association).to.be.false;
            });
        });
    
    });

    describe('Filter Valid Running Days (Multiple)', function() {
        beforeEach(() => {
            Date.prototype.getDay = function() { return 6; };
        });

        it('should resolve when given an array of associations', async () => {
            let schedules = [
                {
                    associations: [
                        {'running_days': '1111101'},
                        {'running_days': '0000010'},
                        {'running_days': '0000010'},
                        {'running_days': '1111101'},
                        {'running_days': '0000010'},
                    ]
                }
            ];

            let validSchedules = await associationFormatting.filterValidRunningDaysFromSchedules(schedules);
            expect(validSchedules[0]['associations']).to.be.an('array');
            expect(validSchedules[0]['associations']).to.have.length(3);
        });

        it('should resolve when not given an array of associations', async () => {
            let schedules = [
                {}
            ];

            let validSchedules = await associationFormatting.filterValidRunningDaysFromSchedules(schedules);
            expect(validSchedules[0]['associations']).to.be.undefined;
        });
    });
    
    describe('Filter STP Validity', function() {
    
        /**
         *      Precedence
         *      
         *   ^  Cancelled (C) [CAN]
         *   |  Short Term Planning (N) [STP]
         *   |  Overlay (V) [VAR]
         *   |  Permanent (P) [WTT]
         * 
         */
    
        it('should return the WTT(P) schedule if there is no VAR(O) or CAN(C)', () => {
            let associations = [
                {
                    'stp_indicator': 'P'
                }
            ];

            let association = associationFormatting.filterValidSTPIndicators(associations);

            expect(association).to.have.property('stp_indicator', 'P');
        });
        
        it('should return the VAR(0) schedule if there is one present and no CAN(C) with the WTT', () => {
            let associations = [
                {
                    'stp_indicator': 'P'
                },
                {
                    'stp_indicator': 'O'
                }
            ];

            let association = associationFormatting.filterValidSTPIndicators(associations);

            expect(association).to.have.property('stp_indicator', 'O');
        });
    
        it('should return the CAN(C) schedule if there is one present with the WTT, and no VAR (O)', () => {
            let associations = [
                {
                    'stp_indicator': 'P'
                },
                {
                    'stp_indicator': 'C'
                }
            ];
            
            let association = associationFormatting.filterValidSTPIndicators(associations);

            expect(association).to.have.property('stp_indicator', 'C');
        });

        it('should return the CAN(C) schedule if there is one present with the WTT, and with VAR (O)', () => {
            let associations = [
                {
                    'stp_indicator': 'P'
                },
                {
                    'stp_indicator': 'C'
                },
                {
                    'stp_indicator': 'O'
                },
            ];
            
            let association = associationFormatting.filterValidSTPIndicators(associations);

            expect(association).to.have.property('stp_indicator', 'C');
        });
    
        it('should return the STP(N) schedule if there is no CAN(C)', () => {
            let associations = [
                {
                    'stp_indicator': 'N'
                }
            ];

            let association = associationFormatting.filterValidSTPIndicators(associations);

            expect(association).to.have.property('stp_indicator', 'N');
        });
    
        it('should return the CAN(C) schedule if there is one present with the STP', () => {
            let associations = [
                {
                    'stp_indicator': 'N'
                },
                {
                    'stp_indicator': 'C'
                }
            ];
            
            let association = associationFormatting.filterValidSTPIndicators(associations);

            expect(association).to.have.property('stp_indicator', 'C');
        });

        it('should return correct schedule regardless of order', () => {
            let associations = [
                {
                    'stp_indicator': 'C'
                },
                {
                    'stp_indicator': 'O'
                },
                {
                    'stp_indicator': 'P'
                },
            ];
            
            let association = associationFormatting.filterValidSTPIndicators(associations);

            expect(association).to.have.property('stp_indicator', 'C');
        });
    
    });

    describe('Filter STP Validity (Multiple)', function() {

        it('should resolve when given an array of associations', async () => {
            let schedules = [
                {
                    associations: [
                        {'STP_indicator': 'P'},
                        {'STP_indicator': 'O'},
                    ]
                }
            ];

            let validSchedules = await associationFormatting.filterValidSTPIndicatorsFromSchedules(schedules);
            expect(validSchedules[0]['associations']).to.be.an('object');
        });

        it('should resolve when not given an array of associations', async () => {
            let schedules = [
                {}
            ];

            let validSchedules = await associationFormatting.filterValidSTPIndicatorsFromSchedules(schedules);
            expect(validSchedules[0]['associations']).to.be.undefined;
        });
    });
    
    describe('Discarding Next (NP) Associations', function() {

        it('should remove any associations which have NP (Next) category', () => {
            let association = {
                'category': 'NP'
            };

            association = associationFormatting.discardNextAssociations(association);

            expect(association).to.be.false;
        });

        it('should not remove any associations which have JJ (Join) category', () => {
            let association = {
                'category': 'JJ'
            };

            association = associationFormatting.discardNextAssociations(association);

            expect(association).to.be.true;
        });

        it('should not remove any associations which have VV (Divide) category', () => {
            let association = {
                'category': 'VV'
            };

            association = associationFormatting.discardNextAssociations(association);

            expect(association).to.be.true;
        });

    });


});
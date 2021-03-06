const expect = require('chai').expect;
const { DateTime } = require('luxon');

describe('Associations', function() {

    const associationFormatting = require('../src/associationFormatting.js');

    describe('Filter Valid Running Days', function() {
        describe('Sundays', () =>{
            
            
            it('should return a schedule for ******1', () => {
                const when = DateTime.fromObject({weekday: 7});
                let association = {
                    'running_days': '0000001'
                };
                
                association = associationFormatting.filterValidRunningDays(association, when);

                expect(association).to.be.true;
            });
            
            it('should not return a schedule for ******0', () => {
                const when = DateTime.fromObject({weekday: 7});
                let association = {
                    'running_days': '1111110'
                };

                association = associationFormatting.filterValidRunningDays(association, when);

                expect(association).to.be.false;
            });
        });
    
        describe('Mondays', () =>{
        
            it('should return a schedule for 1******', () => {
                const when = DateTime.fromObject({weekday: 1});
                let association = {
                    'running_days': '1000000'
                };
                
                association = associationFormatting.filterValidRunningDays(association, when);

                expect(association).to.be.true;
            });
            
            it('should not return a schedule for 0******', () => {
                const when = DateTime.fromObject({weekday: 1});
                let association = {
                    'running_days': '0111111'
                };

                association = associationFormatting.filterValidRunningDays(association, when);

                expect(association).to.be.false;
            });
        });
    
        describe('Saturdays', () =>{
        
            it('should return a schedule for *****1*', () => {
                const when = DateTime.fromObject({weekday: 6});
                let association = {
                    'running_days': '0000010'
                };
                
                association = associationFormatting.filterValidRunningDays(association, when);

                expect(association).to.be.true;
            });
            
            it('should not return a schedule for *****0*', () => {
                const when = DateTime.fromObject({weekday: 6});
                let association = {
                    'running_days': '1111101'
                };

                association = associationFormatting.filterValidRunningDays(association, when);

                expect(association).to.be.false;
            });
        });
    
    });

    describe('Filter Valid Running Days (Multiple)', function() {

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

            const when = DateTime.fromObject({weekday: 6});
            let validSchedules = await associationFormatting.filterValidRunningDaysFromSchedules(schedules, when);
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
    
        describe('Singular', () => {
            it('should return the WTT(P) schedule if there is no VAR(O) or CAN(C)', () => {
                let associations = [
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    }
                ];
    
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'P');
                expect(association).to.have.lengthOf(1);
            });
            
            it('should return the VAR(0) schedule if there is one present and no CAN(C) with the WTT', () => {
                let associations = [
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'O',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    }
                ];
    
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'O');
                expect(association).to.have.lengthOf(1);
            });
        
            it('should return the CAN(C) schedule if there is one present with the WTT, and no VAR (O)', () => {
                let associations = [
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'C',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    }
                ];
                
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'C');
                expect(association).to.have.lengthOf(1);
            });
    
            it('should return the CAN(C) schedule if there is one present with the WTT, and with VAR (O)', () => {
                let associations = [
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'C',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'O',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                ];
                
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'C');
                expect(association).to.have.lengthOf(1);
            });
        
            it('should return the STP(N) schedule if there is no CAN(C)', () => {
                let associations = [
                    {
                        'stp_indicator': 'N',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    }
                ];
    
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'N');
                expect(association).to.have.lengthOf(1);
            });
        
            it('should return the CAN(C) schedule if there is one present with the STP', () => {
                let associations = [
                    {
                        'stp_indicator': 'N',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'C',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    }
                ];
                
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'C');
                expect(association).to.have.lengthOf(1);
            });
    
            it('should return correct schedule regardless of order', () => {
                let associations = [
                    {
                        'stp_indicator': 'C',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'O',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                ];
                
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'C');
                expect(association).to.have.lengthOf(1);
            });
        });

        describe('Multiple', () => {
            it('should return the WTT(P) schedules if there is no VAR(O) or CAN(C)', () => {
                let associations = [
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    }
                ];
    
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'P');
                expect(association[1]).to.have.property('stp_indicator', 'P');
                expect(association).to.have.lengthOf(2);
            });
            
            it('should return the VAR(0) schedules if there is one present and no CAN(C) with the WTT', () => {
                let associations = [
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'O',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    },
                    {
                        'stp_indicator': 'O',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    }
                ];
    
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'O');
                expect(association[1]).to.have.property('stp_indicator', 'O');
                expect(association).to.have.lengthOf(2);
            });

            it('should return one VAR(0) schedule and one WWT(P) if there is one present and no CAN(C) with the WTT', () => {
                let associations = [
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    },
                    {
                        'stp_indicator': 'O',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    }
                ];
    
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'P');
                expect(association[1]).to.have.property('stp_indicator', 'O');
                expect(association).to.have.lengthOf(2);
            });
        
            it('should return the CAN(C) schedules if there is one present with the WTT, and no VAR (O)', () => {
                let associations = [
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'C',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    },
                    {
                        'stp_indicator': 'C',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    }
                ];
                
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'C');
                expect(association[1]).to.have.property('stp_indicator', 'C');
                expect(association).to.have.lengthOf(2);
            });
    
            it('should return the CAN(C) schedules if there is one present with the WTT, and with VAR (O)', () => {
                let associations = [
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'C',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'O',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    },
                    {
                        'stp_indicator': 'C',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    },
                    {
                        'stp_indicator': 'O',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    },
                ];
                
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'C');
                expect(association[1]).to.have.property('stp_indicator', 'C');
                expect(association).to.have.lengthOf(2);
            });

            it('should return one CAN(C) schedule and one VAR(0) schedule if there is one present with the WTT, and with VAR (O)', () => {
                let associations = [
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'C',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'O',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    },
                    {
                        'stp_indicator': 'O',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    },
                ];
                
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'C');
                expect(association[1]).to.have.property('stp_indicator', 'O');
                expect(association).to.have.lengthOf(2);
            });
        
            it('should return the STP(N) schedules if there is no CAN(C)', () => {
                let associations = [
                    {
                        'stp_indicator': 'N',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'N',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    }
                ];
    
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'N');
                expect(association[1]).to.have.property('stp_indicator', 'N');
                expect(association).to.have.lengthOf(2);
            });
        
            it('should return the CAN(C) schedules if there is one present with the STP', () => {
                let associations = [
                    {
                        'stp_indicator': 'N',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'C',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'N',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    },
                    {
                        'stp_indicator': 'C',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    }
                ];
                
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'C');
                expect(association[1]).to.have.property('stp_indicator', 'C');
                expect(association).to.have.lengthOf(2);
            });
    
            it('should return correct schedules regardless of order', () => {
                let associations = [
                    {
                        'stp_indicator': 'C',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'O',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'B12345'
                    },
                    {
                        'stp_indicator': 'C',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    },
                    {
                        'stp_indicator': 'O',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    },
                    {
                        'stp_indicator': 'P',
                        'main_train': 'A12345',
                        'assoc_train': 'C12345'
                    }
                ];
                
                let association = associationFormatting.filterValidSTPIndicators(associations);
    
                expect(association[0]).to.have.property('stp_indicator', 'C');
                expect(association[1]).to.have.property('stp_indicator', 'C');
                expect(association).to.have.lengthOf(2);
            });
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
            expect(validSchedules[0]['associations']).to.be.an('array');
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
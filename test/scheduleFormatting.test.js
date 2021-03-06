const expect = require('chai').expect;
const { DateTime } = require('luxon');

describe('Schedules', function() {
    
    const scheduleFormatting = require('../src/scheduleFormatting.js');

    describe('Filter Valid Running Days', function() {
        describe('Sundays', () =>{
            
            
            it('should return a schedule for ******1', () => {
                const when = DateTime.fromObject({weekday: 7});
                let schedule = {
                    'running_days': '0000001'
                };
                
                schedule = scheduleFormatting.filterValidRunningDays(schedule, when);
                
                expect(schedule).to.be.true;
            });
            
            it('should not return a schedule for ******0', () => {
                const when = DateTime.fromObject({weekday: 7});
                let schedule = {
                    'running_days': '1111110'
                };

                schedule = scheduleFormatting.filterValidRunningDays(schedule, when);

                expect(schedule).to.be.false;
            });
        });
    
        describe('Mondays', () =>{
        
            it('should return a schedule for 1******', () => {
                const when = DateTime.fromObject({weekday: 1});
                let schedule = {
                    'running_days': '1000000'
                };
                
                schedule = scheduleFormatting.filterValidRunningDays(schedule, when);
                
                expect(schedule).to.be.true;
            });
            
            it('should not return a schedule for 0******', () => {
                const when = DateTime.fromObject({weekday: 1});
                let schedule = {
                    'running_days': '0111111'
                };

                schedule = scheduleFormatting.filterValidRunningDays(schedule, when);

                expect(schedule).to.be.false;
            });
        });
    
        describe('Saturdays', () =>{
        
            it('should return a schedule for *****1*', () => {
                const when = DateTime.fromObject({weekday: 6});
                let schedule = {
                    'running_days': '0000010'
                };
                
                schedule = scheduleFormatting.filterValidRunningDays(schedule, when);
                
                expect(schedule).to.be.true;
            });
            
            it('should not return a schedule for *****0*', () => {
                const when = DateTime.fromObject({weekday: 6});
                let schedule = {
                    'running_days': '1111101'
                };

                schedule = scheduleFormatting.filterValidRunningDays(schedule, when);

                expect(schedule).to.be.false;
            });
        });
    
    });

    describe('Filter Valid Running Day (Multiple)', function() {
        beforeEach(() => {
            Date.prototype.getDay = function() { return 6; };
        });

        it('should resolve when given an array of schedules', async () => {
            let schedules = [
                {'running_days': '1111101'},
                {'running_days': '0000010'},
                {'running_days': '0000010'},
                {'running_days': '1111101'},
                {'running_days': '0000010'},
            ];

            const when = DateTime.fromObject({weekday: 6});
            let validSchedules = await scheduleFormatting.filterValidRunningDaysFromSchedules(schedules, when);
            expect(validSchedules).to.be.an('array');
            expect(validSchedules).to.have.length(3);
        });
        
        it('should reject when not given an array of schedules', async () => {
            let schedules = {};
            
            try {
                await scheduleFormatting.filterValidRunningDaysFromSchedules(schedules);
            } catch (error) {
                expect(error).to.be.an('object');
                expect(error).to.have.all.keys(['message', 'status', 'details']);
            }
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
            let schedules = [
                {
                    'stp_indicator': 'P'
                }
            ];

            let schedule = scheduleFormatting.filterValidSTPIndicators(schedules);

            expect(schedule).to.have.property('stp_indicator', 'P');
        });
        
        it('should return the VAR(0) schedule if there is one present and no CAN(C) with the WTT', () => {
            let schedules = [
                {
                    'stp_indicator': 'P'
                },
                {
                    'stp_indicator': 'O'
                }
            ];

            let schedule = scheduleFormatting.filterValidSTPIndicators(schedules);

            expect(schedule).to.have.property('stp_indicator', 'O');
        });
    
        it('should return the CAN(C) schedule if there is one present with the WTT, and no VAR (O)', () => {
            let schedules = [
                {
                    'stp_indicator': 'P'
                },
                {
                    'stp_indicator': 'C'
                }
            ];
            
            let schedule = scheduleFormatting.filterValidSTPIndicators(schedules);

            expect(schedule).to.have.property('stp_indicator', 'C');
        });

        it('should return the CAN(C) schedule if there is one present with the WTT, and with VAR (O)', () => {
            let schedules = [
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
            
            let schedule = scheduleFormatting.filterValidSTPIndicators(schedules);

            expect(schedule).to.have.property('stp_indicator', 'C');
        });

        it('should return the VAR(O) schedule if that is the only one present', () => {
            let schedules = [
                {
                    'stp_indicator': 'O'
                },
            ];
            
            let schedule = scheduleFormatting.filterValidSTPIndicators(schedules);

            expect(schedule).to.have.property('stp_indicator', 'O');
        });
    
        it('should return the STP(N) schedule if there is no CAN(C)', () => {
            let schedules = [
                {
                    'stp_indicator': 'N'
                }
            ];

            let schedule = scheduleFormatting.filterValidSTPIndicators(schedules);

            expect(schedule).to.have.property('stp_indicator', 'N');
        });
    
        it('should return the CAN(C) schedule if there is one present with the STP', () => {
            let schedules = [
                {
                    'stp_indicator': 'N'
                },
                {
                    'stp_indicator': 'C'
                }
            ];
            
            let schedule = scheduleFormatting.filterValidSTPIndicators(schedules);

            expect(schedule).to.have.property('stp_indicator', 'C');
        });


        it('should return correct schedule regardless of order', () => {
            let schedules = [
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
            
            let schedule = scheduleFormatting.filterValidSTPIndicators(schedules);

            expect(schedule).to.have.property('stp_indicator', 'C');
        });
    
    });

    describe('Filter STP Validity (Multiple)', function() {

        it('should resolve with an array of valid schedules when given a mixed array of schedules', async () => {
            let schedules = [
                {'uid': 'A', 'stp_indicator': 'P'},
                {'uid': 'A', 'stp_indicator': 'C'},
                {'uid': 'B', 'stp_indicator': 'P'},
                {'uid': 'B', 'stp_indicator': 'C'},
                {'uid': 'B', 'stp_indicator': 'O'},
                {'uid': 'C', 'stp_indicator': 'P'},
                {'uid': 'D', 'stp_indicator': 'P'},
                {'uid': 'D', 'stp_indicator': 'O'},
            ];

            let validSchedules = await scheduleFormatting.filterValidSTPIndicatorsFromSchedules(schedules);
            expect(validSchedules).to.be.length(4);
        });
    });
    
});
const expect = require('chai').expect;

describe('Schedules', function() {
    
    const scheduleFormatting = require('../src/scheduleFormatting.js');

    describe('Filter Valid Running Days', function() {
        describe('Sundays', () =>{
            
            beforeEach(() => {
                Date.prototype.getDay = function() { return 0; };
            });
            
            it('should return a schedule for ******1', () => {
                let schedule = {
                    'running_days': '0000001'
                };
                
                schedule = scheduleFormatting.filterValidRunningDays(schedule);

                expect(schedule).to.be.true;
            });
            
            it('should not return a schedule for ******0', () => {
                let schedule = {
                    'running_days': '1111110'
                };

                schedule = scheduleFormatting.filterValidRunningDays(schedule);

                expect(schedule).to.be.false;
            });
        });
    
        describe('Mondays', () =>{
            beforeEach(() => {
                Date.prototype.getDay = function() { return 1; };
            });
        
            it('should return a schedule for 1******', () => {
                let schedule = {
                    'running_days': '1000000'
                };
                
                schedule = scheduleFormatting.filterValidRunningDays(schedule);

                expect(schedule).to.be.true;
            });
            
            it('should not return a schedule for 0******', () => {
                let schedule = {
                    'running_days': '0111111'
                };

                schedule = scheduleFormatting.filterValidRunningDays(schedule);

                expect(schedule).to.be.false;
            });
        });
    
        describe('Saturdays', () =>{
            beforeEach(() => {
                Date.prototype.getDay = function() { return 6; };
            });
        
            it('should return a schedule for *****1*', () => {
                let schedule = {
                    'running_days': '0000010'
                };
                
                schedule = scheduleFormatting.filterValidRunningDays(schedule);

                expect(schedule).to.be.true;
            });
            
            it('should not return a schedule for *****0*', () => {
                let schedule = {
                    'running_days': '1111101'
                };

                schedule = scheduleFormatting.filterValidRunningDays(schedule);

                expect(schedule).to.be.false;
            });
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
            expect(true).to.be.false;
        });
        
        it('should return the VAR(0) schedule if there is one present and no CAN(C) with the WTT', () => {
            expect(true).to.be.false;
        });
    
        it('should return the CAN(C) schedule if there is one present with the WTT', () => {
            expect(true).to.be.false;
        });
    
        it('should return the STP(N) schedule if there is no CAN(C)', () => {
            expect(true).to.be.false;
        });
    
        it('should return the CAN(C) schedule if there is one present with the STP', () => {
            expect(true).to.be.false;
        });
    
    });
    
    describe('Create Station Board', function() {

        it('should only return the most basic fields', () =>{
            expect(true).to.be.false;
        });
        
    });

    describe('Basic Details', function() {
        
        it('should only return the most basic fields', () =>{
            expect(true).to.be.false;
        });

    });
});
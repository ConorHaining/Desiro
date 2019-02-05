const { DateTime } = require("luxon");

var scheduleFormatting = {
    formatBoard: (documents, options) => {

        return new Promise((resolve, reject) => {

            let board = {};

        documents.forEach(document => {
            let boardRecord = {};
            
            let todaysIndex = module.exports.getRunningDayIndex();
            if(document['_source']['running_days'].charAt(todaysIndex) === '1'){
                if(options.board == "departure") {
                
                    let lastLocationRecord = document['_source']['location_records'][document['_source']['location_records'].length - 1];
                    boardRecord['destination'] = module.exports.properCase(lastLocationRecord['location'][0]['name']);
    
                } else {
    
                    let firstLocationRecord = document['_source']['location_records'][0];
                    boardRecord['origin'] = module.exports.properCase(firstLocationRecord['location'][0]['name']);
    
                }
    
    
                let locationRecords = document['_source']['location_records'];
                for (let i = 0; i < locationRecords.length; i++) {
                    const record = locationRecords[i];
    
                    if(record['tiploc'] == options.tiploc) {

                        if(options.board == "departure") {
                            boardRecord['departure_time'] = record['public_departure'];
                        } else {
                            boardRecord['arrival_time'] = record['public_arrival'];
                        }
                        
                        boardRecord['platform'] = record['platform'];
                        
                        break;
                    }
                    
                }

                boardRecord['uid'] = document['_source']['uid'];
                boardRecord['operator'] = module.exports.getOperatorName(document['_source']['atoc_code']);
                
            }
            
            if (!(boardRecord['uid'] in board) && boardRecord['uid'] !== undefined) {
                // If it's not on the board, add it

                board[boardRecord['uid']] = boardRecord;

            } else if (boardRecord['stp'] == 'O' && boardRecord['uid'] in board && board[boardRecord['uid']]['stp'] == 'P') {
                // If the new record is VAR(O), and it's UID is on the board, and the existing one is WTT(P); Replace it

                board[boardRecord['uid']] = boardRecord;

            } else if (boardRecord['stp'] == 'C' && boardRecord['uid'] in board && (board[boardRecord['uid']]['stp'] == 'P' || board[boardRecord['uid']]['stp'] == 'O')) {
                // If the new record is CAN(C), and it's UID is on the board, and the existing one is WTT(P) or VAR(O); Remove it

                delete board[boardRecord['uid']];
            }

        });

        resolve(board);

        });
    },

    applicableSchedule: (documents) => {
        
        return new Promise((resolve, reject) => {
            
            let correctSchedule = undefined;

            documents.forEach((document) => {

                let schedule = document['_source'];

                if (correctSchedule === undefined) {

                    correctSchedule = schedule;

                } else if (correctSchedule['stp_indicator'] == 'P' && (schedule['stp_indicator'] == 'O' || schedule['stp_indicator'] == 'C')) {

                    correctSchedule = schedule;

                } else if (correctSchedule['stp_indicator'] == 'O' && schedule['stp_indicator'] == 'C') {
                    
                    correctSchedule = null;

                } 

            });

            for (let i = 0; i < correctSchedule['location_records'].length; i++) {
                const locationRecord = correctSchedule['location_records'][i];

                locationRecord['location'] = locationRecord['location'][0];
                delete locationRecord['location']['_index'];
                delete locationRecord['location']['_type'];
                delete locationRecord['location']['_id'];
                delete locationRecord['location']['_id'];
                
            }

            resolve(correctSchedule);

        });
        
    },

    combineMovements: (schedule, movements) => {

        return new Promise((resolve, reject) => {
            
            if (movements !== null) {

                for (let i = 0; i < movements.length; i++) {
                    const movement = movements[i];
                    let movementStanox = movement['_source']['stanox'];

                    if(movement['_source']['message_type'] === '0001') {
                        continue;
                    }

                    for (let j = 0; j < schedule['location_records'].length; j++) {
                        const locationRecord = schedule['location_records'][j];
                        let locationRecordStanox = locationRecord['location']['stanox'];
                        if (movementStanox == locationRecordStanox) {
                            let actualTimestamp = DateTime.fromMillis(movement['_source']['actual_timestamp']);

                            if (movement['_source']['event_type'] === 'ARRIVAL'){
                                locationRecord['actual_arrival'] = actualTimestamp.toFormat('HH:mm:ss');
                
                            } else if (movement['_source']['event_type'] === 'DEPARTURE') {
                                locationRecord['actual_departure'] = actualTimestamp.toFormat('HH:mm:ss');
                            }
                            
                        }
                    }
                }
            }

            resolve(schedule);

        });
    },

    thinLocationRecords: (schedule) => {
        
        return new Promise((resolve, reject) => {

            let locationRecords = schedule['location_records'];

            locationRecords = locationRecords
            .filter(locationRecord => locationRecord['public_departure'] != undefined || locationRecord['public_arrival'] != undefined)
            .map( async (locationRecord) => {
                locationRecord['name'] = module.exports.properCase(locationRecord['location']['name']);
                locationRecord['crs'] = locationRecord['location']['crs'];
                delete locationRecord['tiploc'];
                delete locationRecord['departure'];
                delete locationRecord['arrival'];
                delete locationRecord['pass'];
                delete locationRecord['line'];
                delete locationRecord['engineering_allowance'];
                delete locationRecord['pathing_allowance'];
                delete locationRecord['path'];
                delete locationRecord['location'];
                delete locationRecord['type'];
                
                return locationRecord;
            });

            Promise.all(locationRecords)
                .then((locationRecords) => {
                    schedule['location_records'] = locationRecords;

                    resolve(schedule);
                });            

        });
        
    },

    thinSchedule: (schedule) => {

        return new Promise((resolve, reject) => {

            schedule['operator'] = module.exports.getOperatorName(schedule['atoc_code']);

            delete schedule['traction_class'];
            delete schedule['uic_code'];
            delete schedule['portion_id'];
            delete schedule['applicable_timetable'];
            delete schedule['start_date'];
            delete schedule['end_start'];
            delete schedule['signalling_id'];
            delete schedule['headcode'];
            delete schedule['course_indicator'];
            delete schedule['train_service_code'];
            delete schedule['speed'];
            delete schedule['connection_indicator'];
            delete schedule['running_days'];
            delete schedule['bank_holiday_running'];
            delete schedule['service_branding'];
            delete schedule['stp_indicator'];
            delete schedule['atoc_code'];

            resolve(schedule);

        });

    },

    /**
     * Helpers
     */
    getRunningDayIndex: () => {
        let todaysIndex = new Date().getDay() - 1;

        if(todaysIndex < 0) {
            todaysIndex = 6;
        }

        return todaysIndex;

    },

    getOperatorName: (atocCode) => {

        switch (atocCode) {
            case 'AR':
                return 'Balfour Beatty Rail Ltd.';
            case 'NT':
                return 'Northern';
            case 'AW':
                return 'Transport for Wales';
            case 'CC':
                return 'c2c';
            case 'CS':
                return 'Caledonian Sleeper';
            case 'CH':
                return 'Chiltern Railway';
            case 'XC':
                return 'CrossCountry';
            case 'ZZ':
                return 'Devon and Cornwall Railways';
            case 'EM':
                return 'East Midlands Trains';
            case 'ES':
                return 'Eurostar';
            case 'FC':
                return 'First Capital Connect (defunct)';
            case 'HT':
                return 'First Hull Trains';
            case 'GX':
                return 'Gatwick Express';
            case 'ZZ':
                return 'GB Railfreight';
            case 'GN':
                return 'Great Northern';
            case 'TL':
                return 'Thameslink';
            case 'GC':
                return 'Grand Central';
            case 'LN':
                return 'Great North Western Railway';
            case 'GW':
                return 'Great Western Railway';
            case 'LE':
                return 'Greater Anglia';
            case 'HC':
                return 'Heathrow Connect';
            case 'HX':
                return 'Heathrow Express';
            case 'IL':
                return 'Island Lines';
            case 'LS':
                return 'Locomotive Services';
            case 'LM':
                return 'London Midland';
            case 'LO':
                return 'London Overground';
            case 'LT':
                return 'LUL Bakerloo Line';
            case 'LT':
                return 'LUL District Line – Richmond';
            case 'LT':
                return 'LUL District Line – Wimbledon';
            case 'ME':
                return 'Merseyrail';
            case 'LR':
                return 'Network Rail (On-Track Machines)';
            case 'TW':
                return 'Nexus (Tyne & Wear Metro)';
            case 'NY':
                return 'North Yorkshire Moors Railway';
            case 'SR':
                return 'ScotRail';
            case 'SW':
                return 'South Western Railway';
            case 'SJ':
                return 'South Yorkshire Supertram';
            case 'SE':
                return 'Southeastern';
            case 'SN':
                return 'Southern';
            case 'SP':
                return 'Swanage Railway';
            case 'XR':
                return 'TfL Rail';
            case 'TP':
                return 'TransPennine Express';
            case 'VT':
                return 'Virgin Trains';
            case 'GR':
                return 'London North Eastern Railway';
            case 'WR':
                return 'West Coast Railway Co.';
        
            default:
                return 'Unknown Operator';
        }

    },

    properCase: (str) => {
        return str.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }
}

module.exports = scheduleFormatting;
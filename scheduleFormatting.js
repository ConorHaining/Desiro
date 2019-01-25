var scheduleFormatting = {
    formatBoard: (documents, options) => {

        let board = {};

        documents.forEach(document => {
            let boardRecord = {};

            let todaysIndex = module.exports.getRunningDayIndex();
            if(document['_source']['running_days'].charAt(todaysIndex) === '1'){
                if(options.board == "departure") {
                
                    let lastLocationRecord = document['_source']['location_records'][document['_source']['location_records'].length - 1];
                    boardRecord['destination'] = lastLocationRecord['location'][0]['name'];
    
                } else {
    
                    let firstLocationRecord = document['_source']['location_records'][0];
                    boardRecord['origin'] = firstLocationRecord['location'][0]['name'];
    
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
                boardRecord['stp'] = document['_source']['stp_indicator'];
                boardRecord['operator'] = document['_source']['atoc_code'];
                boardRecord['running_days'] = document['_source']['running_days'];
                
            }
            console.log(boardRecord['uid']);
            if (!(boardRecord['uid'] in board)) {
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

        return board;
    },


    /**
     * Helpers
     */
    getRunningDayIndex: () => {
        let todaysIndex = new Date().getDay() - 1;

        if(todaysIndex < 0) {
            todaysIndex = 7;
        }

        return todaysIndex;

    }
}

module.exports = scheduleFormatting;
const { DateTime } = require('luxon');
const helpers = require('./helpers.js');

class JourneyBoard {

    static createBoard(schedule) {
        const board = new JourneyBoard(schedule);

        return Promise.resolve(board.board);
    }

    constructor (schedule) {
        this.board = {};

        if (schedule.location_records) {
            this.locations = this.createJourneyLocations(schedule['location_records']);
        }

        if (schedule.uid) {
            this.board.uid = schedule.uid;
        }

        if (schedule.train_category) {
            this.board.category = schedule.train_category;
        }

        if (schedule.atoc_code) {
            this.board.operator = schedule.atoc_code;
        }

    }

    createJourneyLocations(records) {
        let locations = [];

        if (records === undefined) {
            return;
        }

        locations = records
                    .filter(record => {return record.public_arrival || record.public_departure})
                    .map(record => {
            let item = {};

            item.platform = record.platform;
            if (record.location[0]) {
                item.station = {
                    'crs': record.location[0].crs,
                    'name': helpers.toProperCase(record.location[0].name)
                };
            }

            if (record.public_arrival) {
                item.public_arrival = DateTime.fromFormat(record.public_arrival, 'HH:mm:ss')
                                                .toFormat('HH:mm');
            }

            if (record.public_departure) {
                item.public_departure = DateTime.fromFormat(record.public_departure, 'HH:mm:ss')
                .toFormat('HH:mm');
            }

            if (record.MVTARRIVAL && record.MVTARRIVAL.actual_timestamp) {
                item.actual_arrival = DateTime.fromMillis(record.MVTARRIVAL.actual_timestamp).toFormat('HH:mm')
            }

            if (record.MVTDEPARTURE && record.MVTDEPARTURE.actual_timestamp) {
                item.actual_departure = DateTime.fromMillis(record.MVTDEPARTURE.actual_timestamp).toFormat('HH:mm')
            }

            if (record.MVTARRIVAL && record.MVTARRIVAL.timetable_variation_prediction && record.predicted_arrival) {
                item.actual_arrival = record.predicted_arrival;
            }

            if (record.MVTDEPARTURE && record.MVTDEPARTURE.timetable_variation_prediction && record.predicted_departure) {
                item.actual_departure = record.predicted_departure;
            }

            if (record.predicted_arrival && (!record.MVTARRIVAL || !record.MVTARRIVAL.actual_timestamp)) {
                item.predicted_arrival = record.predicted_arrival;
            }

            if (record.predicted_departure && (!record.MVTDEPARTURE || !record.MVTDEPARTURE.actual_timestamp)) {
                item.predicted_departure = record.predicted_departure;
            }

            if (record.MVTCancel) {
                this.board.cancelled = true;

                if(record.MVTCancel.cancel_reason_code) {
                    this.board.cancelCode = record.MVTCancel.cancel_reason_code;
                }

                if(record.location[0]) {
                    this.board.cancelledAt = item.station;
                }
            }

            if(this.board.cancelled) {
                item.cancelled = true;
            }
            
            
            return item;
        });
        
        this.board['locations'] = locations;
    }
}

module.exports = JourneyBoard;
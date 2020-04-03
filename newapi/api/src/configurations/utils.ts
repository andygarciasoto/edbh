import moment from 'moment';

export function createUnallocatedTime2(obj, tz, dt) {
    let actualElement = null;
    let actualUnallocatedTime = null;
    let actualAllocatedTime = null;
    obj.map((item, index) => {
        if (actualElement === null || actualElement.dxhdata_id === null || actualElement.dxhdata_id !== item.dxhdata_id && actualElement.started_on_chunck !== item.started_on_chunck) {
            actualElement = item;
            actualUnallocatedTime = actualElement.unallocated_time;
            actualAllocatedTime = actualElement.allocated_time;
            let base = moment(item.started_on_chunck).hours();
            let current = tz;
            let day = moment(dt, 'YYYYMMDD').format('YYYYMMDD');
            let today = moment().format('YYYYMMDD');
            let lunch_setup = item.summary_setup_minutes + item.summary_breakandlunch_minutes;
            let totalTime = lunch_setup ? 60 - lunch_setup : 60;
            if (totalTime < 0) {
                totalTime = 0;
            }
            if (lunch_setup > 60) {
                lunch_setup = 60;
            }
            let newIdeal = 0;
            let minutes = moment().minutes();

            if ((item.productiondata_id === '') || item.productiondata_id === undefined || item.productiondata_id === null) {
                actualUnallocatedTime = base == current && today == day ? minutes : totalTime + lunch_setup;
            }
            else if (Math.round(item.summary_adjusted_actual) >= Math.round(item.summary_ideal)) {
                actualUnallocatedTime = 0;
            }
            else if (base == current && day == today) {
                if (minutes > lunch_setup) {
                    newIdeal = item.summary_ideal * ((minutes - lunch_setup) / (totalTime));
                    if (item.summary_adjusted_actual < Math.round(newIdeal)) {
                        let idealTimeForPart = totalTime / item.summary_ideal;
                        let minimumTime = newIdeal * idealTimeForPart;
                        let actualTimeForPart = item.summary_adjusted_actual * idealTimeForPart;
                        actualUnallocatedTime = Math.round(minimumTime - actualTimeForPart);
                    } else {
                        actualUnallocatedTime = 0;
                    }
                } else {
                    actualUnallocatedTime = 0;
                }
            } else {
                if (item.summary_adjusted_actual === 0) {
                    actualUnallocatedTime = totalTime;
                } else {
                    let idealTimeForPart = totalTime / item.summary_ideal;
                    let actualTimeForPart = item.summary_adjusted_actual * idealTimeForPart;
                    actualUnallocatedTime = Math.round(totalTime - actualTimeForPart);
                }
            }
            actualAllocatedTime = actualUnallocatedTime - (lunch_setup + item.timelost_summary);
            if (actualAllocatedTime < 0) {
                actualAllocatedTime = 0;
            }
            if (actualUnallocatedTime > 60) {
                actualUnallocatedTime = 60;
            }
            actualElement.unallocated_time = actualUnallocatedTime;
            actualElement.allocated_time = actualAllocatedTime;
        } else {
            item.unallocated_time = actualUnallocatedTime;
            item.allocated_time = actualAllocatedTime;
        }
    });
    return obj;
}
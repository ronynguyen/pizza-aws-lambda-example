'use strict'

const parsePayload = record => {
    const json = new Buffer(record.kinesis.data, 'base64').toString('utf8');
    const json2 = new Buffer(record.kinesis.data, 'base64').toString('utf8');
    console.log("json1 -> ", json);
    console.log("json2 -> ", json2);
    return JSON.parse(json)
}

module.exports.getRecords = event => {
    return event.Records.map(parsePayload);
}
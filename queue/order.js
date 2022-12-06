'use strict'

const AWS = require('aws-sdk');
const ses = new AWS.SES({
    region: process.env.region
});

const CAKE_PRODUCER_EMAIL = process.env.cakeProducerEmail;
const ORDERING_SYSTEM_EMAIL = process.env.orderingSystemEmail;

module.exports.handlePlacedOrders = orders => {
    var ordersPromises = [];

    console.log("handlePlacedOrders -> ", orders);

    for (let order of orders) {
        const temp = notifyCakeProducerByEmail(order);
        ordersPromises.push(temp);
    }

    return Promise.all(ordersPromises);
}

const notifyCakeProducerByEmail = order => {
    const params = {
        Destination: {
            ToAddresses: [CAKE_PRODUCER_EMAIL]
        },
        Message: {
            Body: {
                Text: {
                    Data: JSON.stringify(order)
                }
            },
            Subject: {
                Data: 'New order is initiated'
            }
        },
        Source: ORDERING_SYSTEM_EMAIL
    };
    console.log("notify cake producer by emial, ", params);
    return ses.sendEmail(params).promise().then((data) => {
        return data;
    });
}
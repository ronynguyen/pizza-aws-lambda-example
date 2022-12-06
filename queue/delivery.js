'use strict'

const orderService = require('../service/order');

const AWS = require('aws-sdk');
const sqs = new AWS.SQS({
    region: process.env.region
});

const DELIVERY_COMPANY_QUEUE = process.env.deliveryCompanyQueue;

module.exports.deliveryOrder = orders => {
   
    console.log("deliveryOrder -> ", orders);
    var orderFulfilledPromises = [];

    for (let order of orders) {
        const temp = orderService.updateOrderForDelivery(order.orderId).then(updatedOrder => {
            orderService.saveOrder(updatedOrder).then(() => {
                notifyDeliveryCompany(updatedOrder);
            });
        });

        orderFulfilledPromises.push(temp);
    };

    return Promise.all(orderFulfilledPromises);
}

const notifyDeliveryCompany = order => {
    const params = {
        MessageBody: JSON.stringify(order),
        QueueUrl: DELIVERY_COMPANY_QUEUE
    };
    console.log("notify delivery compnaym ", params);
    return sqs.sendMessage(params).promise();
}
'use strict'

const orderUtil = require('../util/order');
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const kinesis = new AWS.Kinesis();

const ORDER_TABLE_NAME = process.env.orderTableName;
const ORDER_KSTREAM_NAME = process.env.orderTableStreamName;

module.exports.createOrder = order => {
    return saveOrder(order)
    .then(() => sendToStream(order));
}

module.exports.fulfillmentOrder = async (order, fulfillmentBody) => {
    const orderFulfillment = orderUtil.fulfillOrder(order, fulfillmentBody);
    return saveOrder(orderFulfillment)
    .then(() => sendToStream(order));
}

module.exports.getOrder = async(orderId) => {
    return getOrder(orderId);
}

module.exports.saveOrder = order => {
    return saveOrder(order);
}

module.exports.updateOrderForDelivery = orderId => {
    return getOrder(orderId).then(order => {
        order.sentToDeliveryDate = Date.now();
        return order;
    });
}

const getOrder = orderId => {
    const params = {
        Key: {
            id: orderId
        },
        TableName: ORDER_TABLE_NAME
    }
    return dynamoDB.get(params).promise().then(result => result.Item);
}
const saveOrder = order => {
    const item = {
        TableName: ORDER_TABLE_NAME,
        Item: order
    }
    return dynamoDB.put(item).promise();
}


const sendToStream = order => {
    const item = {
        Data: JSON.stringify(order),
        PartitionKey: order.id,
        StreamName: ORDER_KSTREAM_NAME
    }
    return kinesis.putRecord(item).promise();
}
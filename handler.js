'use strict';

const orderUtil = require('util/order');
const kinesisUtil = require('util/kinesis');

const orderManager = require('queue/order');
const deliveryManager = require('queue/delivery');


const orderService = require("./service/order");
const AWS = require('aws-sdk');

const createResponse = (code, body) => {
  const response = {
    statusCode: code,
    headers: {
      "Content-Type" : "application/json"
    },
    body: JSON.stringify(body),
  };
  return response;
}

module.exports.orderPlace = async (event) => {
  
  const requestBody = JSON.parse(event.body);
  const uuid = AWS.util.uuid.v4();
  const order = orderUtil.buildOrder(uuid, requestBody);

  return orderService.createOrder(order)
  .then(ds => { 
      return createResponse(200, {...order, ...ds});
  })
  .catch(err => {
      console.log("ERROR , ", err);
      return createResponse(500, err);
  })

};

module.exports.orderFulfillment = async (event) => {
  const orderId = event["pathParameters"]["id"];
  const fulfillBody = JSON.parse(event.body);
  const order = await orderService.getOrder(orderId);

  return orderService.fulfillmentOrder(order, fulfillBody)
  .then(ds => {
    return createResponse(200, {...order, ...ds})
  })
  .catch(err => {
    console.log("ERROR , ", err);
    return createResponse(500, err);
  }); 
};

module.exports.orderDelivered = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Order Delivered!',
        input: event,
      },
      null,
      2
    ),
  };
  return response;
};

module.exports.notifyParties = async (event) => {
  console.log("notifying to parties", event);
  const records = kinesisUtil.getRecords(event);

  console.log("notifying to parties - records ", records);

  const producerPromise = getProducerPromise(records);
  const deliveryPromise = getDeliveryPromise(records);

  return Promise.all([producerPromise, deliveryPromise]).then(() => {
    return 'everything went well'
  }).catch(error => {
    return error;
  })
}

module.exports.notifyDeliveryCompany = async (event) => {
  console.log('Invoke delivery company endpoint')
  return 'done';
}

const getProducerPromise = records => {
  const orders = records.filter(r => r.status === 'order_created');

  if (orders.length > 0) {
    return orderManager.handlePlacedOrders(orders);
  } else {
    return null;
  }
}

const getDeliveryPromise = records => {
  const orders = records.filter(r => r.status === 'order_to_receive');

  if (orders.length > 0) {
    return deliveryManager.deliveryOrder(orders);
  } else {
    return null;
  }
}
'use strict'

module.exports.buildOrder = (uuid, body) => {
    return {
        id: uuid,
        name: body.name,
        type: body.type,
        address: body.address,
        productId: body.productId,
        quantity: body.quantity,
        orderDate: getCurrentDatetime(),
        status: 'order_created',
    }
}

module.exports.fulfillOrder = (order, fulfillBody) => {
    const description = fulfillBody.description;
    order.description = description;
    order.fulfillmentDate = getCurrentDatetime();
    order.status = 'order_to_receive';
    return order;
}

module.exports.fulfillOrder1 = (order, fulfillBody) => {
    const description = fulfillBody.description;
    order.description = description;
    order.fulfillmentDate = getCurrentDatetime();
    order.eventType = 'order_to_receive';
    return order;
}

const getCurrentDatetime = () => {
    const datetime = new Date();
    return datetime.toISOString();
}
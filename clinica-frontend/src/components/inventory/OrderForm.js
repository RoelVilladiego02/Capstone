import React, { useState } from 'react';

const OrderForm = () => {
  const [order, setOrder] = useState({
    itemName: '',
    quantity: '',
    supplier: '',
    urgency: 'normal'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Order submitted:', order);
  };

  return (
    <div className="card mt-3">
      <div className="card-body">
        <h5 className="card-title">Place New Order</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Item Name"
              value={order.itemName}
              onChange={(e) => setOrder({...order, itemName: e.target.value})}
            />
          </div>
          <div className="mb-3">
            <input
              type="number"
              className="form-control"
              placeholder="Quantity"
              value={order.quantity}
              onChange={(e) => setOrder({...order, quantity: e.target.value})}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;

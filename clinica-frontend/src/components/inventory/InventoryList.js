import React, { useState } from 'react';

const InventoryList = () => {
  const [inventory] = useState([
    { id: 1, name: 'Surgical Masks', quantity: 1000, reorderPoint: 200 },
    { id: 2, name: 'Disposable Gloves', quantity: 500, reorderPoint: 100 },
    { id: 3, name: 'Syringes', quantity: 200, reorderPoint: 50 }
  ]);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Inventory Items</h5>
        <button className="btn btn-primary btn-sm">Add New Item</button>
      </div>
      <div className="card-body">
        <table className="table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>
                  <span className={`badge ${item.quantity <= item.reorderPoint ? 'bg-danger' : 'bg-success'}`}>
                    {item.quantity <= item.reorderPoint ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                  <button className="btn btn-sm btn-outline-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryList;

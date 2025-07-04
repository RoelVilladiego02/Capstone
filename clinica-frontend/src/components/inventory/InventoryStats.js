import React from 'react';

const InventoryStats = () => {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Inventory Overview</h5>
        <div className="row">
          <div className="col-6">
            <div className="stats-card">
              <h6>Total Items</h6>
              <h3>245</h3>
            </div>
          </div>
          <div className="col-6">
            <div className="stats-card">
              <h6>Low Stock</h6>
              <h3>12</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryStats;

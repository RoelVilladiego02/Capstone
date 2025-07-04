import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const StockReports = () => {
  const { currentUser } = useAuth();

  // Redirect if not logged in or not an Inventory Manager
  if (!currentUser || currentUser.role !== 'InventoryManager') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Stock Reports</h2>
      
      <div className="row g-4">
        {/* Summary Cards */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted">Total Items</h6>
              <h3 className="mb-0">245</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted">Low Stock Items</h6>
              <h3 className="mb-0">12</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted">Out of Stock</h6>
              <h3 className="mb-0">5</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted">Total Value</h6>
              <h3 className="mb-0">$24,500</h3>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Stock Level Report</h5>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Minimum Level</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Acetaminophen</td>
                      <td>Medication</td>
                      <td>150</td>
                      <td>50</td>
                      <td><span className="badge bg-success">Normal</span></td>
                      <td>2023-11-20</td>
                    </tr>
                    <tr>
                      <td>Surgical Masks</td>
                      <td>Supplies</td>
                      <td>45</td>
                      <td>100</td>
                      <td><span className="badge bg-warning">Low Stock</span></td>
                      <td>2023-11-19</td>
                    </tr>
                    <tr>
                      <td>Blood Pressure Monitor</td>
                      <td>Equipment</td>
                      <td>0</td>
                      <td>5</td>
                      <td><span className="badge bg-danger">Out of Stock</span></td>
                      <td>2023-11-18</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockReports;

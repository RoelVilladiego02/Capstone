import React, { useState } from 'react';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = [
    {
      id: 'PO-2024-001',
      date: '2024-02-15',
      supplier: 'Medical Supplies Co.',
      items: [
        { name: 'Surgical Masks', quantity: 1000, price: 5 },
        { name: 'Gloves', quantity: 500, price: 10 }
      ],
      total: 10000,
      status: 'Pending',
      priority: 'High'
    },
    {
      id: 'PO-2024-002',
      date: '2024-02-14',
      supplier: 'PharmaCare Inc.',
      items: [
        { name: 'Syringes', quantity: 200, price: 15 }
      ],
      total: 3000,
      status: 'Approved',
      priority: 'Medium'
    }
  ];

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Approved': return 'bg-success';
      case 'Delivered': return 'bg-info';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Purchase Orders</h4>
          <p className="text-muted mb-0">Manage all purchase orders</p>
        </div>
        <button 
          className="btn" 
          style={{ backgroundColor: '#E31937', color: 'white' }}
          onClick={() => setShowOrderModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>New Order
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td>{order.supplier}</td>
                    <td>₱{order.total.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${
                        order.priority === 'High' ? 'danger' :
                        order.priority === 'Medium' ? 'warning' : 'info'
                      }`}>
                        {order.priority}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleViewOrder(order)}
                      >
                        View Details
                      </button>
                      {order.status === 'Pending' && (
                        <button className="btn btn-sm btn-outline-success">
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedOrder ? `Order Details - ${selectedOrder.id}` : 'New Purchase Order'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {selectedOrder ? (
                  <>
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Supplier:</strong> {selectedOrder.supplier}</p>
                        <p className="mb-1"><strong>Date:</strong> {selectedOrder.date}</p>
                        <p className="mb-1">
                          <strong>Status:</strong> 
                          <span className={`badge ${getStatusBadgeClass(selectedOrder.status)} ms-2`}>
                            {selectedOrder.status}
                          </span>
                        </p>
                      </div>
                      <div className="col-md-6 text-md-end">
                        <p className="mb-1">
                          <strong>Priority:</strong>
                          <span className={`badge bg-${
                            selectedOrder.priority === 'High' ? 'danger' :
                            selectedOrder.priority === 'Medium' ? 'warning' : 'info'
                          } ms-2`}>
                            {selectedOrder.priority}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item, index) => (
                            <tr key={index}>
                              <td>{item.name}</td>
                              <td>{item.quantity}</td>
                              <td>₱{item.price}</td>
                              <td>₱{(item.quantity * item.price).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                            <td><strong>₱{selectedOrder.total.toLocaleString()}</strong></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                ) : (
                  <form>
                    {/* New Order Form Fields */}
                    <div className="mb-3">
                      <label className="form-label">Supplier</label>
                      <select className="form-select">
                        <option value="">Select supplier</option>
                        <option>Medical Supplies Co.</option>
                        <option>PharmaCare Inc.</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Priority</label>
                      <select className="form-select">
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Items</label>
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><input type="text" className="form-control form-control-sm" /></td>
                            <td><input type="number" className="form-control form-control-sm" /></td>
                            <td><input type="number" className="form-control form-control-sm" /></td>
                            <td>
                              <button type="button" className="btn btn-sm btn-outline-danger">
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <button type="button" className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-plus-lg me-2"></i>Add Item
                      </button>
                    </div>
                  </form>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                >
                  Close
                </button>
                {selectedOrder ? (
                  selectedOrder.status === 'Pending' && (
                    <button 
                      type="button" 
                      className="btn"
                      style={{ backgroundColor: '#E31937', color: 'white' }}
                    >
                      Approve Order
                    </button>
                  )
                ) : (
                  <button 
                    type="submit" 
                    className="btn"
                    style={{ backgroundColor: '#E31937', color: 'white' }}
                  >
                    Create Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

import React, { useState } from 'react';

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const suppliers = [
    {
      id: 1,
      name: 'Medical Supplies Co.',
      contactPerson: 'John Smith',
      email: 'john@medicalsupplies.com',
      phone: '+1234567890',
      address: '123 Supply Street, Medical District',
      category: 'Medical Equipment',
      status: 'Active',
      rating: 4.5,
      lastOrder: '2024-02-15'
    },
    {
      id: 2,
      name: 'PharmaCare Inc.',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@pharmacare.com',
      phone: '+0987654321',
      address: '456 Pharma Avenue, Health District',
      category: 'Pharmaceuticals',
      status: 'Active',
      rating: 4.8,
      lastOrder: '2024-02-10'
    }
  ];

  const handleSupplierAction = (supplier, action) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Suppliers Management</h4>
          <p className="text-muted mb-0">Manage and track all supplier relationships</p>
        </div>
        <button 
          className="btn" 
          style={{ backgroundColor: '#E31937', color: 'white' }}
          onClick={() => handleSupplierAction(null, 'add')}
        >
          <i className="bi bi-plus-lg me-2"></i>Add Supplier
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
                  placeholder="Search suppliers..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Name</th>
                  <th>Contact Person</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Last Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(supplier => (
                  <tr key={supplier.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar me-2">
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                               style={{ width: '40px', height: '40px' }}>
                            {supplier.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <div className="fw-medium">{supplier.name}</div>
                          <small className="text-muted">{supplier.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>{supplier.contactPerson}</td>
                    <td>{supplier.category}</td>
                    <td>
                      <span className={`badge ${supplier.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{supplier.rating}</span>
                        <div className="text-warning">
                          {[...Array(5)].map((_, index) => (
                            <i key={index} className={`bi bi-star${index < supplier.rating ? '-fill' : ''}`}></i>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td>{new Date(supplier.lastOrder).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleSupplierAction(supplier, 'view')}
                        >
                          <i className="bi bi-eye me-1"></i>View
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleSupplierAction(supplier, 'edit')}
                        >
                          <i className="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleSupplierAction(supplier, 'delete')}
                        >
                          <i className="bi bi-trash me-1"></i>Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Supplier Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedSupplier ? `Edit Supplier - ${selectedSupplier.name}` : 'Add New Supplier'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Supplier Name</label>
                      <input 
                        type="text" 
                        className="form-control"
                        defaultValue={selectedSupplier?.name}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <select className="form-select" defaultValue={selectedSupplier?.category}>
                        <option>Medical Equipment</option>
                        <option>Pharmaceuticals</option>
                        <option>Laboratory Supplies</option>
                        <option>Office Supplies</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Contact Person</label>
                      <input 
                        type="text" 
                        className="form-control"
                        defaultValue={selectedSupplier?.contactPerson}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input 
                        type="email" 
                        className="form-control"
                        defaultValue={selectedSupplier?.email}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input 
                        type="tel" 
                        className="form-control"
                        defaultValue={selectedSupplier?.phone}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select className="form-select" defaultValue={selectedSupplier?.status}>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        defaultValue={selectedSupplier?.address}
                      ></textarea>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn"
                  style={{ backgroundColor: '#E31937', color: 'white' }}
                >
                  {selectedSupplier ? 'Update Supplier' : 'Add Supplier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;

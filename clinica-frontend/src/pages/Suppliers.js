import React, { useState, useEffect } from 'react';
import { supplierService } from '../services/supplierService';

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formSupplier, setFormSupplier] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    status: 'Active',
    rating: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const supplierList = await supplierService.getAllSuppliers();
        setSuppliers(supplierList);
      } catch (err) {
        setError(err.message || 'Failed to load suppliers');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // CRUD Handlers
  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const supplier = await supplierService.createSupplier(formSupplier);
      setSuppliers([supplier, ...suppliers]);
      setShowModal(false);
      setFormSupplier({ name: '', contact_name: '', email: '', phone: '', address: '', category: '', status: 'Active', rating: 0 });
    } catch (err) {
      setError(err.message || 'Failed to add supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSupplier = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updated = await supplierService.updateSupplier(selectedSupplier.id, formSupplier);
      setSuppliers(suppliers.map(s => s.id === updated.id ? updated : s));
      setShowModal(false);
      setSelectedSupplier(null);
    } catch (err) {
      setError(err.message || 'Failed to update supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      setLoading(true);
      await supplierService.deleteSupplier(id);
      setSuppliers(suppliers.filter(s => s.id !== id));
      setShowModal(false);
      setSelectedSupplier(null);
    } catch (err) {
      setError(err.message || 'Failed to delete supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierAction = (supplier, action) => {
    if (action === 'add') {
      setFormSupplier({ name: '', contact_name: '', email: '', phone: '', address: '', category: '', status: 'Active', rating: 0 });
      setSelectedSupplier(null);
      setShowModal(true);
    } else if (action === 'edit') {
      setFormSupplier({
        name: supplier.name,
        contact_name: supplier.contact_name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        category: supplier.category,
        status: supplier.status,
        rating: supplier.rating
      });
      setSelectedSupplier(supplier);
      setShowModal(true);
    } else if (action === 'delete') {
      handleDeleteSupplier(supplier.id);
    } else if (action === 'view') {
      setFormSupplier({
        name: supplier.name,
        contact_name: supplier.contact_name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        category: supplier.category,
        status: supplier.status,
        rating: supplier.rating
      });
      setSelectedSupplier(supplier);
      setShowModal(true);
    }
  };

  // Filtering
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || supplier.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container-fluid py-4 bg-light">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading suppliers...</p>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container-fluid py-4 bg-light">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-light">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-0">Suppliers Management</h2>
              <p className="text-muted mb-0">Manage and track all supplier relationships</p>
            </div>
            <button 
              className="btn rounded-pill"
              style={{ backgroundColor: '#E31937', color: 'white' }}
              onClick={() => handleSupplierAction(null, 'add')}
            >
              <i className="bi bi-plus-lg me-2"></i>Add Supplier
            </button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-lg">
        <div className="card-header bg-white py-3 border-0">
          <div className="row g-3 align-items-end">
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
                {filteredSuppliers.map(supplier => (
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
                    <td>{supplier.contact_name}</td>
                    <td>
                      <span className="badge rounded-pill bg-light text-dark border">
                        {supplier.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${supplier.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{supplier.rating}</span>
                        <div className="text-warning">
                          {[...Array(5)].map((_, index) => (
                            <i key={index} className={`bi bi-star${index < Math.round(supplier.rating) ? '-fill' : ''}`}></i>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td>{supplier.last_order_date ? new Date(supplier.last_order_date).toLocaleDateString() : 'N/A'}</td>
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
                {filteredSuppliers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div className="py-5">
                        <i className="bi bi-inbox fs-1 text-muted"></i>
                        <h5 className="mt-3">No suppliers found</h5>
                        <p className="text-muted">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Supplier Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">
                  {selectedSupplier ? `Edit Supplier - ${selectedSupplier.name}` : 'Add New Supplier'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={selectedSupplier ? handleEditSupplier : handleAddSupplier}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Supplier Name</label>
                      <input 
                        type="text" 
                        className="form-control"
                        required
                        value={formSupplier.name}
                        onChange={e => setFormSupplier({ ...formSupplier, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={formSupplier.category}
                        onChange={e => setFormSupplier({ ...formSupplier, category: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Contact Person</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={formSupplier.contact_name}
                        onChange={e => setFormSupplier({ ...formSupplier, contact_name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input 
                        type="email" 
                        className="form-control"
                        value={formSupplier.email}
                        onChange={e => setFormSupplier({ ...formSupplier, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input 
                        type="tel" 
                        className="form-control"
                        value={formSupplier.phone}
                        onChange={e => setFormSupplier({ ...formSupplier, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={formSupplier.status} onChange={e => setFormSupplier({ ...formSupplier, status: e.target.value })}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Rating</label>
                      <input 
                        type="number" 
                        className="form-control"
                        min="0" max="5" step="0.1"
                        value={formSupplier.rating}
                        onChange={e => setFormSupplier({ ...formSupplier, rating: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        value={formSupplier.address}
                        onChange={e => setFormSupplier({ ...formSupplier, address: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer border-0">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn rounded-pill px-4"
                      style={{ backgroundColor: '#E31937', color: 'white' }}
                    >
                      {selectedSupplier ? 'Update Supplier' : 'Add Supplier'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;

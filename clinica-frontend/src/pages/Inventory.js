import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { supplierService } from '../services/supplierService';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: '',
    price: '',
    threshold: '',
    category: '',
    location: '',
    supplier_id: ''
  });

  const categories = [
    'All Categories',
    'Medications',
    'Medical Supplies',
    'Equipment',
    'Laboratory',
    'Office Supplies'
  ];

  // Fetch inventory and suppliers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [items, supplierList] = await Promise.all([
          inventoryService.getAllItems(),
          supplierService.getAllSuppliers()
        ]);
        setInventoryItems(items);
        setSuppliers(supplierList);
      } catch (err) {
        setError(err.message || 'Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // CRUD Handlers
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const item = await inventoryService.createItem({
        ...newItem,
        quantity: parseInt(newItem.quantity),
        price: parseFloat(newItem.price),
        threshold: parseInt(newItem.threshold)
      });
      setInventoryItems([item, ...inventoryItems]);
      setShowAddModal(false);
      setNewItem({
        name: '', description: '', quantity: '', unit: '', price: '', threshold: '', category: '', location: '', supplier_id: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setEditedItem({ ...selectedItem });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const updated = await inventoryService.updateItem(editedItem.id, {
        ...editedItem,
        quantity: parseInt(editedItem.quantity),
        price: parseFloat(editedItem.price),
        threshold: parseInt(editedItem.threshold)
      });
      setInventoryItems(inventoryItems.map(item => item.id === updated.id ? updated : item));
      setSelectedItem(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      setLoading(true);
      await inventoryService.deleteItem(id);
      setInventoryItems(inventoryItems.filter(item => item.id !== id));
      setShowDetailsModal(false);
    } catch (err) {
      setError(err.message || 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    let status = 'In Stock';
    if (item.quantity === 0) status = 'Out of Stock';
    else if (item.quantity <= item.threshold) status = 'Low Stock';
    const matchesStock = filterStock === 'all' ||
      (filterStock === 'lowStock' && status === 'Low Stock') ||
      (filterStock === 'outOfStock' && status === 'Out of Stock') ||
      (filterStock === 'inStock' && status === 'In Stock');
    return matchesSearch && matchesCategory && matchesStock;
  });

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>;
  }
  if (error) {
    return <div className="alert alert-danger my-4">{error}</div>;
  }

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Inventory Management</h4>
          <p className="text-muted mb-0">Track and manage your medical supplies and equipment</p>
        </div>
        <button 
          className="btn" 
          style={{ backgroundColor: '#E31937', color: 'white' }}
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>Add New Item
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Search Items</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Stock Status</label>
              <select
                className="form-select"
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
              >
                <option value="all">All Items</option>
                <option value="inStock">In Stock</option>
                <option value="lowStock">Low Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setFilterStock('all');
                }}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Threshold</th>
                  <th>Supplier</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>₱{item.price}</td>
                    <td>{item.threshold}</td>
                    <td>{item.supplier?.name || 'N/A'}</td>
                    <td>{item.location}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleViewDetails(item)}>
                        <i className="bi bi-eye me-1"></i>View
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem(item.id)}>
                        <i className="bi bi-trash me-1"></i>Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <div className="py-5">
                        <i className="bi bi-inbox fs-1 text-muted"></i>
                        <h5 className="mt-3">No items found</h5>
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

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Item</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddItem}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Item Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newItem.category}
                        onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Unit</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newItem.unit}
                        onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Threshold</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={newItem.threshold}
                        onChange={(e) => setNewItem({...newItem, threshold: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Price per Unit</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        required
                        value={newItem.price}
                        onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Supplier</label>
                      <select
                        className="form-select"
                        required
                        value={newItem.supplier_id}
                        onChange={(e) => setNewItem({...newItem, supplier_id: e.target.value})}
                      >
                        <option value="">Select supplier</option>
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={newItem.description}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newItem.location}
                        onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn"
                    style={{ backgroundColor: '#E31937', color: 'white' }}
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details/Edit Modal */}
      {showDetailsModal && selectedItem && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditing ? 'Edit Item' : 'Item Details'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    {isEditing ? (
                      <div className="mb-3">
                        <label className="form-label">Item Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editedItem.name}
                          onChange={(e) => setEditedItem({...editedItem, name: e.target.value})}
                        />
                      </div>
                    ) : (
                      <p className="mb-2"><strong>Item Name:</strong> {selectedItem.name}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    {isEditing ? (
                      <div className="mb-3">
                        <label className="form-label">Category</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editedItem.category}
                          onChange={(e) => setEditedItem({...editedItem, category: e.target.value})}
                        />
                      </div>
                    ) : (
                      <p className="mb-2"><strong>Category:</strong> {selectedItem.category}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    {isEditing ? (
                      <div className="mb-3">
                        <label className="form-label">Quantity</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editedItem.quantity}
                          onChange={(e) => setEditedItem({...editedItem, quantity: parseInt(e.target.value)})}
                        />
                      </div>
                    ) : (
                      <p className="mb-2"><strong>Quantity:</strong> {selectedItem.quantity} {selectedItem.unit}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    {isEditing ? (
                      <div className="mb-3">
                        <label className="form-label">Threshold</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editedItem.threshold}
                          onChange={(e) => setEditedItem({...editedItem, threshold: parseInt(e.target.value)})}
                        />
                      </div>
                    ) : (
                      <p className="mb-2"><strong>Threshold:</strong> {selectedItem.threshold}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    {isEditing ? (
                      <div className="mb-3">
                        <label className="form-label">Unit</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editedItem.unit}
                          onChange={(e) => setEditedItem({...editedItem, unit: e.target.value})}
                        />
                      </div>
                    ) : (
                      <p className="mb-2"><strong>Unit:</strong> {selectedItem.unit}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong>Supplier:</strong> {selectedItem.supplier?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="col-md-6">
                    {isEditing ? (
                      <div className="mb-3">
                        <label className="form-label">Price</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editedItem.price}
                          onChange={(e) => setEditedItem({...editedItem, price: parseFloat(e.target.value)})}
                        />
                      </div>
                    ) : (
                      <p className="mb-2"><strong>Price:</strong> ₱{selectedItem.price}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    {isEditing ? (
                      <div className="mb-3">
                        <label className="form-label">Location</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editedItem.location}
                          onChange={(e) => setEditedItem({...editedItem, location: e.target.value})}
                        />
                      </div>
                    ) : (
                      <p className="mb-2"><strong>Location:</strong> {selectedItem.location}</p>
                    )}
                  </div>
                  <div className="col-12">
                    {isEditing ? (
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={editedItem.description}
                          onChange={(e) => setEditedItem({...editedItem, description: e.target.value})}
                        ></textarea>
                      </div>
                    ) : (
                      <p className="mb-2"><strong>Description:</strong> {selectedItem.description}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setIsEditing(false);
                  }}
                >
                  Close
                </button>
                {isEditing ? (
                  <button 
                    type="button" 
                    className="btn"
                    style={{ backgroundColor: '#E31937', color: 'white' }}
                    onClick={handleSaveEdit}
                  >
                    Save Changes
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="btn"
                    style={{ backgroundColor: '#E31937', color: 'white' }}
                    onClick={handleEditClick}
                  >
                    Edit Item
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

export default Inventory;

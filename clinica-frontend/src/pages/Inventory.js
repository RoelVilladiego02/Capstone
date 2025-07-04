import React, { useState } from 'react';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    minStock: '',
    price: '',
    supplier: ''
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(null);

  const categories = [
    'All Categories',
    'Medications',
    'Medical Supplies',
    'Equipment',
    'Laboratory',
    'Office Supplies'
  ];

  // Mock data for inventory items
  const inventoryItems = [
    {
      id: 1,
      name: 'Surgical Masks',
      category: 'Medical Supplies',
      quantity: 2500,
      unit: 'pieces',
      minStock: 1000,
      lastUpdated: '2024-02-15',
      status: 'In Stock',
      price: 0.50,
      supplier: 'Medical Supplies Co.',
      location: 'Storage A1'
    },
    {
      id: 2,
      name: 'Amoxicillin 500mg',
      category: 'Medications',
      quantity: 350,
      unit: 'tablets',
      minStock: 200,
      lastUpdated: '2024-02-14',
      status: 'In Stock',
      price: 1.25,
      supplier: 'PharmaCare Inc.',
      location: 'Pharmacy B2'
    },
    {
      id: 3,
      name: 'Blood Pressure Monitor',
      category: 'Equipment',
      quantity: 15,
      unit: 'units',
      minStock: 5,
      lastUpdated: '2024-02-13',
      status: 'In Stock',
      price: 89.99,
      supplier: 'MedEquip Ltd.',
      location: 'Equipment Room C1'
    },
    {
      id: 4,
      name: 'Disposable Gloves',
      category: 'Medical Supplies',
      quantity: 50,
      unit: 'boxes',
      minStock: 100,
      lastUpdated: '2024-02-15',
      status: 'Low Stock',
      price: 12.99,
      supplier: 'Safety Supplies Inc.',
      location: 'Storage A2'
    },
    {
      id: 5,
      name: 'Paracetamol 500mg',
      category: 'Medications',
      quantity: 1000,
      unit: 'tablets',
      minStock: 300,
      lastUpdated: '2024-02-12',
      status: 'In Stock',
      price: 0.75,
      supplier: 'PharmaCare Inc.',
      location: 'Pharmacy B1'
    },
    {
      id: 6,
      name: 'Syringes 5ml',
      category: 'Medical Supplies',
      quantity: 0,
      unit: 'boxes',
      minStock: 50,
      lastUpdated: '2024-02-11',
      status: 'Out of Stock',
      price: 15.99,
      supplier: 'Medical Supplies Co.',
      location: 'Storage A3'
    },
    {
      id: 7,
      name: 'Stethoscope',
      category: 'Equipment',
      quantity: 8,
      unit: 'units',
      minStock: 3,
      lastUpdated: '2024-02-10',
      status: 'In Stock',
      price: 129.99,
      supplier: 'MedEquip Ltd.',
      location: 'Equipment Room C2'
    },
    {
      id: 8,
      name: 'Bandages',
      category: 'Medical Supplies',
      quantity: 75,
      unit: 'rolls',
      minStock: 100,
      lastUpdated: '2024-02-15',
      status: 'Low Stock',
      price: 5.99,
      supplier: 'Safety Supplies Inc.',
      location: 'Storage A4'
    }
  ];

  const handleAddItem = (e) => {
    e.preventDefault();
    const newInventoryItem = {
      id: inventoryItems.length + 1,
      ...newItem,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: parseInt(newItem.quantity) === 0 ? 'Out of Stock' :
             parseInt(newItem.quantity) <= parseInt(newItem.minStock) ? 'Low Stock' : 'In Stock'
    };
    inventoryItems.unshift(newInventoryItem);
    setShowAddModal(false);
    setNewItem({
      name: '',
      category: '',
      quantity: '',
      unit: '',
      minStock: '',
      price: '',
      supplier: ''
    });
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

  const handleSaveEdit = () => {
    // Update the item in the inventory
    const updatedInventory = inventoryItems.map(item => 
      item.id === editedItem.id ? editedItem : item
    );
    // In a real app, you would make an API call here
    inventoryItems.splice(0, inventoryItems.length, ...updatedInventory);
    setSelectedItem(editedItem);
    setIsEditing(false);
  };

  // Filter function
  const filterInventoryItems = () => {
    return inventoryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesStock = filterStock === 'all' || 
                          (filterStock === 'lowStock' && item.quantity <= item.minStock) ||
                          (filterStock === 'outOfStock' && item.quantity === 0) ||
                          (filterStock === 'inStock' && item.quantity > item.minStock);
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  };

  // Add this before return statement
  const filteredItems = filterInventoryItems();

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

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Items</h6>
                  <h3 className="mb-0">1,234</h3>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                  <i className="bi bi-box-seam" style={{ fontSize: '1.5rem', color: '#E31937' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Low Stock Items</h6>
                  <h3 className="mb-0">12</h3>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: '#fff3cd' }}>
                  <i className="bi bi-exclamation-triangle" style={{ fontSize: '1.5rem', color: '#ffc107' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Out of Stock</h6>
                  <h3 className="mb-0">5</h3>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: '#f8d7da' }}>
                  <i className="bi bi-x-circle" style={{ fontSize: '1.5rem', color: '#dc3545' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Categories</h6>
                  <h3 className="mb-0">6</h3>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: '#d1e7dd' }}>
                  <i className="bi bi-grid" style={{ fontSize: '1.5rem', color: '#198754' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select 
                className="form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map((category, index) => (
                  <option key={index} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select 
                className="form-select"
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
              >
                <option value="all">All Stock Levels</option>
                <option value="inStock">In Stock</option>
                <option value="lowStock">Low Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
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
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar me-3">
                          <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" 
                               style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-box text-muted"></i>
                          </div>
                        </div>
                        <div>
                          <div className="fw-medium">{item.name}</div>
                          <small className="text-muted">Min. Stock: {item.minStock}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="me-2">{item.quantity} {item.unit}</div>
                        <div className="progress flex-grow-1" style={{ height: '6px', width: '100px' }}>
                          <div 
                            className="progress-bar bg-success" 
                            style={{ width: `${(item.quantity / item.minStock) * 50}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        item.status === 'In Stock' ? 'bg-success' :
                        item.status === 'Low Stock' ? 'bg-warning' :
                        'bg-danger'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{new Date(item.lastUpdated).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleViewDetails(item)}
                      >
                        <i className="bi bi-eye me-1"></i>View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
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
                      <select 
                        className="form-select"
                        required
                        value={newItem.category}
                        onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      >
                        <option value="">Select category</option>
                        {categories.slice(1).map((cat, index) => (
                          <option key={index} value={cat}>{cat}</option>
                        ))}
                      </select>
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
                      <label className="form-label">Minimum Stock</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={newItem.minStock}
                        onChange={(e) => setNewItem({...newItem, minStock: e.target.value})}
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
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newItem.supplier}
                        onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                      />
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
                        <select
                          className="form-select"
                          value={editedItem.category}
                          onChange={(e) => setEditedItem({...editedItem, category: e.target.value})}
                        >
                          {categories.slice(1).map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                          ))}
                        </select>
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
                        <label className="form-label">Minimum Stock</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editedItem.minStock}
                          onChange={(e) => setEditedItem({...editedItem, minStock: parseInt(e.target.value)})}
                        />
                      </div>
                    ) : (
                      <p className="mb-2"><strong>Minimum Stock:</strong> {selectedItem.minStock}</p>
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
                      <strong>Status:</strong>
                      <span className={`badge ms-2 ${
                        selectedItem.status === 'In Stock' ? 'bg-success' :
                        selectedItem.status === 'Low Stock' ? 'bg-warning' :
                        'bg-danger'
                      }`}>
                        {selectedItem.status}
                      </span>
                    </p>
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

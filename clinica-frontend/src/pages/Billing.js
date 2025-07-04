import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const printComponentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `Bill-${selectedBill?.id || 'unknown'}`,
    onAfterPrint: () => console.log('Printed successfully')
  });

  const billingSummary = {
    totalPending: 25000,
    totalPaid: 150000,
    totalOverdue: 15000,
    totalBills: 75
  };

  const bills = [
    {
      id: "BILL-2024-001",
      patientName: "John Doe",
      patientId: "P001",
      date: "2024-02-15",
      dueDate: "2024-03-15",
      amount: 2500,
      status: "Pending",
      items: [
        { description: "Consultation Fee", amount: 1500 },
        { description: "Laboratory Tests - CBC", amount: 800 },
        { description: "Prescription Medications", amount: 200 }
      ],
      paymentMethod: null
    },
    {
      id: "BILL-2024-002",
      patientName: "Jane Smith",
      patientId: "P002",
      date: "2024-02-14",
      dueDate: "2024-03-14",
      amount: 3500,
      status: "Paid",
      items: [
        { description: "Consultation Fee", amount: 1500 },
        { description: "X-Ray Examination", amount: 2000 }
      ],
      paymentMethod: "Credit Card",
      paymentDate: "2024-02-14",
      paymentReference: "CC-20240214-123"
    },
    {
      id: "BILL-2024-003",
      patientName: "Mike Wilson",
      patientId: "P003",
      date: "2024-02-13",
      dueDate: "2024-03-13",
      amount: 5000,
      status: "Overdue",
      items: [
        { description: "Emergency Room Fee", amount: 3000 },
        { description: "Medical Supplies", amount: 1000 },
        { description: "Laboratory Tests", amount: 1000 }
      ],
      paymentMethod: null
    },
    {
      id: "BILL-2024-004",
      patientName: "Sarah Johnson",
      patientId: "P004",
      date: "2024-02-12",
      dueDate: "2024-03-12",
      amount: 1800,
      status: "Paid",
      items: [
        { description: "Follow-up Consultation", amount: 1000 },
        { description: "Prescription Medications", amount: 800 }
      ],
      paymentMethod: "Online Wallet (GCASH/Paymaya)",
      paymentDate: "2024-02-12",
      paymentReference: "GC-20240212-456"
    },
    {
      id: "BILL-2024-005",
      patientName: "Robert Brown",
      patientId: "P005",
      date: "2024-02-11",
      dueDate: "2024-03-11",
      amount: 4200,
      status: "Pending",
      items: [
        { description: "Specialist Consultation", amount: 2000 },
        { description: "Diagnostic Tests", amount: 1500 },
        { description: "Medical Certificate", amount: 700 }
      ],
      paymentMethod: null
    }
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: 'bi-cash' },
    { id: 'credit', name: 'Credit Card', icon: 'bi-credit-card' },
    { id: 'online', name: 'Online Wallet (GCASH/Paymaya)', icon: 'bi-wallet2' }
  ];

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Paid': return 'bg-success';
      case 'Pending': return 'bg-warning text-dark';
      case 'Overdue': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getPaymentMethodIcon = (method) => {
    const paymentMethod = paymentMethods.find(pm => pm.name === method);
    return paymentMethod ? paymentMethod.icon : 'bi-question-circle';
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setShowViewModal(true);
  };

  return (
    <div className="container-fluid py-4">
      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Pending Bills</h6>
                  <h3 className="mb-0">₱{billingSummary.totalPending.toLocaleString()}</h3>
                </div>
                <div className="rounded-circle p-3 bg-warning-subtle">
                  <i className="bi bi-hourglass-split text-warning fs-4"></i>
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
                  <h6 className="text-muted mb-2">Paid Today</h6>
                  <h3 className="mb-0">₱{billingSummary.totalPaid.toLocaleString()}</h3>
                </div>
                <div className="rounded-circle p-3 bg-success-subtle">
                  <i className="bi bi-check-circle text-success fs-4"></i>
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
                  <h6 className="text-muted mb-2">Overdue</h6>
                  <h3 className="mb-0">₱{billingSummary.totalOverdue.toLocaleString()}</h3>
                </div>
                <div className="rounded-circle p-3 bg-danger-subtle">
                  <i className="bi bi-exclamation-circle text-danger fs-4"></i>
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
                  <h6 className="text-muted mb-2">Total Bills</h6>
                  <h3 className="mb-0">{billingSummary.totalBills}</h3>
                </div>
                <div className="rounded-circle p-3 bg-primary-subtle">
                  <i className="bi bi-receipt text-primary fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <select 
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
                <span className="input-group-text bg-light">to</span>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-2">
              <button className="btn w-100" style={{ backgroundColor: '#E31937', color: 'white' }}>
                <i className="bi bi-plus-lg me-2"></i>New Bill
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Bill #</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill.id}>
                    <td>{bill.id}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar me-2">
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                               style={{ width: '40px', height: '40px' }}>
                            {bill.patientName.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <div className="fw-medium">{bill.patientName}</div>
                          <small className="text-muted">ID: {bill.patientId}</small>
                        </div>
                      </div>
                    </td>
                    <td>{new Date(bill.date).toLocaleDateString()}</td>
                    <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                    <td>₱{bill.amount.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(bill.status)}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td>
                      {bill.paymentMethod ? (
                        <span className="text-success">
                          <i className={`bi ${getPaymentMethodIcon(bill.paymentMethod)} me-2`}></i>
                          {bill.paymentMethod}
                        </span>
                      ) : (
                        <span className="text-muted">Not paid</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewBill(bill)}
                        >
                          <i className="bi bi-eye me-1"></i>View
                        </button>
                        {bill.status === 'Pending' && (
                          <button className="btn btn-sm" style={{ backgroundColor: '#E31937', color: 'white' }}>
                            <i className="bi bi-receipt me-1"></i>Process Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bill View Modal */}
      {showViewModal && selectedBill && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Bill Details - {selectedBill.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              
              {/* Printable Content */}
              <div ref={printComponentRef} className="p-4">
                {/* Clinic Header for Print */}
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                  <div>
                    <h4 className="mb-1">Clinica Laguna</h4>
                    <p className="mb-0 text-muted">Medical Center • Diagnostics</p>
                    <small className="text-muted">123 Healthcare Ave, Medical District</small>
                  </div>
                  <div className="text-end">
                    <h5 className="mb-1">BILLING STATEMENT</h5>
                    <p className="mb-0">Bill #: {selectedBill.id}</p>
                    <p className="mb-0">Date: {new Date(selectedBill.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">Patient Information</h6>
                    <p className="mb-1"><strong>Name:</strong> {selectedBill.patientName}</p>
                    <p className="mb-1"><strong>ID:</strong> {selectedBill.patientId}</p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <h6 className="text-muted mb-2">Bill Information</h6>
                    <p className="mb-1"><strong>Date:</strong> {new Date(selectedBill.date).toLocaleDateString()}</p>
                    <p className="mb-1"><strong>Due Date:</strong> {new Date(selectedBill.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="table-responsive mb-4">
                  <table className="table table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Description</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.description}</td>
                          <td className="text-end">₱{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="table-light fw-bold">
                        <td>Total Amount</td>
                        <td className="text-end">₱{selectedBill.amount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Payment Details for Print */}
                <div className="row mt-4 border-top pt-3">
                  <div className="col-md-6">
                    <h6 className="mb-2">Payment Status</h6>
                    <p className="mb-0">Status: <span className={`badge ${getStatusBadgeClass(selectedBill.status)}`}>
                      {selectedBill.status}
                    </span></p>
                    {selectedBill.paymentMethod && (
                      <>
                        <p className="mb-0">Method: {selectedBill.paymentMethod}</p>
                        <p className="mb-0">Date: {selectedBill.paymentDate}</p>
                        <p className="mb-0">Reference: {selectedBill.paymentReference}</p>
                      </>
                    )}
                  </div>
                  <div className="col-md-6 text-end">
                    <h6 className="mb-2">Total Amount</h6>
                    <h3 className="mb-0">₱{selectedBill.amount.toLocaleString()}</h3>
                  </div>
                </div>

                {/* Footer for Print */}
                <div className="text-center mt-4 pt-4 border-top">
                  <p className="mb-0">Thank you for choosing Clinica Laguna</p>
                  <small className="text-muted">For inquiries, please call: +1234567890</small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
                <button type="button" className="btn btn-outline-primary" onClick={handlePrint}>
                  <i className="bi bi-printer me-2"></i>Print Bill
                </button>
                {selectedBill.status === 'Pending' && (
                  <button 
                    type="button" 
                    className="btn"
                    style={{ backgroundColor: '#E31937', color: 'white' }}
                  >
                    Process Payment
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

export default Billing;

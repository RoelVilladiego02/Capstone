import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const BillingHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const printComponentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `Bill-${selectedBill?.receiptNo || 'unknown'}`,
    onAfterPrint: () => console.log('Printed successfully')
  });

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setShowViewModal(true);
  };

  const transactions = [
    {
      id: 1,
      date: '2024-02-15',
      dueDate: '2024-02-20',
      type: 'Consultation',
      amount: 500,
      status: 'Paid',
      paymentMethod: 'Cash',
      doctor: 'Dr. Smith',
      receiptNo: 'REC-001'
    },
    {
      id: 2,
      date: '2024-02-10',
      dueDate: '2024-02-17',
      type: 'Laboratory',
      amount: 1500,
      status: 'Pending',
      paymentMethod: 'GCash',
      doctor: 'Dr. Johnson',
      receiptNo: 'REC-002'
    },
    {
      id: 3,
      date: '2024-02-12',
      dueDate: '2024-02-19',
      type: 'X-Ray',
      amount: 3000,
      status: 'Overdue',
      paymentMethod: 'Credit Card',
      doctor: 'Dr. Brown',
      receiptNo: 'REC-003'
    },
    {
      id: 4,
      date: '2024-02-14',
      dueDate: '2024-02-21',
      type: 'Consultation',
      amount: 700,
      status: 'Paid',
      paymentMethod: 'Cash',
      doctor: 'Dr. Smith',
      receiptNo: 'REC-004'
    },
    {
      id: 5,
      date: '2024-02-13',
      dueDate: '2024-02-20',
      type: 'Laboratory',
      amount: 1200,
      status: 'Pending',
      paymentMethod: 'GCash',
      doctor: 'Dr. Johnson',
      receiptNo: 'REC-005'
    }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = filterStatus === 'all' || 
                         transaction.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = transaction.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const billingSummary = {
    totalPending: 2000,
    totalPaid: 15000,
    totalOverdue: 500,
    totalBills: 5
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Paid': return 'bg-success';
      case 'Pending': return 'bg-warning text-dark';
      case 'Overdue': return 'bg-danger';
      default: return 'bg-secondary';
    }
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
                  <h6 className="text-muted mb-2">Paid Bills</h6>
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
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
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
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Bill #</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(bill => (
                  <tr key={bill.id}>
                    <td>{bill.receiptNo}</td>
                    <td>{new Date(bill.date).toLocaleDateString()}</td>
                    <td>{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : '-'}</td>
                    <td>₱{bill.amount.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(bill.status)}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td>
                      {bill.paymentMethod || '-'}
                    </td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewBill(bill)}
                        >
                          <i className="bi bi-eye me-1"></i>View
                        </button>
                        <button className="btn btn-sm btn-outline-secondary">
                          <i className="bi bi-download me-1"></i>Download
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

      {/* View Bill Modal */}
      {showViewModal && selectedBill && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Bill Details - {selectedBill.receiptNo}</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              
              {/* Printable Content */}
              <div ref={printComponentRef} className="p-4">
                {/* Clinic Header */}
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                  <div>
                    <h4 className="mb-1">Clinica Laguna</h4>
                    <p className="mb-0 text-muted">Medical Center • Diagnostics</p>
                    <small className="text-muted">123 Healthcare Ave, Medical District</small>
                  </div>
                  <div className="text-end">
                    <h5 className="mb-1">BILLING STATEMENT</h5>
                    <p className="mb-0">Bill #: {selectedBill.receiptNo}</p>
                    <p className="mb-0">Date: {new Date(selectedBill.date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Bill Details */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">Service Information</h6>
                    <p className="mb-1"><strong>Type:</strong> {selectedBill.type}</p>
                    <p className="mb-1"><strong>Doctor:</strong> {selectedBill.doctor}</p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <h6 className="text-muted mb-2">Payment Details</h6>
                    <p className="mb-1"><strong>Status:</strong> {selectedBill.status}</p>
                    <p className="mb-1"><strong>Due Date:</strong> {new Date(selectedBill.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Amount Details */}
                <div className="bg-light p-3 rounded mb-4">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <h6 className="mb-0">Total Amount</h6>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <h4 className="mb-0">₱{selectedBill.amount.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                {selectedBill.paymentMethod && (
                  <div className="alert alert-success mb-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      <div>
                        <p className="mb-0">Paid via {selectedBill.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
                <button type="button" className="btn btn-outline-primary" onClick={handlePrint}>
                  <i className="bi bi-printer me-2"></i>Print Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingHistory;

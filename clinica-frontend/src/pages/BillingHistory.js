import { useState, useEffect, useRef, useCallback } from 'react';
import { billingService } from '../services/billingService';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import PaymentGatewayModal from '../components/appointments/PaymentGatewayModal';
import { appointmentService } from '../services/appointmentService';

const BillingHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedBill, setSelectedBill] = useState(null);
  const printComponentRef = useRef();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billingSummary, setBillingSummary] = useState({
    totalPending: 0,
    totalPaid: 0,
    totalOverdue: 0,
    totalBills: 0
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billToPay, setBillToPay] = useState(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictAppointmentId, setConflictAppointmentId] = useState(null);
  const [conflictMessage] = useState('');
  const [showCancelledModal, setShowCancelledModal] = useState(false);
  const [cancelledMessage, setCancelledMessage] = useState('');

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
  });

  const handlePayNow = (bill) => {
    setBillToPay(bill);
    setShowPaymentModal(true);
  };
  const handlePaymentConfirm = async () => {
    if (!billToPay) return;
    try {
      await billingService.updateBill(billToPay.id, { status: 'Paid' });
      setShowPaymentModal(false);
      setBillToPay(null);
      fetchBillingData();
    } catch (err) {
      if (err.status === 409) {
        setShowPaymentModal(false);
        setShowConflictModal(false);
        setCancelledMessage(err.data.error);
        setShowCancelledModal(true);
        setBillToPay(null);
        setConflictAppointmentId(null);
      } else {
        alert('Payment failed. Please try again.');
      }
    }
  };
  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setBillToPay(null);
  };

  const handleReschedule = () => {
    // Open reschedule modal (implement as needed)
    setShowConflictModal(false);
    // ...open reschedule UI for conflictAppointmentId...
  };

  const handleCancelAppointment = async () => {
    if (!conflictAppointmentId) return;
    await appointmentService.cancelAppointment(conflictAppointmentId);
    setShowConflictModal(false);
    fetchBillingData();
  };

  const handleCancelledModalClose = () => {
    setShowCancelledModal(false);
    // Redirect to appointment booking page (adjust route as needed)
    window.location.href = '/appointments';
  };

  const fetchBillingData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      if (dateRange.start) {
        params.start_date = format(new Date(dateRange.start), 'yyyy-MM-dd');
      }
      
      if (dateRange.end) {
        params.end_date = format(new Date(dateRange.end), 'yyyy-MM-dd');
      }

      // Use the secure endpoint that only returns current patient's bills
      const data = await billingService.getMyBills(params);
      
      // Filter by search term on frontend
      const filteredData = searchTerm 
        ? data.filter(bill => 
            bill.receipt_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : data;
      
      setTransactions(filteredData);
      
      // Calculate summary
      const summary = filteredData.reduce((acc, bill) => {
        acc.totalBills++;
        const amount = parseFloat(bill.amount) || 0;
        
        switch ((bill.status || '').toLowerCase()) {
          case 'pending':
            acc.totalPending += amount;
            break;
          case 'paid':
            acc.totalPaid += amount;
            break;
          case 'overdue':
            acc.totalOverdue += amount;
            break;
          default:
            break;
        }
        return acc;
      }, {
        totalPending: 0,
        totalPaid: 0,
        totalOverdue: 0,
        totalBills: 0
      });
      
      setBillingSummary(summary);
      setError(null);
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError('Failed to load billing data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, dateRange, searchTerm]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return 'bg-success';
      case 'pending': return 'bg-warning text-dark';
      case 'overdue': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="container-fluid py-4">
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    </div>
  );

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
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No billing records found
                    </td>
                  </tr>
                ) : (
                  transactions.map(bill => (
                    <tr key={bill.id}>
                      <td>{bill.receipt_no || bill.id}</td>
                      <td>{bill.created_at ? new Date(bill.created_at).toLocaleDateString() : '-'}</td>
                      <td>{bill.due_date ? new Date(bill.due_date).toLocaleDateString() : '-'}</td>
                      <td>₱{bill.amount?.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(bill.status)}`}>
                          {bill.status}
                        </span>
                        {bill.status === 'Pending' && (
                          <button className="btn btn-sm btn-primary ms-2" onClick={() => handlePayNow(bill)}>
                            Pay Now
                          </button>
                        )}
                      </td>
                      <td>
                        {bill.payment_method ? bill.payment_method : '-'}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setSelectedBill(bill)}
                          >
                            <i className="bi bi-eye me-1"></i>View
                          </button>
                          <button className="btn btn-sm btn-outline-secondary">
                            <i className="bi bi-download me-1"></i>Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Bill Modal */}
      {selectedBill && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Bill Details - {selectedBill.receipt_no || selectedBill.id}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedBill(null)}></button>
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
                    <p className="mb-0">Bill #: {selectedBill.receipt_no || selectedBill.id}</p>
                    <p className="mb-0">Date: {new Date(selectedBill.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Bill Details */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">Service Information</h6>
                    <p className="mb-1"><strong>Type:</strong> {selectedBill.type || 'General'}</p>
                    <p className="mb-1"><strong>Description:</strong> {selectedBill.description || 'Medical services'}</p>
                    <p className="mb-1"><strong>Doctor:</strong> {selectedBill.doctor?.name || 'N/A'}</p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <h6 className="text-muted mb-2">Payment Details</h6>
                    <p className="mb-1"><strong>Status:</strong> {selectedBill.status}</p>
                    <p className="mb-1"><strong>Due Date:</strong> {new Date(selectedBill.due_date).toLocaleDateString()}</p>
                    {selectedBill.paid_at && (
                      <p className="mb-1"><strong>Paid Date:</strong> {new Date(selectedBill.paid_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                {/* Amount Details */}
                <div className="bg-light p-3 rounded mb-4">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <h6 className="mb-0">Total Amount</h6>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <h4 className="mb-0">₱{selectedBill.amount?.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                {selectedBill.payment_method && (
                  <div className="alert alert-success mb-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      <div>
                        <p className="mb-0">Paid via {selectedBill.payment_method}</p>
                        {selectedBill.paid_at && (
                          <small className="text-muted">on {new Date(selectedBill.paid_at).toLocaleDateString()}</small>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="text-center mt-4 pt-4 border-top">
                  <p className="mb-0">Thank you for choosing Clinica Laguna</p>
                  <small className="text-muted">For inquiries, please contact us</small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedBill(null)}>
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

      <PaymentGatewayModal
        show={showPaymentModal}
        onConfirm={handlePaymentConfirm}
        onCancel={handlePaymentCancel}
        paymentMethod={billToPay?.payment_method}
      />

      {/* Conflict Modal */}
      {showConflictModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Slot Unavailable</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConflictModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <i className="bi bi-exclamation-triangle fs-1 text-danger mb-3"></i>
                <p className="mb-2">{conflictMessage}</p>
                <p className="mb-0">Would you like to reschedule or cancel your appointment?</p>
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn btn-secondary" onClick={handleCancelAppointment}>Cancel Appointment</button>
                <button className="btn btn-primary" onClick={handleReschedule}>Reschedule</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancelled Modal */}
      {showCancelledModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Appointment Cancelled</h5>
              </div>
              <div className="modal-body text-center">
                <i className="bi bi-x-circle fs-1 text-danger mb-3"></i>
                <p className="mb-2">{cancelledMessage}</p>
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn btn-primary" onClick={handleCancelledModalClose}>Book New Appointment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingHistory;
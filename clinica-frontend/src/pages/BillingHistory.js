import { useState, useEffect, useRef, useCallback } from 'react';
import { billingService } from '../services/billingService';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import PaymentGatewayModal from '../components/appointments/PaymentGatewayModal';
import { appointmentService } from '../services/appointmentService';
import RescheduleAppointment from './RescheduleAppointment';

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
  const [conflictMessage, setConflictMessage] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState(null);

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
        setConflictMessage(err.data.error);
        setConflictAppointmentId(err.data.appointment_id);
        setShowConflictModal(true);
        setBillToPay(null);
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
    if (conflictAppointmentId) {
      setRescheduleAppointmentId(conflictAppointmentId);
      setShowRescheduleModal(true);
      setShowConflictModal(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!conflictAppointmentId) return;
    try {
      await appointmentService.cancelAppointment(conflictAppointmentId);
      setShowConflictModal(false);
      // Update UI to show cancellation was successful
      setShowCancelledModal(true);
      fetchBillingData();
    } catch (err) {
      setError('Failed to cancel appointment. Please try again.');
    }
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
      case 'paid': return 'bg-success-subtle text-success border border-success';
      case 'pending': return 'bg-warning-subtle text-warning border border-warning';
      case 'overdue': return 'bg-danger-subtle text-danger border border-danger';
      default: return 'bg-secondary-subtle text-secondary border border-secondary';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setDateRange({ start: '', end: '' });
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="text-center">
              <div className="spinner-grow text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h4 className="text-primary mt-3 mb-1">Loading Billing History</h4>
              <p className="text-muted">Please wait while we fetch your billing information</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Enhanced Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body position-relative p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-warning-subtle p-3 me-3">
                  <i className="bi bi-hourglass-split text-warning fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Pending Bills</h6>
                  <h3 className="mb-0">₱{billingSummary.totalPending.toLocaleString()}</h3>
                </div>
              </div>
              <div className="progress" style={{ height: '4px' }}>
                <div 
                  className="progress-bar bg-warning" 
                  style={{ width: `${(billingSummary.totalPending / (billingSummary.totalPending + billingSummary.totalPaid + billingSummary.totalOverdue)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body position-relative p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-success-subtle p-3 me-3">
                  <i className="bi bi-check-circle text-success fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Paid Bills</h6>
                  <h3 className="mb-0">₱{billingSummary.totalPaid.toLocaleString()}</h3>
                </div>
              </div>
              <div className="progress" style={{ height: '4px' }}>
                <div 
                  className="progress-bar bg-success" 
                  style={{ width: `${(billingSummary.totalPaid / (billingSummary.totalPending + billingSummary.totalPaid + billingSummary.totalOverdue)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body position-relative p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-danger-subtle p-3 me-3">
                  <i className="bi bi-exclamation-circle text-danger fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Overdue</h6>
                  <h3 className="mb-0">₱{billingSummary.totalOverdue.toLocaleString()}</h3>
                </div>
              </div>
              <div className="progress" style={{ height: '4px' }}>
                <div 
                  className="progress-bar bg-danger" 
                  style={{ width: `${(billingSummary.totalOverdue / (billingSummary.totalPending + billingSummary.totalPaid + billingSummary.totalOverdue)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body position-relative p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-primary-subtle p-3 me-3">
                  <i className="bi bi-receipt text-primary fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Total Bills</h6>
                  <h3 className="mb-0">{billingSummary.totalBills}</h3>
                </div>
              </div>
              <div className="progress" style={{ height: '4px' }}>
                <div 
                  className="progress-bar bg-primary" 
                  style={{ width: `${((billingSummary.totalBills - billingSummary.totalPending) / billingSummary.totalBills) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                <input
                  type="text"
                  className="form-control ps-5"
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
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
                <span className="input-group-text bg-light border-0">to</span>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-light w-100" 
                onClick={clearFilters}
                disabled={!searchTerm && filterStatus === 'all' && !dateRange.start && !dateRange.end}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Bills Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4">
                    <div className="text-muted">Bill #</div>
                  </th>
                  <th className="border-0">
                    <div className="text-muted">Date</div>
                  </th>
                  <th className="border-0">
                    <div className="text-muted">Due Date</div>
                  </th>
                  <th className="border-0">
                    <div className="text-muted">Amount</div>
                  </th>
                  <th className="border-0">
                    <div className="text-muted">Status</div>
                  </th>
                  <th className="border-0">
                    <div className="text-muted">Payment Method</div>
                  </th>
                  <th className="border-0 px-4">
                    <div className="text-muted">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <img 
                        src="/images/empty-bills.svg" 
                        alt="No bills" 
                        style={{ width: '120px', opacity: 0.5 }}
                        className="mb-3"
                      />
                      <h5 className="text-muted mb-2">No Bills Found</h5>
                      <p className="text-muted mb-0">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map(bill => (
                    <tr key={bill.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-primary-subtle p-2 me-3">
                            <i className="bi bi-receipt text-primary"></i>
                          </div>
                          <div>
                            <div className="fw-medium">{bill.receipt_no}</div>
                            <small className="text-muted">{bill.type}</small>
                          </div>
                        </div>
                      </td>
                      <td>{new Date(bill.created_at).toLocaleDateString()}</td>
                      <td>
                        <div>
                          {new Date(bill.due_date).toLocaleDateString()}
                          {new Date(bill.due_date) < new Date() && bill.status !== 'Paid' && (
                            <div className="text-danger small">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              Overdue
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="fw-medium">₱{bill.amount?.toLocaleString()}</span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(bill.status)} px-3 py-2`}>
                          {bill.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-credit-card me-2 text-muted"></i>
                          <span>{bill.payment_method?.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-light" 
                            onClick={() => setSelectedBill(bill)}
                          >
                            View
                          </button>
                          {bill.status === 'Pending' && (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handlePayNow(bill)}
                            >
                              Pay Now
                            </button>
                          )}
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
                    <p className="mb-1"><strong>Doctor:</strong> {selectedBill.doctor || 'N/A'}</p>
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Slot Unavailable</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConflictModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <i className="bi bi-x-circle fs-1 text-danger mb-3"></i>
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

      {/* Reschedule Modal Overlay */}
      {showRescheduleModal && rescheduleAppointmentId && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2200 }}>
          <RescheduleAppointment
            isOpen={true}
            onClose={() => {
              setShowRescheduleModal(false);
              setRescheduleAppointmentId(null);
              fetchBillingData();
            }}
            appointmentId={rescheduleAppointmentId} // <-- pass as prop
          />
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
                <p className="mb-2">{conflictMessage}</p>
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
import React from 'react';

const PaymentGatewayModal = ({ show, onConfirm, onCancel, paymentMethod }) => {
  if (!show) return null;
  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Payment Confirmation</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onCancel}></button>
          </div>
          <div className="modal-body text-center">
            <i className="bi bi-credit-card fs-1 text-primary mb-3"></i>
            <p className="mb-2">You selected <strong>{paymentMethod?.replace('_', ' ').toUpperCase()}</strong> as your payment method.</p>
            <p className="mb-0">Proceed to confirm your payment?</p>
          </div>
          <div className="modal-footer justify-content-center">
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn btn-primary" onClick={onConfirm}>Confirm Payment</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewayModal; 
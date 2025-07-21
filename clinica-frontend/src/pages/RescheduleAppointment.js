import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import AppointmentForm from '../components/appointments/AppointmentForm';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const RescheduleAppointment = ({ isOpen = true, onClose, appointmentId: propAppointmentId }) => {
  // Use propAppointmentId if provided, else fallback to query string (for compatibility)
  const query = useQuery();
  const appointmentId = propAppointmentId || query.get('appointmentId');
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (appointmentId) {
      appointmentService.getAppointment(appointmentId)
        .then(data => {
          setAppointment(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [appointmentId]);

  if (!isOpen) return null;
  if (loading) return <div>Loading appointment details...</div>;
  if (!appointment) return <div className="alert alert-danger">Appointment not found or already cancelled.</div>;

  // Pre-fill form with original details except for date/time
  return (
    <AppointmentForm
      initialDate={''}
      initialTime={''}
      isOpen={true}
      onSuccess={() => {
        if (onClose) onClose();
        navigate('/appointments');
      }}
      onCancel={() => {
        if (onClose) onClose();
        navigate('/appointments');
      }}
      // Pre-fill other fields
      initialDoctorId={appointment.doctor_id || ''}
      initialType={appointment.type || 'Walk-in'}
      initialConcern={appointment.concern || ''}
      initialNotes={appointment.notes || ''}
      initialPaymentMethod={appointment.payment_method || 'credit_card'}
    />
  );
};

export default RescheduleAppointment; 
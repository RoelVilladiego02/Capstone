import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import AppointmentForm from '../components/appointments/AppointmentForm';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const RescheduleAppointment = ({ isOpen = true, onClose, appointmentId: propAppointmentId }) => {
  const query = useQuery();
  const appointmentId = propAppointmentId || query.get('appointmentId');
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) {
        setError('No appointment ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching appointment:', appointmentId);
        const data = await appointmentService.getAppointment(appointmentId);
        console.log('Fetched appointment:', data);
        
        if (data.status === 'Cancelled') {
          setError('This appointment has been cancelled and cannot be rescheduled.');
          setLoading(false);
          return;
        }

        setAppointment(data);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handleRescheduleSuccess = async (updatedAppointment) => {
    console.log('Rescheduling successful:', updatedAppointment);
    if (onClose) {
      onClose();
    } else {
      navigate('/appointments');
    }
  };

  if (!isOpen) return null;
  if (loading) return <div>Loading appointment details...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!appointment) return <div className="alert alert-danger">Appointment not found.</div>;

  return (
    <AppointmentForm
      initialDate={''}
      initialTime={''}
      isOpen={true}
      isReschedule={true}
      appointmentId={appointment.id}
      onSuccess={handleRescheduleSuccess}
      onCancel={() => {
        if (onClose) onClose();
        else navigate('/appointments');
      }}
      initialDoctorId={appointment.doctor_id}
      initialType={appointment.type || 'Walk-in'}
      initialConcern={appointment.concern || ''}
      initialNotes={appointment.notes || ''}
      initialPaymentMethod={appointment.payment_method || 'credit_card'}
      hidePaymentFields={true}
    />
  );
};

export default RescheduleAppointment;
/**
 * Utility functions for patient-related operations
 */

/**
 * Extract patient ID from the /patients/me response
 * @param {Object} data - Response from /patients/me endpoint
 * @returns {number|null} - Patient ID as number or null if not found
 */
export const extractPatientId = (data) => {
  if (!data) return null;
  
  // Try the new simplified structure first
  if (data.patient_id !== undefined) {
    return Number(data.patient_id);
  }
  
  // Fallback to old structure
  const id = data.patient?.id || data.id || data.patient_id;
  return id ? Number(id) : null;
};

/**
 * Normalize time format to HH:MM
 * @param {string} time - Time string in any format
 * @returns {string} - Normalized time string
 */
export const normalizeTime = (time) => {
  if (!time) return '';
  // Handle both HH:MM and HH:MM:SS formats
  return time.substring(0, 5);
};

/**
 * Compare two patient IDs for equality
 * @param {number|string} id1 - First patient ID
 * @param {number|string} id2 - Second patient ID
 * @returns {boolean} - True if IDs are equal
 */
export const comparePatientIds = (id1, id2) => {
  return Number(id1) === Number(id2);
};

/**
 * Create a consistent appointment object structure
 * @param {Object} appointment - Raw appointment data
 * @param {number} patientId - Patient ID to ensure consistency
 * @returns {Object} - Normalized appointment object
 */
export const normalizeAppointment = (appointment, patientId = null) => {
  return {
    ...appointment,
    id: Number(appointment.id || Date.now()),
    patient_id: Number(appointment.patient_id || patientId),
    time: normalizeTime(appointment.time),
    date: appointment.date,
    doctor: appointment.doctor || 'Doctor TBD',
    patient: appointment.patient || 'Unknown Patient',
    status: appointment.status || 'Scheduled',
    type: appointment.type || 'Consultation',
    concern: appointment.concern || ''
  };
};

/**
 * Normalize patient data structure
 * @param {Object} patient - Raw patient data from API
 * @returns {Object} - Normalized patient object
 */
export const normalizePatient = (patient) => {
  if (!patient) return null;

  console.log('Normalizing patient:', patient);

  // Extract user data if it exists
  const userData = patient.user || {};
  console.log('Extracted user data:', userData);

  const normalized = {
    ...patient,
    id: Number(patient.id),
    // Try different possible paths for name
    name: userData.name || patient.name || 'No Name',
    email: userData.email || patient.email || '',
    phone: patient.phone || userData.phone_number || '',
    dob: patient.dob || '',
    gender: patient.gender || '',
    address: patient.address || '',
    emergency_contact: patient.emergency_contact || '',
    user_id: Number(patient.user_id) || Number(userData.id) || null,
    // Keep the original user object for reference
    user: userData
  };

  console.log('Normalized patient:', normalized);
  return normalized;
}; 
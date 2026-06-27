export const getPatients = () => {
  const data = localStorage.getItem('auramed_patients');
  return data ? JSON.parse(data) : [];
};

export const getPatient = (id) => {
  const patients = getPatients();
  return patients.find(p => p.id === id);
};

export const savePatient = (patient) => {
  const patients = getPatients();
  patients.unshift(patient);
  localStorage.setItem('auramed_patients', JSON.stringify(patients));
};

export const addDiagnosticHistory = (patientId, diagnostic) => {
  const patients = getPatients();
  const index = patients.findIndex(p => p.id === patientId);
  if (index !== -1) {
    if (!patients[index].history) patients[index].history = [];
    patients[index].history.unshift(diagnostic);
    localStorage.setItem('auramed_patients', JSON.stringify(patients));
  }
};

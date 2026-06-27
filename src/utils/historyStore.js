export const saveDiagnosticResult = (patientId, type, resultObject) => {
  const history = getPatientDiseaseHistory(patientId, type);
  history.push(resultObject);
  localStorage.setItem(`history_${patientId}_${type}`, JSON.stringify(history));
};

export const getPatientDiseaseHistory = (patientId, type) => {
  try {
    const data = localStorage.getItem(`history_${patientId}_${type}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Failed to parse history_${patientId}_${type} from localStorage`, error);
    return [];
  }
};

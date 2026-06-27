import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getPatient } from '../utils/storage';
import { saveDiagnosticResult, getPatientDiseaseHistory } from '../utils/historyStore';
import { predictPCOS } from "../services/api";
import { normalizeResponse } from '../utils/normalize';
import ImageUploader from '../components/diagnostic/ImageUploader';
import AIClinicalAssistant from '../components/common/AIClinicalAssistant';
import styles from './DiagnosticCommon.module.css';

const PcosDetection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [inputs, setInputs] = useState({
    bmi: '',
    lhFshRatio: '',
    irregularCycles: '0',
    hormonalImbalance: '0'
  });

  useEffect(() => {
    const data = getPatient(id);
    if (!data) navigate('/workspace');
    else setPatient(data);
  }, [id, navigate]);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleRunDiagnostic = async () => {
    if (!image) return alert('Upload image first');

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await predictPCOS(formData);
      console.log("API RESPONSE:", response.data);

      const normalized = normalizeResponse("pcos", response.data);

      const pcosRiskMap = {
        "Healthy": { level: 1, color: "green", label: "Normal" },
        "PCOS": { level: 5, color: "red", label: "High Risk Condition" }
      };

      const mapping = pcosRiskMap[normalized.primary_assessment] || pcosRiskMap["Healthy"];

      const resultObj = {
        type: "pcos",
        primary_assessment: normalized.primary_assessment, // "PCOS" or "Healthy"
        confidence: normalized.confidence,
        isPositive: normalized.isPositive,
        raw: response.data,
        timestamp: new Date().toISOString(),
        explanation: normalized.explanation,
        clinical_significance: normalized.clinical_significance,
        risk_level: mapping.level,
        color: mapping.color,
        label: mapping.label
      };

      const history = getPatientDiseaseHistory(id, "pcos");

      let insight = "Stable";
      if (history.length > 0) {
        const last = history[history.length - 1];
        const oldVal = last.risk_level || 1;
        const newVal = resultObj.risk_level;

        if (oldVal === newVal) insight = "Stable";
        else if (newVal > oldVal) insight = "Worsening";
        else insight = "Improving";
      }

      resultObj.longitudinal_insight = insight;

      setResult(resultObj);
      saveDiagnosticResult(id, "pcos", resultObj);

      console.log("RESULT OBJECT:", resultObj);
      console.log("HISTORY:", getPatientDiseaseHistory(id, "pcos"));

    } catch (err) {
      console.error(err);
      alert("API failed");
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate(`/patient/${id}`)}>
        <ChevronLeft size={20} />
        Back to Profile
      </button>

      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>PCOS Detection</h1>
          <p className={styles.subtitle}>Upload ovarian ultrasounds and evaluate metabolic features.</p>
        </div>
        <div className={styles.patientContext}>
          <div className={styles.patientName}>{patient.name}</div>
          <div className={styles.patientMeta}>
            Age: {patient.age} • <span className={styles.idBadge}>ID: {id}</span>
          </div>
        </div>
      </header>

      {!loading && !result && (
        <div className={styles.mainPanel}>
          <section className={styles.section}>
            <ImageUploader onImageSelected={setImage} label="Ultrasound Scan (DICOM/JPEG/PNG)" />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Clinical Variables</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>BMI (kg/m²)</label>
                <input type="number" step="0.1" name="bmi" value={inputs.bmi} onChange={handleChange} placeholder="e.g. 26.5" required />
              </div>
              <div className={styles.formGroup}>
                <label>LH/FSH Ratio</label>
                <input type="number" step="0.1" name="lhFshRatio" value={inputs.lhFshRatio} onChange={handleChange} placeholder="e.g. 1.5" required />
              </div>
              <div className={styles.formGroup}>
                <label>Irregular Cycles</label>
                <select name="irregularCycles" value={inputs.irregularCycles} onChange={handleChange}>
                  <option value="0">No (0)</option>
                  <option value="1">Yes (1)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Clinical Hyperandrogenism</label>
                <select name="hormonalImbalance" value={inputs.hormonalImbalance} onChange={handleChange}>
                  <option value="0">Negative (0)</option>
                  <option value="1">Positive (1)</option>
                </select>
              </div>
            </div>
          </section>

          <div className={styles.actionRow}>
            <button className={styles.runBtn} onClick={handleRunDiagnostic} disabled={!image}>
              Run Diagnostic Model
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <h3>Analyzing medical image & variables...</h3>
          <p>Processing ultrasound patterns through PCOS visual model.</p>
        </div>
      )}

      {result && (
        <div className={styles.resultPanel}>
          <div className={`${styles.resultHeader}`} style={{ backgroundColor: `${result.color}20`, borderBottom: `2px solid ${result.color}` }}>
            <div className={styles.assessmentGroup}>
              <span className={styles.assessmentLabel}>Primary Assessment</span>
              <span className={styles.primaryAssessment} style={{ color: result.color }}>
                {result.primary_assessment}
              </span>
              {result.primary_assessment === "PCOS" && (
                <span style={{ display: 'inline-block', backgroundColor: 'red', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', marginTop: '4px', fontWeight: 'bold' }}>
                  Clinical attention required
                </span>
              )}
            </div>
            <div className={styles.confidenceBox}>
              <span className={styles.assessmentLabel}>Model Confidence</span>
              <span className={styles.confidenceValue}>
                {typeof result.confidence === 'number' ? `${(result.confidence * 100).toFixed(1)}%` : result.confidence}
              </span>
            </div>
          </div>
          <div className={styles.resultBody}>
            <div className={styles.resultBlock}>
              <h4>Diagnostic Explanation</h4>
              <p>{result.explanation}</p>
            </div>
            <div className={styles.resultBlock}>
              <h4>Clinical Significance</h4>
              <p>{result.clinical_significance}</p>
            </div>
            <div className={styles.resultBlock} style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <h4>Longitudinal Insight</h4>
              <p style={{ color: 'var(--color-primary)', fontWeight: '500' }}>{result.longitudinal_insight}</p>
            </div>
            <AIClinicalAssistant 
              disease="pcos" 
              result={result.primary_assessment} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PcosDetection;

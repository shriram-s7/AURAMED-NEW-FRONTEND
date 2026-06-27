import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getPatient } from '../utils/storage';
import { saveDiagnosticResult, getPatientDiseaseHistory } from '../utils/historyStore';
import { predictCervical } from "../services/api";
import { normalizeResponse } from '../utils/normalize';
import ImageUploader from '../components/diagnostic/ImageUploader';
import AIClinicalAssistant from '../components/common/AIClinicalAssistant';
import styles from './DiagnosticCommon.module.css';

const CervicalCancer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const data = getPatient(id);
    if (!data) navigate('/workspace');
    else setPatient(data);
  }, [id, navigate]);

  const handleRunDiagnostic = async () => {
    if (!image) return alert('Please upload a cytology slide image first.');

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await predictCervical(formData);
      console.log("API RESPONSE:", response.data);

      const normalized = normalizeResponse("cervical", response.data);

      const cervicalRiskMap = {
        "Normal": { level: 1, color: "green", label: "Very Low Risk" },
        "Metaplastic": { level: 2, color: "lightgreen", label: "Low Risk" },
        "Parabasal": { level: 3, color: "#eab308", label: "Mild Risk" },
        "Koilocytotic": { level: 4, color: "orange", label: "High Risk" },
        "Dyskeratotic": { level: 5, color: "red", label: "Very High Risk" },
        "Malignant": { level: 6, color: "darkred", label: "Critical Risk" }
      };

      const mapping = cervicalRiskMap[normalized.primary_assessment] || cervicalRiskMap["Normal"];

      const resultObj = {
        type: "cervical",
        primary_assessment: normalized.primary_assessment,
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

      const history = getPatientDiseaseHistory(id, "cervical");

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
      saveDiagnosticResult(id, "cervical", resultObj);

      console.log("RESULT OBJECT:", resultObj);
      console.log("HISTORY:", getPatientDiseaseHistory(id, "cervical"));

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
          <h1 className={styles.title}>Cervical Cancer Screening</h1>
          <p className={styles.subtitle}>Upload Pap smear / cytology slide scans.</p>
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
            <ImageUploader onImageSelected={setImage} label="Whole Slide Image (WSI) or Microscopic Scan" />
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
          <h3>Analyzing medical image...</h3>
          <p>Processing cytology structures using AuraMed Vision nodes.</p>
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
              <span style={{ display: 'inline-block', backgroundColor: result.color, color: result.color === '#eab308' || result.color === 'lightgreen' ? '#000' : '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', marginTop: '4px', fontWeight: 'bold' }}>
                {result.label}
              </span>
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
            {/* Step 7 explicitly dictates Assistant strictly uses prediction classes */}
            <AIClinicalAssistant 
              disease="cervical" 
              result={result.primary_assessment} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CervicalCancer;

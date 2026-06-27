import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getPatient } from '../utils/storage';
import { saveDiagnosticResult, getPatientDiseaseHistory } from '../utils/historyStore';
import { predictBreast } from "../services/api";
import { normalizeResponse } from '../utils/normalize';
import ImageUploader from '../components/diagnostic/ImageUploader';
import AIClinicalAssistant from '../components/common/AIClinicalAssistant';
import styles from './DiagnosticCommon.module.css';

const BreastCancer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [inputs, setInputs] = useState({
    age: '',
    density: '1',
    familyHistory: '0',
    hormonalRisk: '0',
    obesity: '0',
    menopauseStatus: '0',
    geneticScore: '0',
    lifestyleRisk: '0',
    combinedRiskIndex: ''
  });

  useEffect(() => {
    const data = getPatient(id);
    if (!data) navigate('/workspace');
    else {
      setPatient(data);
      // Auto-fill age if empty
      setInputs(prev => ({ ...prev, age: data.age }));
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleRunDiagnostic = async () => {
    if (!image) return alert('Please upload a medical image first.');

    setLoading(true);
    setResult(null);

    const selectedFile = image;
    const age = parseInt(inputs.age, 10);
    const breast_density = parseInt(inputs.density, 10);
    const family_history = parseInt(inputs.familyHistory, 10);
    const hormonal_risk = parseInt(inputs.hormonalRisk, 10);
    const obesity = parseInt(inputs.obesity, 10);
    const menopause_status = parseInt(inputs.menopauseStatus, 10);
    const genetic_risk_score = parseFloat(inputs.geneticScore) || 0.0;
    const lifestyle_risk = parseFloat(inputs.lifestyleRisk) || 0.0;

    const high_risk_age = age > 50 ? 1 : 0;
    const density_risk = breast_density >= 3 ? 1 : 0;

    let combined_risk_index = parseFloat(inputs.combinedRiskIndex);
    if (isNaN(combined_risk_index)) {
      const sumRisk = high_risk_age + density_risk + (lifestyle_risk > 0.5 ? 1 : 0) + family_history + hormonal_risk;
      combined_risk_index = sumRisk / 5.0;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("age", age);
    formData.append("breast_density", breast_density);
    formData.append("family_history", family_history);
    formData.append("hormonal_risk", hormonal_risk);
    formData.append("obesity", obesity);
    formData.append("menopause_status", menopause_status);

    formData.append("high_risk_age", high_risk_age);
    formData.append("density_risk", density_risk);
    formData.append("genetic_risk_score", genetic_risk_score);
    formData.append("lifestyle_risk", lifestyle_risk);
    formData.append("combined_risk_index", combined_risk_index);

    console.log("FORM DATA SENT:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const response = await predictBreast(formData);
      
      if (response.data.error) {
        alert("Model input mismatch. Check clinical inputs.");
        setLoading(false);
        return;
      }
      
      console.log("API RESPONSE:", response.data);

      const normalized = normalizeResponse("breast", response.data);

      const val = (level) => level === "HIGH" ? 5 : level === "MODERATE" ? 3 : 1;
      const col = (level) => level === "HIGH" ? "red" : level === "MODERATE" ? "#eab308" : "green";
      const lbl = (level) => level === "HIGH" ? "High Risk" : level === "MODERATE" ? "Moderate Risk" : "Low Risk";

      const resultObj = {
        type: "breast",
        primary_assessment: normalized.primary_assessment,
        confidence: normalized.confidence,
        isPositive: normalized.isPositive,
        raw: response.data,
        timestamp: new Date().toISOString(), // STRICT struct
        risk_level: val(normalized.primary_assessment),
        color: col(normalized.primary_assessment),
        label: lbl(normalized.primary_assessment)
      };

      const history = getPatientDiseaseHistory(id, "breast");

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
      saveDiagnosticResult(id, "breast", resultObj);

      console.log("RESULT OBJECT:", resultObj);
      console.log("HISTORY:", getPatientDiseaseHistory(id, "breast"));

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
          <h1 className={styles.title}>Breast Cancer Screening</h1>
          <p className={styles.subtitle}>Upload mammogram images and enter clinical metrics.</p>
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
            <ImageUploader onImageSelected={setImage} label="Mammogram Image (DICOM/JPEG/PNG)" />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Clinical Variables</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Patient Age</label>
                <input type="number" name="age" value={inputs.age} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Breast Density (1-4)</label>
                <select name="density" value={inputs.density} onChange={handleChange}>
                  <option value="1">1 - Fatty</option>
                  <option value="2">2 - Scattered fibroglandular</option>
                  <option value="3">3 - Heterogeneously dense</option>
                  <option value="4">4 - Extremely dense</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Family History</label>
                <select name="familyHistory" value={inputs.familyHistory} onChange={handleChange}>
                  <option value="0">Negative (0)</option>
                  <option value="1">Positive (1)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Hormonal Risk</label>
                <select name="hormonalRisk" value={inputs.hormonalRisk} onChange={handleChange}>
                  <option value="0">Low/None (0)</option>
                  <option value="1">High (1)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Obesity (0=No, 1=Yes)</label>
                <select name="obesity" value={inputs.obesity} onChange={handleChange}>
                  <option value="0">0 - Normal</option>
                  <option value="1">1 - Obese</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Menopause Status</label>
                <select name="menopauseStatus" value={inputs.menopauseStatus} onChange={handleChange}>
                  <option value="0">0 - Pre-menopause</option>
                  <option value="1">1 - Post-menopause</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Genetic Risk Score (0.0-1.0)</label>
                <input type="number" step="0.01" name="geneticScore" value={inputs.geneticScore} onChange={handleChange} min="0" max="1" />
              </div>
              <div className={styles.formGroup}>
                <label>Lifestyle Risk (0.0-1.0)</label>
                <input type="number" step="0.01" name="lifestyleRisk" value={inputs.lifestyleRisk} onChange={handleChange} min="0" max="1" />
              </div>
              <div className={styles.formGroup}>
                <label>Combined Risk Index (0.0-1.0)</label>
                <input type="number" step="0.01" name="combinedRiskIndex" value={inputs.combinedRiskIndex} onChange={handleChange} min="0" max="1" placeholder="Auto-calculated if blank" />
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
          <p>This may take up to 30 seconds processing with AuraMed AI core.</p>
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
              <span style={{ display: 'inline-block', backgroundColor: result.color, color: result.color === '#eab308' ? '#000' : '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', marginTop: '4px', fontWeight: 'bold' }}>
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
              <p>{result.raw?.explanation?.join(" ")}</p>
            </div>
            <div className={styles.resultBlock}>
              <h4>Target Action</h4>
              <p><strong>{result.raw?.recommended_actions?.[0]}</strong></p>
            </div>
            <div className={styles.resultBlock} style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <h4>Longitudinal Insight</h4>
              <p style={{ color: 'var(--color-primary)', fontWeight: '500' }}>{result.longitudinal_insight}</p>
            </div>
            <AIClinicalAssistant
              disease="breast"
              result={result.primary_assessment}
              explanation={result.raw?.explanation?.join(" ")}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BreastCancer;

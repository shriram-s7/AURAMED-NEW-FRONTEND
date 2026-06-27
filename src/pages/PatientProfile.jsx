import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, FileScan, Dna, Clock, AlertCircle, ChevronLeft } from 'lucide-react';
import { getPatient } from '../utils/storage';
import { getPatientDiseaseHistory } from '../utils/historyStore';
import styles from './PatientProfile.module.css';

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const data = getPatient(id);
    if (!data) {
      navigate('/workspace');
    } else {
      setPatient(data);
    }
  }, [id, navigate]);

  if (!patient) return null;

  return (
    <div className={styles.profileContainer}>
      <button className={styles.backBtn} onClick={() => navigate('/workspace')}>
        <ChevronLeft size={20} />
        Back to Workspace
      </button>

      <header className={styles.header}>
        <div className={styles.patientAvatar}>{patient.name.charAt(0)}</div>
        <div className={styles.patientInfo}>
          <h1 className={styles.patientName}>{patient.name}</h1>
          <p className={styles.patientMeta}>ID: {patient.id} • {patient.age} yrs • Blood: {patient.bloodType}</p>
        </div>
      </header>

      <div className={styles.grid}>
        {/* Left Column */}
        <div className={styles.mainCol}>
          <section className={styles.actionSection}>
            <h2 className={styles.sectionTitle}>Diagnostic Actions</h2>
            <p className={styles.sectionSubtitle}>Select a clinical module to begin analysis</p>
            
            <div className={styles.actionGrid}>
              <button className={styles.actionBtn} onClick={() => navigate(`/breast/${id}`)}>
                <Activity size={32} className={styles.actionIcon} />
                <div className={styles.actionText}>
                  <h3>Breast Cancer Analysis</h3>
                  <p>Run mammogram image screening</p>
                </div>
              </button>
              
              <button className={styles.actionBtn} onClick={() => navigate(`/cervical/${id}`)}>
                <FileScan size={32} className={styles.actionIcon} />
                <div className={styles.actionText}>
                  <h3>Cervical Cancer Analysis</h3>
                  <p>Analyze cytology and Pap smear</p>
                </div>
              </button>
              
              <button className={styles.actionBtn} onClick={() => navigate(`/pcos/${id}`)}>
                <Dna size={32} className={styles.actionIcon} />
                <div className={styles.actionText}>
                  <h3>PCOS Detection</h3>
                  <p>Evaluate ultrasound & patient features</p>
                </div>
              </button>
            </div>
          </section>

          <section className={styles.aiSection}>
            <h2 className={styles.sectionTitle}>Global AI Insight</h2>
            {(() => {
              const breastHistory = getPatientDiseaseHistory(id, "breast").sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
              const cervicalHistory = getPatientDiseaseHistory(id, "cervical").sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
              const pcosHistory = getPatientDiseaseHistory(id, "pcos").sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

              console.log("GLOBAL INPUT:", { breastHistory, cervicalHistory, pcosHistory });

              const activeAnalyses = [
                { id: "breast", name: "Breast Assessment", history: breastHistory },
                { id: "cervical", name: "Cervical Cytology", history: cervicalHistory },
                { id: "pcos", name: "PCOS Evaluation", history: pcosHistory }
              ].filter(x => x.history.length > 0);

              if (activeAnalyses.length === 0) {
                return (
                  <div className={styles.insightCard}>
                    <AlertCircle size={24} className={styles.insightIcon} />
                    <div>
                      <h4 className={styles.insightTitle}>Trend Analysis</h4>
                      <p className={styles.insightText}>No diagnostic trends available.</p>
                    </div>
                  </div>
                );
              }

              let anyDangerous = false;

              const analysesDisplay = activeAnalyses.map(disease => {
                const last = disease.history[disease.history.length - 1];
                let indicator = last.primary_assessment;
                if (disease.id === "pcos" && last.raw?.class) {
                   indicator = last.raw.class;
                } else if (disease.id === "cervical" && last.raw?.prediction) {
                   indicator = last.raw.prediction;
                }
                
                let isDangerous = false;
                if (disease.id === "breast" && last.primary_assessment === "HIGH") isDangerous = true;
                if (disease.id === "cervical" && last.risk_level >= 4) isDangerous = true;
                if (disease.id === "pcos" && last.primary_assessment === "PCOS") isDangerous = true;
                
                if (isDangerous) anyDangerous = true;

                const cardColor = last.color || (isDangerous ? "red" : "green");
                const indicatorColor = (cardColor === 'yellow' || cardColor === '#eab308' || cardColor === 'orange') ? '#f59e0b' : (cardColor === 'red' || cardColor === 'darkred') ? '#ef4444' : '#10b981';

                return (
                  <div key={disease.id} className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', borderTop: `3px solid ${cardColor}` }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {disease.name}
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: indicatorColor, boxShadow: `0 0 8px ${indicatorColor}` }}></div>
                    </div>
                    
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest Indicator</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{indicator}</div>
                    </div>
                    
                    {last.longitudinal_insight !== 'Stable' && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trajectory</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: last.longitudinal_insight === 'Worsening' ? 'var(--color-danger)' : last.longitudinal_insight === 'Improving' ? 'var(--color-success)' : 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{last.longitudinal_insight}</div>
                      </div>
                    )}
                  </div>
                );
              });

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {analysesDisplay}
                  </div>
                </div>
              );
            })()}
          </section>
        </div>

        {/* Right Column */}
        <div className={styles.sideCol}>
          <section className={styles.timelineSection}>
            <h2 className={styles.sectionTitle}>History Timeline</h2>
            <div className={styles.timeline}>
              {(() => {
                const breast = getPatientDiseaseHistory(id, "breast").map(i => ({ ...i, actionName: "Breast Assessment" }));
                const cervical = getPatientDiseaseHistory(id, "cervical").map(i => ({ ...i, actionName: "Cervical Cytology" }));
                const pcos = getPatientDiseaseHistory(id, "pcos").map(i => ({ ...i, actionName: "PCOS Evaluation" }));
                const combined = [...breast, ...cervical, ...pcos].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                if (combined.length === 0) {
                  return <p style={{color: 'var(--color-text-secondary)', fontSize: '0.875rem'}}>No history recorded.</p>;
                }

                return combined.map((item, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineTrack}>
                        <Clock size={14} style={{ color: item.color || "green" }}/>
                      {idx < combined.length - 1 && <div className={styles.timelineLine}></div>}
                    </div>
                    <div className={styles.timelineContent}>
                      <span className={styles.timelineDate}>{new Date(item.timestamp).toLocaleDateString()}</span>
                      <h4 className={styles.timelineEvent}>{item.actionName}</h4>
                      <span style={{ color: item.color || "green", fontWeight: 'bold' }}>{item.primary_assessment}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;

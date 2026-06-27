import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import styles from './AIClinicalAssistant.module.css';

const keywordsToHighlight = [
  'malignant', 'malignancy', 'heterogeneous', 'dysplasia', 'dysplastic', 
  'precancerous', 'carcinoma', 'invasive', 'polycystic', 'abnormal', 
  'suspicious', 'atypical', 'cin1', 'cin2', 'cin3', 'cin', 'mass', 'masses',
  'tumors', 'distortion'
];

const highlightKeywords = (text) => {
  // Split accurately but keep punctuation intact
  const tokens = text.split(/(\b(?:[a-zA-Z0-9-]+)\b)/g);
  
  return tokens.map((token, i) => {
    const cleanToken = token.toLowerCase();
    if (keywordsToHighlight.includes(cleanToken)) {
      const isDanger = ['malignant', 'malignancy', 'carcinoma', 'invasive', 'cin3', 'precancerous'].includes(cleanToken);
      return <span key={i} className={isDanger ? styles.keywordDanger : styles.keyword}>{token}</span>;
    }
    return token;
  });
};

const getBreastBullets = (result, severityScore) => {
  const res = String(result).toUpperCase();
  if (res.includes('HIGH') || severityScore === 3 || res.includes('SEVERE')) return [
    "Irregular mass patterns with heterogeneous density detected.",
    "Architectural distortion suggests possible malignant transformation.",
    "Non-uniform tissue distribution observed in high-risk regions.",
    "Immediate diagnostic mammography or biopsy is strongly advised."
  ];
  if (res.includes('MODERATE') || severityScore === 2) return [
    "Localized tissue irregularities detected with moderate risk characteristics.",
    "Mild asymmetry or density variation observed requiring follow-up.",
    "Consider supplementary ultrasonography for further evaluation."
  ];
  if (res.includes('LOW') || severityScore === 1) return [
    "Minor benign-appearing variations detected in breast tissue.",
    "No strong indicators of malignancy, but monitoring is advised.",
    "Routine clinical evaluation should be maintained."
  ];
  return [ // Normal
    "No abnormal masses or suspicious calcifications detected.",
    "Breast tissue appears structurally uniform and within normal limits.",
    "Continue standard age-appropriate screening protocols."
  ];
};

const getCervicalInsights = (result) => {
  const res = String(result).toUpperCase();
  if (res.includes('MALIGNANT') || res.includes('CANCER')) return {
    primary: "Malignant",
    meaning: "Invasive carcinoma progression beyond epithelial confinement.",
    risk: "Critical Risk (Level 6)",
    action: "Urgent oncology referral required for comprehensive staging."
  };
  if (res.includes('DYSKERATOTIC')) return {
    primary: "Dyskeratotic",
    meaning: "Abnormal keratinization indicating severe pathological changes.",
    risk: "Very High Risk (Level 5)",
    action: "Immediate colposcopy and directed biopsy required."
  };
  if (res.includes('KOILOCYTOTIC')) return {
    primary: "Koilocytotic",
    meaning: "Perinuclear cavitation associated with active HPV infection.",
    risk: "High Risk (Level 4)",
    action: "HPV DNA typing and rigorous gynecological monitoring."
  };
  if (res.includes('PARABASAL')) return {
    primary: "Parabasal",
    meaning: "Presence of immature deep epithelial cells in superficial layers.",
    risk: "Mild Risk (Level 3)",
    action: "Repeat screening or secondary diagnostic testing advised."
  };
  if (res.includes('METAPLASTIC')) return {
    primary: "Metaplastic",
    meaning: "Benign transformation of columnar epithelium to squamous epithelium.",
    risk: "Low Risk (Level 2)",
    action: "Routine monitoring, generally an expected reactive process."
  };
  return { // Normal
    primary: "Normal",
    meaning: "Cytology findings are completely within normal limits (NILM).",
    risk: "Very Low Risk (Level 1)",
    action: "Maintain standard age-appropriate screening interval."
  };
};

const getPCOSBullets = (result, severityScore) => {
  const res = String(result).toUpperCase();
  if (res.includes('HIGH') || severityScore >= 3 || res.includes('SEVERE')) return [
    "Multiple peripheral follicles with increased ovarian volume detected.",
    "Polycystic ovarian morphology consistent with endocrine imbalance.",
    "Strong indication of classical PCOS presentation.",
    "Clinical correlation with hyperandrogenism markers recommended."
  ];
  if (res.includes('MODERATE') || severityScore === 2) return [
    "Mild follicular enlargement observed with possible hormonal irregularity.",
    "Early indicators of polycystic ovarian morphology detected.",
    "Suggest reviewing menstrual history and related symptoms."
  ];
  if (res.includes('LOW') || severityScore === 1) return [
    "Slight ovarian variation detected but not strongly indicative of PCOS.",
    "Findings remain within borderline clinical range.",
    "Routine sonographic follow-up advised if symptomatic."
  ];
  return [
    "Ovarian morphology within normal limits.",
    "No evidence of polycystic structure or abnormal follicular distribution.",
    "Findings do not suggest polycystic ovary syndrome."
  ];
};

const AIClinicalAssistant = ({ disease, result, severityScore }) => {
  const bullets = useMemo(() => {
    switch (String(disease).toLowerCase()) {
      case 'breast':
        return getBreastBullets(result, severityScore);
      case 'cervical':
        return []; // Not used, handled differently
      case 'pcos':
        return getPCOSBullets(result, severityScore);
      default:
        return [
          "Clinical parameters evaluated.",
          "Refer to primary diagnostic criteria.",
          "Consider specialist consultation if symptomatic."
        ];
    }
  }, [disease, result, severityScore]);

  const isCervical = String(disease).toLowerCase() === 'cervical';
  const cervicalData = isCervical ? getCervicalInsights(result) : null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Sparkles size={22} className={styles.icon} />
        <h3 className={styles.title}>AI Clinical Assistant</h3>
      </header>

      {!isCervical ? (
        <ul className={styles.bulletList}>
          {bullets.map((bullet, idx) => (
            <li 
              key={idx} 
              className={styles.bulletItem} 
              style={{ animationDelay: (idx * 0.15) + 's' }}
            >
              <span className={styles.bulletDot}>•</span>
              <div>{highlightKeywords(bullet)}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.cervicalFlow}>
          <div className={styles.flowStep} style={{ animationDelay: '0.1s' }}>
            <strong>Primary Result</strong>
            {highlightKeywords(cervicalData.primary)}
          </div>
          <div className={styles.flowArrow} style={{ animationDelay: '0.2s' }}>↓</div>
          <div className={styles.flowStep} style={{ animationDelay: '0.3s' }}>
            <strong>Clinical Meaning</strong>
            {highlightKeywords(cervicalData.meaning)}
          </div>
          <div className={styles.flowArrow} style={{ animationDelay: '0.4s' }}>↓</div>
          <div className={styles.flowStep} style={{ animationDelay: '0.5s' }}>
            <strong>Risk Level</strong>
            {highlightKeywords(cervicalData.risk)}
          </div>
          <div className={styles.flowArrow} style={{ animationDelay: '0.6s' }}>↓</div>
          <div className={styles.flowStep} style={{ animationDelay: '0.7s' }}>
            <strong>Action Plan</strong>
            {highlightKeywords(cervicalData.action)}
          </div>
        </div>
      )}

      {isCervical && (
        <div className={styles.tableContainer}>
          <div className={styles.tableTitle}>Cervical Disease Progression Reference</div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Stage</th>
                <th>Risk Level</th>
                <th>Clinical Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Normal</td>
                <td className={styles.levelVeryLow}>Very Low</td>
                <td>Healthy epithelial cells</td>
              </tr>
              <tr>
                <td>Metaplastic</td>
                <td className={styles.levelLow}>Low</td>
                <td>Benign transformation</td>
              </tr>
              <tr>
                <td>Parabasal</td>
                <td className={styles.levelModerate}>Mild</td>
                <td>Immature atypical cells</td>
              </tr>
              <tr>
                <td>Koilocytotic</td>
                <td className={styles.levelModerate}>Medium</td>
                <td>HPV-associated changes</td>
              </tr>
              <tr>
                <td>Dyskeratotic</td>
                <td className={styles.levelHigh}>Very High</td>
                <td>Abnormal keratinization</td>
              </tr>
              <tr>
                <td>Malignant</td>
                <td className={styles.levelCritical}>Critical</td>
                <td>Invasive carcinoma</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AIClinicalAssistant;

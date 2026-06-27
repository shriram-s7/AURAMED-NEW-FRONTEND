export function normalizeResponse(disease, res) {
  if (disease === "breast") {
    let primary_assessment = "LOW";
    let severity_score = 1;
    let confidence = res.final_score || 0;
    const diag = (res.diagnosis || "").toUpperCase();
    
    if (diag.includes("HIGH")) {
      primary_assessment = "HIGH";
      severity_score = 3;
    } else if (diag.includes("MODERATE")) {
      primary_assessment = "MODERATE";
      severity_score = 2;
    } else {
      primary_assessment = "LOW";
      severity_score = 1;
    }
    
    return {
      disease,
      primary_assessment,
      severity_score,
      confidence,
      explanation: res.explanation?.join(" ") || "",
      recommended_action: res.recommended_actions?.[0] || "",
      clinical_significance: "",
      longitudinal_insight: "",
      isPositive: primary_assessment === "HIGH" || primary_assessment === "MODERATE"
    };
  }

  if (disease === "cervical") {
    const classMap = {
      "Normal": "Healthy epithelial cells",
      "Parabasal": "Immature cell pattern (monitor)",
      "Metaplastic": "Benign transformation (low concern)",
      "Koilocytotic": "HPV-associated cellular changes",
      "Dyskeratotic": "Abnormal keratinization (higher concern)"
    };
    
    return {
      disease,
      primary_assessment: res.prediction,
      cytology_class: res.prediction,
      confidence: res.confidence || 0,
      explanation: res.prediction,
      clinical_significance: classMap[res.prediction] || res.prediction,
      recommended_action: "Follow cytology guidelines",
      longitudinal_insight: "",
      isPositive: res.prediction !== "Normal"
    };
  }

  if (disease === "pcos") {
    return {
      disease,
      primary_assessment: res.class,
      pcos_result: res.class,
      confidence: 0.9,
      explanation: res.class === "PCOS" 
        ? "Ovarian morphology suggests polycystic condition" 
        : "Ovarian morphology within normal limits",
      clinical_significance: res.class,
      recommended_action: res.class === "PCOS"
        ? "Consult gynecologist"
        : "Routine monitoring",
      longitudinal_insight: "",
      isPositive: res.class === "PCOS"
    };
  }
}

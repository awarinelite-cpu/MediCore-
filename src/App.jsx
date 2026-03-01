import { useState, useEffect, useRef } from "react";

// ============================================================
// FIREBASE CONFIGURATION
// Replace with your actual Firebase project config
// ============================================================
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// ============================================================
// MOCK DATA (replace with Firestore reads in production)
// ============================================================
const MOCK_DATA = {
  diagnoses: [
    {
      id: "dm",
      name: "Diabetes Mellitus",
      description:
        "Chronic metabolic disorder characterized by persistent hyperglycemia due to defects in insulin secretion, insulin action, or both.",
      types: [
        {
          id: "dm-t1",
          type_name: "Type 1",
          cause:
            "Autoimmune destruction of pancreatic beta cells leading to absolute insulin deficiency.",
        },
        {
          id: "dm-t2",
          type_name: "Type 2",
          cause:
            "Insulin resistance with relative insulin deficiency; associated with obesity and sedentary lifestyle.",
        },
        {
          id: "dm-gest",
          type_name: "Gestational",
          cause:
            "Glucose intolerance first recognized during pregnancy due to placental hormones.",
        },
      ],
    },
    {
      id: "htn",
      name: "Hypertension",
      description:
        "Persistent elevation of systemic arterial blood pressure (≥130/80 mmHg), a major risk factor for cardiovascular, cerebrovascular, and renal disease.",
      types: [
        {
          id: "htn-primary",
          type_name: "Primary (Essential)",
          cause:
            "Multifactorial — genetic predisposition, high sodium intake, obesity, stress, and inactivity.",
        },
        {
          id: "htn-secondary",
          type_name: "Secondary",
          cause:
            "Identifiable underlying condition such as renal artery stenosis, primary aldosteronism, or pheochromocytoma.",
        },
      ],
    },
    {
      id: "pneumonia",
      name: "Pneumonia",
      description:
        "Acute infection of the lung parenchyma causing alveolar inflammation and consolidation, impairing gas exchange.",
      types: [
        {
          id: "pneu-bac",
          type_name: "Bacterial",
          cause:
            "Streptococcus pneumoniae most common; also Klebsiella, Staphylococcus, Haemophilus.",
        },
        {
          id: "pneu-viral",
          type_name: "Viral",
          cause: "Influenza, RSV, COVID-19, adenovirus.",
        },
        {
          id: "pneu-atypical",
          type_name: "Atypical",
          cause: "Mycoplasma pneumoniae, Chlamydophila, Legionella.",
        },
      ],
    },
  ],
  typeDetails: {
    "dm-t2": {
      lab_tests: [
        { id: "l1", test_name: "Fasting Blood Sugar", normal_min: 70, normal_max: 99, unit: "mg/dL", critical_high: 400, critical_low: 40 },
        { id: "l2", test_name: "HbA1c", normal_min: 0, normal_max: 5.7, unit: "%", critical_high: 14 },
        { id: "l3", test_name: "Random Blood Glucose", normal_min: 70, normal_max: 140, unit: "mg/dL", critical_high: 500 },
        { id: "l4", test_name: "Serum Creatinine", normal_min: 0.6, normal_max: 1.2, unit: "mg/dL", critical_high: 10 },
      ],
      medications: [
        {
          id: "m1", drug_name: "Metformin", drug_class: "Biguanide", treatment_role: "First-line",
          contraindications: "eGFR <30, IV contrast, hepatic failure",
          monitoring_required: "Renal function, B12 levels",
          guideline_source: "ADA 2024",
          dosages: [{ dose: "500–1000 mg", form: "Tablet", frequency: "BD with meals", route: "Oral", renal_adjustment: "Reduce if eGFR 30–45", pediatric_adjustment: "10 mg/kg/day" }],
          side_effects: ["GI upset (nausea, diarrhea)", "Lactic acidosis (rare)", "B12 deficiency (long-term)"],
        },
        {
          id: "m2", drug_name: "Glimepiride", drug_class: "Sulfonylurea", treatment_role: "Second-line",
          contraindications: "Sulfonamide allergy, type 1 DM, pregnancy",
          monitoring_required: "Blood glucose, weight",
          guideline_source: "ADA 2024",
          dosages: [{ dose: "1–8 mg", form: "Tablet", frequency: "Once daily with breakfast", route: "Oral", renal_adjustment: "Use with caution", pediatric_adjustment: "Not recommended" }],
          side_effects: ["Hypoglycemia", "Weight gain", "Skin reactions"],
        },
        {
          id: "m3", drug_name: "Empagliflozin", drug_class: "SGLT-2 Inhibitor", treatment_role: "Adjunct",
          contraindications: "eGFR <30, type 1 DM, DKA",
          monitoring_required: "Renal function, UTI symptoms, BP",
          guideline_source: "ADA 2024 / ESC 2023",
          dosages: [{ dose: "10–25 mg", form: "Tablet", frequency: "Once daily", route: "Oral", renal_adjustment: "Avoid if eGFR <30", pediatric_adjustment: "Not approved" }],
          side_effects: ["UTI/genital mycotic infections", "DKA (rare)", "Euglycemic DKA", "Polyuria"],
        },
        {
          id: "m4", drug_name: "Insulin Regular", drug_class: "Insulin", treatment_role: "Emergency",
          contraindications: "Hypoglycemia",
          monitoring_required: "Blood glucose q1-2h, signs of hypoglycemia",
          guideline_source: "ADA 2024",
          dosages: [{ dose: "Sliding scale or 0.1 U/kg/hr infusion", form: "Solution", frequency: "As directed", route: "SC / IV", renal_adjustment: "Reduce dose, monitor closely", pediatric_adjustment: "0.05–0.1 U/kg/hr" }],
          side_effects: ["Hypoglycemia", "Lipodystrophy at injection site", "Hypokalemia (IV use)"],
        },
      ],
      nursing_considerations: [
        "Monitor blood glucose before meals and at bedtime",
        "Assess HbA1c every 3 months until controlled, then every 6 months",
        "Educate on carbohydrate counting and glycemic index",
        "Encourage 150 min/week moderate-intensity exercise",
        "Assess for signs of hypoglycemia: tremor, diaphoresis, confusion",
        "Perform regular foot inspections — check sensation, pulses, skin integrity",
        "Monitor renal function (creatinine, eGFR) every 6–12 months",
        "Encourage smoking cessation and cardiovascular risk reduction",
      ],
    },
    "dm-t1": {
      lab_tests: [
        { id: "l1", test_name: "Fasting Blood Sugar", normal_min: 70, normal_max: 99, unit: "mg/dL", critical_high: 400, critical_low: 40 },
        { id: "l2", test_name: "HbA1c", normal_min: 0, normal_max: 5.7, unit: "%" },
        { id: "l3", test_name: "C-Peptide", normal_min: 0.5, normal_max: 2.0, unit: "ng/mL" },
        { id: "l4", test_name: "Anti-GAD Antibodies", normal_min: 0, normal_max: 5, unit: "IU/mL" },
      ],
      medications: [
        {
          id: "m5", drug_name: "Insulin Glargine", drug_class: "Long-acting Insulin", treatment_role: "First-line",
          contraindications: "Hypoglycemia",
          monitoring_required: "Fasting glucose, weight, injection sites",
          guideline_source: "ADA 2024",
          dosages: [{ dose: "0.2–0.4 U/kg/day", form: "Solution", frequency: "Once daily (bedtime)", route: "SC", renal_adjustment: "Reduce dose", pediatric_adjustment: "0.2 U/kg/day starting" }],
          side_effects: ["Hypoglycemia", "Weight gain", "Injection site reactions"],
        },
        {
          id: "m6", drug_name: "Insulin Aspart", drug_class: "Rapid-acting Insulin", treatment_role: "First-line",
          contraindications: "Hypoglycemia",
          monitoring_required: "Pre/post-meal glucose",
          guideline_source: "ADA 2024",
          dosages: [{ dose: "Individualised — carb ratio", form: "Solution", frequency: "Before meals", route: "SC", renal_adjustment: "Reduce dose", pediatric_adjustment: "0.5–1 U per 10–15g carbs" }],
          side_effects: ["Hypoglycemia", "Lipohypertrophy"],
        },
      ],
      nursing_considerations: [
        "Teach correct insulin injection technique and site rotation",
        "Educate on carbohydrate-to-insulin ratio (ICR) and correction factor",
        "Ensure patient has glucagon emergency kit",
        "Monitor for signs of DKA: polyuria, polydipsia, fruity breath, vomiting",
        "Assess psychosocial impact — diabetes distress is common",
        "Support continuous glucose monitoring (CGM) use if available",
      ],
    },
    "htn-primary": {
      lab_tests: [
        { id: "l5", test_name: "Serum Creatinine", normal_min: 0.6, normal_max: 1.2, unit: "mg/dL", critical_high: 10 },
        { id: "l6", test_name: "Serum Potassium", normal_min: 3.5, normal_max: 5.0, unit: "mEq/L", critical_high: 6.5, critical_low: 2.5 },
        { id: "l7", test_name: "Fasting Lipid Panel (LDL)", normal_min: 0, normal_max: 100, unit: "mg/dL" },
        { id: "l8", test_name: "Urine Albumin:Creatinine Ratio", normal_min: 0, normal_max: 30, unit: "mg/g" },
      ],
      medications: [
        {
          id: "m7", drug_name: "Amlodipine", drug_class: "CCB (Dihydropyridine)", treatment_role: "First-line",
          contraindications: "Cardiogenic shock, severe aortic stenosis",
          monitoring_required: "BP, peripheral oedema, heart rate",
          guideline_source: "JNC 8 / ESC 2023",
          dosages: [{ dose: "2.5–10 mg", form: "Tablet", frequency: "Once daily", route: "Oral", renal_adjustment: "None required", pediatric_adjustment: "0.1–0.3 mg/kg/day" }],
          side_effects: ["Peripheral oedema", "Headache", "Flushing", "Palpitations"],
        },
        {
          id: "m8", drug_name: "Lisinopril", drug_class: "ACE Inhibitor", treatment_role: "First-line",
          contraindications: "Angioedema, pregnancy, bilateral renal artery stenosis",
          monitoring_required: "BP, creatinine, potassium",
          guideline_source: "JNC 8 / ESC 2023",
          dosages: [{ dose: "5–40 mg", form: "Tablet", frequency: "Once daily", route: "Oral", renal_adjustment: "Reduce dose if eGFR <30", pediatric_adjustment: "0.1 mg/kg/day" }],
          side_effects: ["Dry cough", "Hyperkalaemia", "Angioedema (rare)", "First-dose hypotension"],
        },
      ],
      nursing_considerations: [
        "Measure BP in both arms at first visit; use arm with higher reading",
        "Encourage DASH diet: low sodium (<2g/day), high potassium, fruits and vegetables",
        "Promote aerobic exercise 30 min most days",
        "Monitor for orthostatic hypotension — especially in elderly",
        "Assess medication adherence and side effects at each visit",
        "Educate on home BP monitoring and target goals",
      ],
    },
    "pneu-bac": {
      lab_tests: [
        { id: "l9", test_name: "WBC Count", normal_min: 4.5, normal_max: 11.0, unit: "×10³/μL", critical_high: 30, critical_low: 2 },
        { id: "l10", test_name: "CRP", normal_min: 0, normal_max: 5, unit: "mg/L", critical_high: 200 },
        { id: "l11", test_name: "SpO2", normal_min: 95, normal_max: 100, unit: "%", critical_low: 88 },
        { id: "l12", test_name: "Procalcitonin", normal_min: 0, normal_max: 0.1, unit: "ng/mL", critical_high: 10 },
      ],
      medications: [
        {
          id: "m9", drug_name: "Amoxicillin-Clavulanate", drug_class: "Beta-lactam + Inhibitor", treatment_role: "First-line",
          contraindications: "Penicillin allergy",
          monitoring_required: "LFTs, signs of superinfection",
          guideline_source: "IDSA / BTS 2023",
          dosages: [{ dose: "875/125 mg", form: "Tablet", frequency: "BD", route: "Oral", renal_adjustment: "Reduce if eGFR <30", pediatric_adjustment: "45 mg/kg/day (amox component)" }],
          side_effects: ["Diarrhoea", "Nausea", "Rash", "Hepatotoxicity (rare)"],
        },
        {
          id: "m10", drug_name: "Azithromycin", drug_class: "Macrolide", treatment_role: "Adjunct",
          contraindications: "QT prolongation, hepatic disease",
          monitoring_required: "ECG (QT interval), liver function",
          guideline_source: "IDSA 2023",
          dosages: [{ dose: "500 mg Day 1, then 250 mg", form: "Tablet", frequency: "Once daily × 5 days", route: "Oral", renal_adjustment: "None required", pediatric_adjustment: "10 mg/kg Day 1, then 5 mg/kg" }],
          side_effects: ["GI upset", "QT prolongation", "Hepatotoxicity", "Hearing changes"],
        },
      ],
      nursing_considerations: [
        "Monitor respiratory rate, SpO2, and work of breathing every 4 hours",
        "Position patient semi-recumbent (30–45°) to optimise lung expansion",
        "Encourage deep breathing exercises and incentive spirometry",
        "Ensure adequate fluid intake unless contraindicated",
        "Monitor temperature trend — persistent fever may indicate treatment failure",
        "Assess sputum character and quantity; send culture if not already done",
        "Administer supplemental oxygen to maintain SpO2 ≥94%",
      ],
    },
  },
};

// Helper to get type details — falls back to empty structure
function getTypeDetails(typeId) {
  return (
    MOCK_DATA.typeDetails[typeId] || {
      lab_tests: [],
      medications: [],
      nursing_considerations: [],
    }
  );
}

// ============================================================
// ROLE CONFIG
// ============================================================
const ROLE_CONFIG = {
  "First-line": { color: "#22c55e", bg: "#dcfce7", border: "#86efac", label: "🟢 First-Line" },
  "Second-line": { color: "#3b82f6", bg: "#dbeafe", border: "#93c5fd", label: "🔵 Second-Line" },
  Adjunct: { color: "#a855f7", bg: "#f3e8ff", border: "#d8b4fe", label: "🟣 Adjunct" },
  Emergency: { color: "#ef4444", bg: "#fee2e2", border: "#fca5a5", label: "🔴 Emergency" },
};

// ============================================================
// STYLES (CSS-in-JS via style tag injection)
// ============================================================
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #0a0f1e;
    color: #e2e8f0;
    min-height: 100vh;
  }

  :root {
    --accent: #00d4ff;
    --accent2: #7c3aed;
    --surface: #0f172a;
    --surface2: #1e293b;
    --surface3: #334155;
    --text: #e2e8f0;
    --text-dim: #94a3b8;
    --border: rgba(148,163,184,0.15);
    --radius: 12px;
    --radius-lg: 20px;
  }

  .mc-app {
    min-height: 100vh;
    background: #0a0f1e;
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 212, 255, 0.08) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 60%, rgba(124, 58, 237, 0.06) 0%, transparent 50%);
  }

  /* HEADER */
  .mc-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(10, 15, 30, 0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    padding: 0 1.5rem;
  }
  .mc-header-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }
  .mc-logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
  }
  .mc-logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #00d4ff, #7c3aed);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  }
  .mc-logo-text {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.3rem;
    background: linear-gradient(135deg, #00d4ff, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .mc-badge {
    font-size: 0.65rem;
    font-weight: 600;
    background: rgba(0, 212, 255, 0.15);
    color: var(--accent);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 20px;
    padding: 2px 8px;
    letter-spacing: 0.05em;
  }
  .mc-disclaimer-btn {
    font-size: 0.75rem;
    color: var(--text-dim);
    background: none;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 6px 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; gap: 6px;
  }
  .mc-disclaimer-btn:hover { color: var(--text); border-color: var(--text-dim); }

  /* MAIN */
  .mc-main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }

  /* SEARCH */
  .mc-search-wrap {
    margin-bottom: 2.5rem;
    position: relative;
  }
  .mc-search-hero {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  .mc-search-hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #f1f5f9, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .mc-search-hero p {
    color: var(--text-dim);
    font-size: 0.95rem;
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
  }
  .mc-search-box {
    position: relative;
    max-width: 600px;
    margin: 0 auto;
  }
  .mc-search-icon {
    position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
    color: var(--accent); font-size: 1.2rem; pointer-events: none;
  }
  .mc-search-input {
    width: 100%;
    background: var(--surface2);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 14px 16px 14px 48px;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .mc-search-input::placeholder { color: var(--text-dim); }
  .mc-search-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1), 0 0 30px rgba(0, 212, 255, 0.05);
  }
  .mc-search-clear {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 1.1rem;
    transition: color 0.2s;
  }
  .mc-search-clear:hover { color: var(--text); }
  .mc-search-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%; transform: translateX(-50%);
    width: 100%; max-width: 600px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    z-index: 50;
  }
  .mc-search-item {
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.15s;
    display: flex; align-items: center; gap: 10px;
    border-bottom: 1px solid var(--border);
  }
  .mc-search-item:last-child { border-bottom: none; }
  .mc-search-item:hover { background: rgba(0, 212, 255, 0.05); }
  .mc-search-item-name { font-weight: 500; font-size: 0.9rem; }
  .mc-search-item-desc { font-size: 0.75rem; color: var(--text-dim); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* BREADCRUMB */
  .mc-breadcrumb {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.82rem; color: var(--text-dim);
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }
  .mc-breadcrumb-btn {
    background: none; border: none; color: var(--accent);
    cursor: pointer; font-size: 0.82rem; padding: 0;
    text-decoration: underline; text-underline-offset: 3px;
    font-family: 'DM Sans', sans-serif;
  }
  .mc-breadcrumb-btn:hover { color: #67e8f9; }

  /* CARD */
  .mc-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    margin-bottom: 1.25rem;
  }
  .mc-card-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 1rem; margin-bottom: 1rem;
  }
  .mc-section-title {
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 1rem;
    display: flex; align-items: center; gap: 8px;
  }

  /* DIAGNOSIS OVERVIEW */
  .mc-diag-name {
    font-family: 'Syne', sans-serif;
    font-size: 1.6rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #f1f5f9, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .mc-diag-desc {
    color: var(--text-dim);
    line-height: 1.7;
    font-size: 0.95rem;
  }

  /* TYPE SELECTOR */
  .mc-type-grid {
    display: flex; flex-wrap: wrap; gap: 10px;
  }
  .mc-type-btn {
    padding: 10px 20px;
    border-radius: 30px;
    border: 1.5px solid var(--border);
    background: var(--surface2);
    color: var(--text-dim);
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  .mc-type-btn:hover { border-color: var(--accent); color: var(--accent); }
  .mc-type-btn.active {
    background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15));
    border-color: var(--accent);
    color: #fff;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.15);
  }
  .mc-cause-box {
    margin-top: 1rem;
    background: rgba(0, 212, 255, 0.05);
    border-left: 3px solid var(--accent);
    border-radius: 0 8px 8px 0;
    padding: 12px 16px;
    font-size: 0.9rem;
    color: var(--text-dim);
  }
  .mc-cause-label { font-weight: 600; color: var(--text); margin-bottom: 4px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }

  /* LAB PANEL */
  .mc-lab-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
    margin-bottom: 1rem;
  }
  .mc-lab-card {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
    transition: border-color 0.2s;
  }
  .mc-lab-name { font-weight: 600; font-size: 0.88rem; margin-bottom: 8px; }
  .mc-lab-range { font-size: 0.75rem; color: var(--text-dim); margin-bottom: 10px; }
  .mc-lab-input-wrap { display: flex; align-items: center; gap: 8px; }
  .mc-lab-input {
    flex: 1; background: var(--surface3);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    color: var(--text);
    outline: none;
    width: 100%;
    transition: border-color 0.2s;
  }
  .mc-lab-input:focus { border-color: var(--accent); }
  .mc-lab-unit { font-size: 0.75rem; color: var(--text-dim); white-space: nowrap; }
  .mc-lab-result {
    margin-top: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;
    display: inline-block;
  }
  .mc-lab-result.high { background: #fee2e2; color: #b91c1c; }
  .mc-lab-result.low { background: #fff7ed; color: #c2410c; }
  .mc-lab-result.normal { background: #dcfce7; color: #15803d; }
  .mc-lab-result.critical { background: #7f1d1d; color: #fca5a5; animation: pulse-red 1s infinite; }

  @keyframes pulse-red {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  /* MEDICATIONS */
  .mc-role-section { margin-bottom: 1.5rem; }
  .mc-role-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'Syne', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 20px;
    margin-bottom: 1rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border: 1px solid;
  }
  .mc-med-card {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    margin-bottom: 10px;
    transition: border-color 0.2s;
  }
  .mc-med-card:hover { border-color: rgba(148,163,184,0.3); }
  .mc-med-header {
    padding: 14px 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: space-between;
    gap: 1rem;
  }
  .mc-med-drug { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem; }
  .mc-med-class { font-size: 0.78rem; color: var(--text-dim); margin-top: 2px; }
  .mc-med-toggle { color: var(--text-dim); font-size: 1rem; transition: transform 0.2s; }
  .mc-med-toggle.open { transform: rotate(180deg); }
  .mc-med-body {
    padding: 0 16px 14px;
    border-top: 1px solid var(--border);
    padding-top: 14px;
  }
  .mc-med-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
    margin-bottom: 12px;
  }
  .mc-med-field { }
  .mc-med-field-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-dim); margin-bottom: 3px; font-weight: 600; }
  .mc-med-field-value { font-size: 0.88rem; font-weight: 500; }
  .mc-tag { display: inline-block; background: var(--surface3); border-radius: 6px; padding: 2px 8px; font-size: 0.78rem; margin: 2px; }

  .mc-sub-section { margin-top: 10px; }
  .mc-sub-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-dim); margin-bottom: 6px; }
  .mc-pill-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .mc-pill {
    font-size: 0.78rem; padding: 4px 12px;
    border-radius: 20px;
    border: 1px solid var(--border);
    color: var(--text-dim);
  }
  .mc-pill.se { border-color: rgba(239,68,68,0.3); color: #fca5a5; background: rgba(239,68,68,0.06); }

  .mc-info-row { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
  .mc-info-item {
    font-size: 0.78rem;
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
    padding: 6px 12px;
    border: 1px solid var(--border);
    flex: 1; min-width: 180px;
  }
  .mc-info-item-label { color: var(--text-dim); margin-bottom: 2px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; }

  /* NURSING */
  .mc-nursing-list { list-style: none; }
  .mc-nursing-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--text-dim);
  }
  .mc-nursing-item:last-child { border-bottom: none; }
  .mc-nursing-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--accent);
    margin-top: 6px; flex-shrink: 0;
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
  }

  /* DISCLAIMER BANNER */
  .mc-disclaimer-banner {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.25);
    border-radius: var(--radius);
    padding: 12px 16px;
    font-size: 0.8rem;
    color: #fbbf24;
    display: flex; align-items: flex-start; gap: 10px;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  /* EMPTY STATE */
  .mc-empty {
    text-align: center;
    padding: 4rem 2rem;
  }
  .mc-empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
  .mc-empty-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-dim); }
  .mc-empty-sub { font-size: 0.85rem; color: #475569; }

  /* QUICK STATS */
  .mc-stats {
    display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 1.5rem;
  }
  .mc-stat {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 16px;
    flex: 1; min-width: 120px;
    text-align: center;
  }
  .mc-stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--accent), #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .mc-stat-label { font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

  /* BACK BTN */
  .mc-back-btn {
    background: none; border: 1px solid var(--border);
    border-radius: 8px; padding: 8px 14px;
    color: var(--text-dim); font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 6px;
  }
  .mc-back-btn:hover { background: var(--surface2); color: var(--text); }

  /* FOOTER */
  .mc-footer {
    text-align: center;
    padding: 2rem;
    font-size: 0.75rem;
    color: #334155;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
  }

  /* SCROLL ANIMATION */
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .mc-animate { animation: fadeSlideIn 0.35s ease forwards; }

  /* RESPONSIVE */
  @media (max-width: 640px) {
    .mc-main { padding: 1.25rem 1rem 3rem; }
    .mc-search-hero h1 { font-size: 1.5rem; }
    .mc-diag-name { font-size: 1.3rem; }
  }
`;

// ============================================================
// HELPER: Interpret lab value
// ============================================================
function interpretLab(value, test) {
  if (value === "" || value === null || isNaN(Number(value))) return null;
  const v = Number(value);
  if (test.critical_high && v >= test.critical_high) return "critical-high";
  if (test.critical_low && v <= test.critical_low) return "critical-low";
  if (v > test.normal_max) return "high";
  if (v < test.normal_min) return "low";
  return "normal";
}

function getResultLabel(result) {
  if (!result) return null;
  const map = {
    "critical-high": { label: "🚨 Critical High", cls: "critical" },
    "critical-low": { label: "🚨 Critical Low", cls: "critical" },
    high: { label: "🔴 High", cls: "high" },
    low: { label: "🟠 Low", cls: "low" },
    normal: { label: "🟢 Normal", cls: "normal" },
  };
  return map[result] || null;
}

// ============================================================
// COMPONENTS
// ============================================================

function MedCard({ med }) {
  const [open, setOpen] = useState(false);
  const d = med.dosages[0] || {};
  return (
    <div className="mc-med-card">
      <div className="mc-med-header" onClick={() => setOpen((o) => !o)}>
        <div>
          <div className="mc-med-drug">{med.drug_name}</div>
          <div className="mc-med-class">{med.drug_class}</div>
        </div>
        <span className={`mc-med-toggle ${open ? "open" : ""}`}>▾</span>
      </div>
      {open && (
        <div className="mc-med-body mc-animate">
          <div className="mc-med-grid">
            {d.dose && (
              <div className="mc-med-field">
                <div className="mc-med-field-label">Dose</div>
                <div className="mc-med-field-value">{d.dose}</div>
              </div>
            )}
            {d.form && (
              <div className="mc-med-field">
                <div className="mc-med-field-label">Form</div>
                <div className="mc-med-field-value">{d.form}</div>
              </div>
            )}
            {d.frequency && (
              <div className="mc-med-field">
                <div className="mc-med-field-label">Frequency</div>
                <div className="mc-med-field-value">{d.frequency}</div>
              </div>
            )}
            {d.route && (
              <div className="mc-med-field">
                <div className="mc-med-field-label">Route</div>
                <div className="mc-med-field-value">{d.route}</div>
              </div>
            )}
          </div>

          {med.side_effects?.length > 0 && (
            <div className="mc-sub-section">
              <div className="mc-sub-title">Side Effects</div>
              <div className="mc-pill-list">
                {med.side_effects.map((s, i) => (
                  <span key={i} className="mc-pill se">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mc-info-row">
            {med.contraindications && (
              <div className="mc-info-item">
                <div className="mc-info-item-label">⚠️ Contraindications</div>
                {med.contraindications}
              </div>
            )}
            {med.monitoring_required && (
              <div className="mc-info-item">
                <div className="mc-info-item-label">📊 Monitoring</div>
                {med.monitoring_required}
              </div>
            )}
          </div>

          <div className="mc-info-row">
            {d.renal_adjustment && (
              <div className="mc-info-item">
                <div className="mc-info-item-label">🫘 Renal Adjustment</div>
                {d.renal_adjustment}
              </div>
            )}
            {d.pediatric_adjustment && (
              <div className="mc-info-item">
                <div className="mc-info-item-label">👶 Pediatric Dose</div>
                {d.pediatric_adjustment}
              </div>
            )}
            {med.guideline_source && (
              <div className="mc-info-item">
                <div className="mc-info-item-label">📋 Guideline</div>
                {med.guideline_source}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MedicationSection({ medications }) {
  const grouped = {};
  (medications || []).forEach((m) => {
    if (!grouped[m.treatment_role]) grouped[m.treatment_role] = [];
    grouped[m.treatment_role].push(m);
  });

  const roleOrder = ["First-line", "Second-line", "Adjunct", "Emergency"];
  const present = roleOrder.filter((r) => grouped[r]);

  if (!present.length) return null;

  return (
    <div className="mc-card mc-animate">
      <div className="mc-section-title">💊 Medications</div>
      {present.map((role) => {
        const cfg = ROLE_CONFIG[role] || {};
        return (
          <div key={role} className="mc-role-section">
            <div
              className="mc-role-badge"
              style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
            >
              {cfg.label || role}
            </div>
            {grouped[role].map((med) => (
              <MedCard key={med.id} med={med} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function LabPanel({ labs }) {
  const [values, setValues] = useState({});

  return (
    <div className="mc-card mc-animate">
      <div className="mc-section-title">🔬 Lab Tests</div>
      <div className="mc-lab-grid">
        {labs.map((t) => {
          const val = values[t.id] ?? "";
          const result = interpretLab(val, t);
          const rl = getResultLabel(result);
          return (
            <div key={t.id} className="mc-lab-card">
              <div className="mc-lab-name">{t.test_name}</div>
              <div className="mc-lab-range">
                Normal: {t.normal_min} – {t.normal_max} {t.unit}
                {t.critical_high && ` | Critical ≥${t.critical_high}`}
                {t.critical_low && ` | Critical ≤${t.critical_low}`}
              </div>
              <div className="mc-lab-input-wrap">
                <input
                  className="mc-lab-input"
                  type="number"
                  placeholder="Enter value"
                  value={val}
                  onChange={(e) => setValues((v) => ({ ...v, [t.id]: e.target.value }))}
                />
                <span className="mc-lab-unit">{t.unit}</span>
              </div>
              {rl && (
                <div className={`mc-lab-result ${rl.cls}`}>{rl.label}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NursingPanel({ items }) {
  return (
    <div className="mc-card mc-animate">
      <div className="mc-section-title">🩺 Nursing Considerations</div>
      <ul className="mc-nursing-list">
        {items.map((c, i) => (
          <li key={i} className="mc-nursing-item">
            <div className="mc-nursing-dot" />
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function MediCoreApp() {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDiag, setSelectedDiag] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const inputRef = useRef(null);

  // Inject CSS
  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = CSS;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  const filtered = MOCK_DATA.diagnoses.filter(
    (d) =>
      query.length > 0 &&
      d.name.toLowerCase().includes(query.toLowerCase())
  );

  function selectDiag(diag) {
    setSelectedDiag(diag);
    setSelectedType(null);
    setQuery(diag.name);
    setShowDropdown(false);
  }

  function selectType(t) {
    setSelectedType(t);
  }

  function reset() {
    setSelectedDiag(null);
    setSelectedType(null);
    setQuery("");
  }

  const typeDetails = selectedType ? getTypeDetails(selectedType.id) : null;

  return (
    <div className="mc-app">
      {/* Header */}
      <header className="mc-header">
        <div className="mc-header-inner">
          <button className="mc-logo" onClick={reset} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="mc-logo-icon">🏥</div>
            <span className="mc-logo-text">MediCore</span>
            <span className="mc-badge">PWA</span>
          </button>
          <button
            className="mc-disclaimer-btn"
            onClick={() => setShowDisclaimer((s) => !s)}
          >
            ⚕️ Disclaimer
          </button>
        </div>
      </header>

      <main className="mc-main">
        {/* Disclaimer */}
        {showDisclaimer && (
          <div className="mc-disclaimer-banner">
            <span>⚠️</span>
            <span>
              <strong>For educational support only.</strong> MediCore is not a substitute for clinical judgment. Always verify dosages and guidelines with authoritative sources (BNF, Micromedex, local protocols) before clinical application.
            </span>
          </div>
        )}

        {/* Search */}
        <div className="mc-search-wrap">
          {!selectedDiag && (
            <div className="mc-search-hero">
              <h1>Clinical Companion</h1>
              <p>Search any diagnosis to access lab interpretation, medications, and nursing considerations.</p>
            </div>
          )}

          {selectedDiag && (
            <div className="mc-breadcrumb">
              <button className="mc-breadcrumb-btn" onClick={reset}>Home</button>
              <span>›</span>
              <span>{selectedDiag.name}</span>
              {selectedType && (
                <>
                  <span>›</span>
                  <span>{selectedType.type_name}</span>
                </>
              )}
            </div>
          )}

          <div className="mc-search-box" style={{ maxWidth: selectedDiag ? "100%" : "600px" }}>
            <span className="mc-search-icon">🔍</span>
            <input
              ref={inputRef}
              className="mc-search-input"
              placeholder="Search diagnosis (e.g. Diabetes, Hypertension…)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
                if (!e.target.value) { setSelectedDiag(null); setSelectedType(null); }
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            />
            {query && (
              <button className="mc-search-clear" onClick={reset}>✕</button>
            )}
            {showDropdown && filtered.length > 0 && (
              <div className="mc-search-dropdown">
                {filtered.map((d) => (
                  <div key={d.id} className="mc-search-item" onMouseDown={() => selectDiag(d)}>
                    <span>🏷️</span>
                    <div>
                      <div className="mc-search-item-name">{d.name}</div>
                      <div className="mc-search-item-desc">{d.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RESULTS */}
        {!selectedDiag && (
          <div className="mc-empty">
            <div className="mc-empty-icon">🩺</div>
            <div className="mc-empty-title">Search a condition to begin</div>
            <div className="mc-empty-sub">Try "Diabetes", "Hypertension", or "Pneumonia"</div>
          </div>
        )}

        {selectedDiag && (
          <>
            {/* Overview */}
            <div className="mc-card mc-animate">
              <div className="mc-diag-name">{selectedDiag.name}</div>
              <div className="mc-diag-desc">{selectedDiag.description}</div>
            </div>

            {/* Type Selector */}
            {selectedDiag.types?.length > 0 && (
              <div className="mc-card mc-animate">
                <div className="mc-section-title">🗂️ Select Type</div>
                <div className="mc-type-grid">
                  {selectedDiag.types.map((t) => (
                    <button
                      key={t.id}
                      className={`mc-type-btn${selectedType?.id === t.id ? " active" : ""}`}
                      onClick={() => selectType(t)}
                    >
                      {t.type_name}
                    </button>
                  ))}
                </div>
                {selectedType && (
                  <div className="mc-cause-box">
                    <div className="mc-cause-label">Cause / Pathophysiology</div>
                    {selectedType.cause}
                  </div>
                )}
              </div>
            )}

            {/* Type-specific content */}
            {selectedType && typeDetails && (
              <>
                {/* Stats */}
                <div className="mc-stats mc-animate">
                  <div className="mc-stat">
                    <div className="mc-stat-val">{typeDetails.lab_tests.length}</div>
                    <div className="mc-stat-label">Lab Tests</div>
                  </div>
                  <div className="mc-stat">
                    <div className="mc-stat-val">{typeDetails.medications.length}</div>
                    <div className="mc-stat-label">Medications</div>
                  </div>
                  <div className="mc-stat">
                    <div className="mc-stat-val">{typeDetails.nursing_considerations.length}</div>
                    <div className="mc-stat-label">Nursing Points</div>
                  </div>
                  <div className="mc-stat">
                    <div className="mc-stat-val">
                      {[...new Set(typeDetails.medications.map((m) => m.treatment_role))].length}
                    </div>
                    <div className="mc-stat-label">Treatment Roles</div>
                  </div>
                </div>

                {typeDetails.lab_tests.length > 0 && <LabPanel labs={typeDetails.lab_tests} />}
                {typeDetails.medications.length > 0 && <MedicationSection medications={typeDetails.medications} />}
                {typeDetails.nursing_considerations.length > 0 && <NursingPanel items={typeDetails.nursing_considerations} />}
              </>
            )}

            {!selectedType && selectedDiag.types?.length > 0 && (
              <div className="mc-empty" style={{ padding: "2rem" }}>
                <div className="mc-empty-icon" style={{ fontSize: "2rem", opacity: 0.4 }}>☝️</div>
                <div className="mc-empty-title">Select a type above</div>
                <div className="mc-empty-sub">Lab tests, medications and nursing considerations will appear here.</div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mc-footer">
        MediCore PWA · Built with React + Firebase · Educational use only<br />
        <span style={{ color: "#1e293b" }}>
          Firebase Integration: Replace FIREBASE_CONFIG at top of file with your project credentials
        </span>
      </footer>
    </div>
  );
}

/*
=================================================================
FIREBASE INTEGRATION GUIDE
=================================================================

1. Install Firebase:
   npm install firebase

2. Replace FIREBASE_CONFIG at top with your project credentials
   from Firebase Console → Project Settings

3. Initialize Firebase and Firestore:

   import { initializeApp } from 'firebase/app';
   import { getFirestore, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

   const app = initializeApp(FIREBASE_CONFIG);
   const db = getFirestore(app);

4. Firestore Collections (mirror the database schema in the doc):
   - diagnoses/{id}           → { name, description }
   - diagnosis_types/{id}     → { diagnosis_id, type_name, cause }
   - lab_tests/{id}           → { diagnosis_type_id, test_name, normal_min, normal_max, unit, critical_high, critical_low }
   - medications/{id}         → { diagnosis_type_id, drug_name, drug_class, treatment_role, contraindications, monitoring_required, guideline_source }
   - medication_dosages/{id}  → { medication_id, dose, form, frequency, route, renal_adjustment, pediatric_adjustment }
   - side_effects/{id}        → { medication_id, effect }
   - nursing_considerations/{id} → { diagnosis_type_id, consideration }

5. Replace MOCK_DATA fetches with Firestore queries:

   async function fetchDiagnoses() {
     const snap = await getDocs(collection(db, 'diagnoses'));
     return snap.docs.map(d => ({ id: d.id, ...d.data() }));
   }

   async function fetchTypeDetails(typeId) {
     const [labsSnap, medsSnap, nursingSnap] = await Promise.all([
       getDocs(query(collection(db, 'lab_tests'), where('diagnosis_type_id', '==', typeId))),
       getDocs(query(collection(db, 'medications'), where('diagnosis_type_id', '==', typeId))),
       getDocs(query(collection(db, 'nursing_considerations'), where('diagnosis_type_id', '==', typeId))),
     ]);
     // ... assemble and return
   }

6. Enable Offline Persistence (PWA):
   import { enableIndexedDbPersistence } from 'firebase/firestore';
   enableIndexedDbPersistence(db).catch(console.error);

7. PWA Setup (manifest.json + service worker):
   Use Vite PWA plugin: npm install vite-plugin-pwa
   Add to vite.config.js:
   import { VitePWA } from 'vite-plugin-pwa'
   plugins: [react(), VitePWA({ registerType: 'autoUpdate', manifest: {
     name: 'MediCore', short_name: 'MediCore',
     theme_color: '#0a0f1e', background_color: '#0a0f1e',
     icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
   }})]
=================================================================
*/

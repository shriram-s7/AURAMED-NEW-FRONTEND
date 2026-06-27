import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, ChevronRight } from 'lucide-react';
import { getPatients } from '../utils/storage';
import styles from './PatientWorkspace.module.css';

const PatientWorkspace = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  
  useEffect(() => {
    const list = getPatients();
    setPatients(list);
    setFilteredPatients(list);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredPatients(patients);
      } else {
        const lower = searchTerm.toLowerCase();
        const filtered = patients.filter(p => 
          p.name.toLowerCase().includes(lower) || 
          p.id.toLowerCase().includes(lower) ||
          (p.phone && p.phone.toLowerCase().includes(lower))
        );
        setFilteredPatients(filtered);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, patients]);

  const handlePatientClick = (id) => {
    navigate(`/patient/${id}`);
  };

  return (
    <div className={styles.workspaceContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Patient Workspace</h1>
        <p className={styles.subtitle}>Search or create a patient to begin diagnostic analysis</p>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={24} />
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="Search by Patient ID, Name, or Phone" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            className={styles.addBtn}
            onClick={() => navigate('/patient/new')}
          >
            <UserPlus size={20} />
            <span>New Patient</span>
          </button>
        </div>

        <section className={styles.recentSection}>
          <h2 className={styles.sectionTitle}>Recent Patients</h2>
          <div className={styles.patientGrid}>
            {filteredPatients.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>
                No patients found.
              </p>
            ) : (
              filteredPatients.map((patient) => (
                <div 
                  key={patient.id} 
                  className={styles.patientCard}
                  onClick={() => handlePatientClick(patient.id)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.patientInfo}>
                      <h3 className={styles.patientName}>{patient.name}</h3>
                      <span className={styles.patientMeta}>ID: {patient.id} • {patient.age} yrs</span>
                    </div>
                    <ChevronRight size={20} className={styles.chevron} />
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <div className={styles.visitDate}>
                      Last visit: {patient.lastVisit}
                    </div>
                    {patient.status && patient.status !== 'Stable' && (
                      <div className={`${styles.statusBadge} ${patient.status === 'Stable' ? styles.green : styles.yellow}`}>
                        {patient.status}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PatientWorkspace;

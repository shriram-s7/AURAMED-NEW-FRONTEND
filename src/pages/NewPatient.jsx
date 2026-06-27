import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, UserPlus } from 'lucide-react';
import { savePatient } from '../utils/storage';
import styles from './NewPatient.module.css';

const NewPatient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', age: '', bloodType: '', phone: '', email: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const newId = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digit ID
    const newPatient = {
      id: newId,
      name: formData.name,
      age: parseInt(formData.age, 10),
      bloodType: formData.bloodType,
      phone: formData.phone,
      email: formData.email,
      lastVisit: new Date().toISOString().split('T')[0],
      status: 'Stable',
      history: []
    };
    
    savePatient(newPatient);
    navigate(`/patient/${newId}`);
  };

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate('/workspace')}>
        <ChevronLeft size={20} />
        Back to Workspace
      </button>

      <header className={styles.header}>
        <div className={styles.titleRow}>
          <UserPlus size={32} className={styles.titleIcon} />
          <h1 className={styles.title}>Register New Patient</h1>
        </div>
        <p className={styles.subtitle}>Enter patient details to create a new clinical profile.</p>
      </header>

      <form className={styles.formContainer} onSubmit={handleCreate}>
        <div className={styles.formGroup}>
          <label>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Jane Doe" required />
        </div>
        
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Age</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Years" required />
          </div>
          <div className={styles.formGroup}>
            <label>Blood Type</label>
            <select name="bloodType" value={formData.bloodType} onChange={handleChange} required>
              <option value="">Select...</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
          </div>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="patient@example.com" />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate('/workspace')}>
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn}>
            Create Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPatient;

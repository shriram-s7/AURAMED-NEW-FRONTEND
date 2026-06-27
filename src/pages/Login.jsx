import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Placeholder login action
    navigate('/dashboard');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logoBox}>
            <Shield size={32} color="white" />
          </div>
          <h1>AuraMed <span>AI</span></h1>
          <p>Clinical Intelligence Platform</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Work Email</label>
            <input type="email" id="email" placeholder="doctor@hospital.org" required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="••••••••" required />
          </div>
          <button type="submit" className={styles.loginBtn}>
            Secure Login
          </button>
        </form>
        
        <div className={styles.footer}>
          <p>For authorized clinical personnel only.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

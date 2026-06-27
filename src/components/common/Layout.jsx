import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

const Layout = () => {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.topbar}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Dr. Sarah Jenkins</span>
            <span className={styles.userRole}>Oncologist</span>
          </div>
        </div>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

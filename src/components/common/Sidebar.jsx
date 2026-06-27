import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, User, Dna, FileScan, LogOut } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const location = useLocation();
  
  const baseNavItems = [
    { name: 'Workspace', path: '/workspace', icon: LayoutDashboard },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoBox}>
          <span className={styles.logoText}>A</span>
        </div>
        <h1 className={styles.brandName}>AuraMed <span>AI</span></h1>
      </div>

      <nav className={styles.navContainer}>
        <div className={styles.navSection}>
          <p className={styles.sectionTitle}>MAIN</p>
          <ul className={styles.navList}>
            {baseNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                    }
                  >
                    <Icon size={20} className={styles.icon} />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

      </nav>

      <div className={styles.footer}>
        <NavLink to="/login" className={styles.navLink}>
          <LogOut size={20} className={styles.icon} />
          <span>Sign Out</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import clinicaLogo from '../assets/clinica-laguna-logo.png';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleMenu = (menuKey) => {
    // Prevent menu toggle when sidebar is collapsed
    if (sidebarCollapsed) return;
    
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // Close all expanded menus when sidebar collapses
  useEffect(() => {
    if (sidebarCollapsed) {
      setExpandedMenus({});
    }
  }, [sidebarCollapsed]);

  const getNavigationItems = (role) => {
    switch(role) {
      case 'Admin':
        return [
          { to: '/', label: 'Dashboard', icon: 'bi-speedometer2' },
          {
            key: 'users',
            label: 'User Management',
            icon: 'bi-people-fill',
            children: [
              { to: '/users/patients', label: 'Patient Accounts' },
              { to: '/users/doctors', label: 'Doctor Accounts' },
              { to: '/users/staff', label: 'Staff Accounts' },
              { to: '/users/roles', label: 'Role Management' },
              { to: '/users/permissions', label: 'Permissions' }
            ]
          },
          { to: '/doctor-schedules', label: 'Doctor Appointments', icon: 'bi-calendar-check' },
          { to: '/inventory', label: 'Inventory', icon: 'bi-box-seam' },
          {
            key: 'analytics',
            label: 'Reports & Analytics',
            icon: 'bi-graph-up',
            children: [
              { to: '/analytics/summary', label: 'Overview' },
              { to: '/analytics/patients', label: 'Patient Demographics' },
              { to: '/analytics/visits', label: 'Visit Trends' },
              { to: '/analytics/doctors', label: 'Doctor Performance' },
              { to: '/analytics/revenue', label: 'Revenue Analysis' }
            ]
          },
          { 
            key: 'settings',
            to: '/settings', 
            label: 'Settings', 
            icon: 'bi-gear',
            children: [
              { to: '/settings/general', label: 'General Settings' },
              { to: '/settings/audit-logs', label: 'Audit Logs' },
              { to: '/settings/security', label: 'Security Settings' }
            ]
          },
          { to: '/stockreports', label: 'General Inventory Reports', icon: 'bi-graph-up' },
        ];
      case 'Patient':
        return [
          { to: '/', label: 'Dashboard', icon: 'bi-speedometer2' },
          { to: '/appointments', label: 'My Appointments', icon: 'bi-calendar-check' },
          { to: '/medical-records', label: 'Medical Records', icon: 'bi-file-earmark-medical' },
          { to: '/prescriptions', label: 'Prescriptions', icon: 'bi-prescription' },
          { to: '/billing-history', label: 'Billing History', icon: 'bi-receipt' },
          { to: '/profile', label: 'My Profile', icon: 'bi-person-circle' }
        ];

      case 'Doctor':
        return [
          { to: '/', label: 'Dashboard', icon: 'bi-speedometer2' },
          { to: '/patients', label: 'Patient Records', icon: 'bi-person-vcard' },
          { to: '/medical-records/all', label: 'Medical Records', icon: 'bi-file-earmark-medical' },
          { to: '/prescriptions/all', label: 'Prescriptions', icon: 'bi-prescription' },
          { to: '/diagnostic-results', label: 'Diagnostic Results', icon: 'bi-file-earmark-text' },
          { to: '/doctors/schedule', label: 'My Schedule', icon: 'bi-calendar-week' },
          { to: '/profile', label: 'My Profile', icon: 'bi-person-circle' }
        ];

      case 'Receptionist':
        return [
          { to: '/', label: 'Dashboard', icon: 'bi-speedometer2' },
          { to: '/patients', label: 'Patients', icon: 'bi-person-vcard' },
          { to: '/billing', label: 'Billing', icon: 'bi-receipt' },
          { to: '/doctor-schedules', label: 'Doctor Schedules', icon: 'bi-calendar-week' },
          { to: '/profile', label: 'My Profile', icon: 'bi-person-circle' }
        ];

      case 'InventoryManager':
        return [
          { to: '/', label: 'Dashboard', icon: 'bi-speedometer2' },
          { to: '/inventory', label: 'Inventory', icon: 'bi-box-seam' },
          { to: '/orders', label: 'Orders', icon: 'bi-cart' },
          { to: '/suppliers', label: 'Suppliers', icon: 'bi-truck' },
          { to: '/stockreports', label: 'General Inventory Reports', icon: 'bi-graph-up' },
          { to: '/profile', label: 'My Profile', icon: 'bi-person-circle' }
        ];

      default:
        return [];
    }
  };

  const isPathActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isSubmenuActive = (item) => {
    if (!item.children) return false;
    return item.children.some(child => 
      location.pathname.startsWith(child.to)
    );
  };

  useEffect(() => {
    // Only auto-expand menus if sidebar is not collapsed
    if (!sidebarCollapsed) {
      const currentPath = location.pathname;
      getNavigationItems(currentUser?.role).forEach(item => {
        if (item.children && item.children.some(child => currentPath.startsWith(child.to))) {
          setExpandedMenus(prev => ({ ...prev, [item.key]: true }));
        }
      });
    }
  }, [location.pathname, currentUser?.role, sidebarCollapsed]);

  const NavLink = ({ to, label, icon, isActive, isCollapsed }) => {
    const handleClick = (e) => {
      // If collapsed and has children, expand sidebar instead of navigating
      if (isCollapsed) {
        e.preventDefault();
        setSidebarCollapsed(false);
        return;
      }
    };

    return (
      <Link 
        to={to} 
        className={`nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}
        onClick={handleClick}
        style={{
          color: 'white',
          backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
          borderRadius: '8px',
          margin: '4px 0',
          padding: isCollapsed ? '12px 8px' : '10px 16px',
          transition: 'all 0.2s ease-in-out',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          position: 'relative'
        }}
        title={isCollapsed ? label : ''}
      >
        <i className={`bi ${icon} ${isCollapsed ? '' : 'me-3'}`} style={{ fontSize: '1.1rem' }}></i>
        <span className={isCollapsed ? 'd-none' : 'd-block'}>{label}</span>
        {isCollapsed && (
          <div 
            className="tooltip-popup"
            style={{
              position: 'absolute',
              left: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              marginLeft: '10px',
              opacity: 0,
              visibility: 'hidden',
              transition: 'all 0.2s ease',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          >
            {label}
            <div 
              style={{
                position: 'absolute',
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderRight: '5px solid rgba(0, 0, 0, 0.8)'
              }}
            />
          </div>
        )}
      </Link>
    );
  };

  const SubMenu = ({ item }) => {
    const isActive = isPathActive(item.to) || isSubmenuActive(item);
    const isExpanded = expandedMenus[item.key];
    
    const handleSubmenuClick = (e) => {
      if (sidebarCollapsed) {
        e.preventDefault();
        setSidebarCollapsed(false);
        return;
      }
      toggleMenu(item.key);
    };
    
    return (
      <div className="nav-item">
        <div 
          className={`nav-link d-flex align-items-center justify-content-between ${isActive ? 'active' : ''}`}
          onClick={handleSubmenuClick}
          style={{
            color: 'white',
            backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
            borderRadius: '8px',
            margin: '4px 0',
            padding: '10px 16px',
            cursor: 'pointer',
            position: 'relative'
          }}
          title={sidebarCollapsed ? item.label : ''}
        >
          <div className="d-flex align-items-center">
            <i className={`bi ${item.icon} ${sidebarCollapsed ? '' : 'me-3'}`} style={{ fontSize: '1.1rem' }}></i>
            {!sidebarCollapsed && <span>{item.label}</span>}
          </div>
          {!sidebarCollapsed && (
            <i className={`bi bi-chevron-${isExpanded ? 'down' : 'right'} ms-2`}></i>
          )}
          
          {sidebarCollapsed && (
            <div 
              className="tooltip-popup"
              style={{
                position: 'absolute',
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                marginLeft: '10px',
                opacity: 0,
                visibility: 'hidden',
                transition: 'all 0.2s ease',
                zIndex: 1000,
                pointerEvents: 'none'
              }}
            >
              {item.label}
              <div 
                style={{
                  position: 'absolute',
                  right: '100%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 0,
                  height: 0,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderRight: '5px solid rgba(0, 0, 0, 0.8)'
                }}
              />
            </div>
          )}
        </div>
        
        {!sidebarCollapsed && isExpanded && (
          <div className="submenu ps-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {item.children.map((child, idx) => (
              <Link
                key={idx}
                to={child.to}
                className={`nav-link ${location.pathname === child.to ? 'active' : ''}`}
                style={{
                  color: 'white',
                  backgroundColor: location.pathname === child.to ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className="bi bi-dot me-2"></i>
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="d-flex">
      {/* Overlay for mobile */}
      {!sidebarCollapsed && isMobile && (
        <div 
          className="overlay" 
          onClick={() => setSidebarCollapsed(true)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}
      
      {/* Sidebar */}
      <nav 
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
        style={{
          backgroundColor: '#E31937',
          minHeight: '100vh',
          width: sidebarCollapsed ? '72px' : '260px',
          position: 'fixed',
          left: isMobile && sidebarCollapsed ? '-72px' : '0',
          top: 0,
          bottom: 0,
          zIndex: 1000,
          transition: 'all 0.3s ease-in-out',
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          overflowX: 'hidden',
          overflowY: 'auto'
        }}
      >
        <div className="sidebar-content p-3">
          {/* Logo & Brand */}
          <div className="d-flex align-items-center mb-4 mt-2 justify-content-between">
            <div className="d-flex align-items-center">
              <img 
                src={clinicaLogo} 
                alt="Clinica Laguna" 
                className="img-fluid" 
                style={{ 
                  height: '38px',
                  filter: 'brightness(0) invert(1)',
                  transition: 'all 0.3s ease'
                }} 
              />
            </div>
            {!isMobile && (
              <button 
                className="btn text-white collapse-btn d-flex align-items-center justify-content-center"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                style={{ 
                  width: '28px',
                  height: '28px',
                  padding: 0,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '50%',
                  fontSize: '0.8rem'
                }}
              >
                <i className={`bi bi-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
              </button>
            )}
          </div>

          {/* User Profile */}
          <div 
            className="user-profile mb-4 p-3 rounded" 
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.15)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div className={`d-flex ${sidebarCollapsed ? 'justify-content-center' : 'align-items-center'}`}>
              <div 
                className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                style={{ 
                  width: '42px', 
                  height: '42px',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}
              >
                <span className="fw-bold" style={{ color: '#E31937', fontSize: '1.1rem' }}>
                  {currentUser?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="ms-3 text-white overflow-hidden">
                  <div className="fw-medium text-truncate" style={{ maxWidth: '160px', fontSize: '1rem' }}>
                    {currentUser?.fullName || 'User'}
                  </div>
                  <div className="text-light small opacity-75">{currentUser?.role || 'User'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="navigation-menu">
            <ul className="nav flex-column p-0">
              {getNavigationItems(currentUser?.role).map((item, index) => (
                <li key={index} className="nav-item position-relative">
                  {isPathActive(item.to) && !item.children && (
                    <div 
                      className="active-indicator" 
                      style={{
                        position: 'absolute',
                        left: '0',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '4px',
                        height: '70%',
                        backgroundColor: 'white',
                        borderRadius: '0 4px 4px 0'
                      }}
                    />
                  )}
                  {item.children ? (
                    <SubMenu item={item} />
                  ) : (
                    <NavLink 
                      to={item.to} 
                      label={item.label} 
                      icon={item.icon}
                      isActive={isPathActive(item.to)}
                      isCollapsed={sidebarCollapsed}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile close button */}
          {isMobile && !sidebarCollapsed && (
            <button 
              className="btn btn-sm btn-light position-absolute d-flex align-items-center justify-content-center"
              onClick={() => setSidebarCollapsed(true)}
              style={{ 
                top: '10px', 
                right: '10px',
                width: '28px',
                height: '28px',
                padding: 0,
                borderRadius: '50%'
              }}
            >
              <i className="bi bi-x"></i>
            </button>
          )}
          
          {/* Logout Button */}
          <div className="mt-auto pt-4">
            <button 
              onClick={handleLogout} 
              className={`btn text-white w-100 d-flex ${sidebarCollapsed ? 'justify-content-center' : 'align-items-center'}`}
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: sidebarCollapsed ? '10px 0' : '10px 16px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <i className={`bi bi-box-arrow-right ${sidebarCollapsed ? '' : 'me-2'}`}></i>
              <span className={sidebarCollapsed ? 'd-none' : 'd-block'}>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main 
        style={{
          marginLeft: sidebarCollapsed ? (isMobile ? '0' : '72px') : (isMobile ? '0' : '260px'),
          transition: 'margin-left 0.3s ease-in-out',
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#f8f9fa'
        }}
      >
        {/* Top navbar for mobile */}
        {isMobile && (
          <div 
            className="mobile-header d-flex align-items-center px-3 py-2"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            <button 
              className="btn btn-sm d-flex align-items-center justify-content-center me-3"
              onClick={() => setSidebarCollapsed(false)}
              style={{ 
                width: '34px', 
                height: '34px',
                backgroundColor: '#f1f1f1',
                borderRadius: '8px'
              }}
            >
              <i className="bi bi-list" style={{ fontSize: '1.2rem' }}></i>
            </button>
            <img 
              src={clinicaLogo} 
              alt="Clinica Laguna" 
              className="img-fluid" 
              style={{ height: '24px' }} 
            />
          </div>
        )}
        
        {/* Page content */}
        <div className="content-wrapper p-4">
          <Outlet />
        </div>
      </main>

      <style>
        {`
          .nav-link.active {
            font-weight: 500;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          
          .nav-link:hover {
            background-color: rgba(255,255,255,0.1) !important;
            transform: translateX(3px);
          }
          
          .nav-link:hover .tooltip-popup {
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          .sidebar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.3) transparent;
          }
          
          .sidebar::-webkit-scrollbar {
            width: 5px;
          }
          
          .sidebar::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .sidebar::-webkit-scrollbar-thumb {
            background-color: rgba(255,255,255,0.3);
            border-radius: 20px;
          }
          
          .submenu {
            animation: fadeIn 0.3s ease-in-out;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .nav-link {
            position: relative;
            overflow: visible !important;
          }
          
          .nav-link:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background: white;
            transition: all 0.3s ease;
            opacity: 0;
          }
          
          .nav-link:hover:after {
            width: 80%;
            left: 10%;
            opacity: 0.5;
          }
          
          .nav-link.active:after {
            width: 80%;
            left: 10%;
            opacity: 1;
          }
          
          .sidebar.collapsed .nav-link {
            justify-content: center;
          }
          
          .sidebar.collapsed .submenu {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default Layout;
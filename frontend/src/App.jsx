import React, { useState, useEffect, createContext, useContext, Fragment, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { 
  Home, FileText, Users, BarChart3, 
  MapPin, Phone, Camera, Send, CheckCircle, Clock, AlertCircle,
  Menu, X, LogOut, 
  Droplet, Zap, Construction, Trash2, Wind, Lightbulb, Download,
  Languages, LayoutGrid, Check, ChevronLeft, ChevronRight, ZoomIn
} from 'lucide-react';
import './i18n';

// ==================== API HELPER ====================
const API_BASE = '/api';

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = { ...options.headers };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

// ==================== AUTH CONTEXT ====================
const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// ==================== CONSTANTS ====================
const categoryIcons = {
  water: Droplet,
  electricity: Zap,
  roads: Construction,
  sanitation: Trash2,
  drainage: Wind,
  streetlight: Lightbulb,
  other: AlertCircle,
};

// ==================== REUSABLE COMPONENTS ====================
const StatusBadge = ({ status }) => {
  const statusConfig = {
    submitted: { bg: '#FEF3C7', text: '#92400E', label: 'Submitted' },
    assigned: { bg: '#DBEAFE', text: '#1E3A8A', label: 'Assigned' },
    'in-progress': { bg: '#FED7AA', text: '#9A3412', label: 'In Progress' },
    resolved: { bg: '#D1FAE5', text: '#065F46', label: 'Resolved' },
    rejected: { bg: '#FEE2E2', text: '#991B1B', label: 'Rejected' },
    closed: { bg: '#D1FAE5', text: '#065F46', label: 'Closed' }, 
  };

  const config = statusConfig[status] || statusConfig.submitted;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '7px 20px',
      borderRadius: '50px',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: config.bg,
      color: config.text
    }}>
      {config.label}
    </span>
  );
};

const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, onClick, disabled, type = 'button', style = {}, ...props }) => {
  const variants = {
    primary: { backgroundColor: '#2B5A3D', color: 'white', border: 'none' },
    secondary: { backgroundColor: '#D97F3B', color: 'white', border: 'none' },
    outline: { backgroundColor: 'white', color: '#1C1917', border: '2px solid #E7E5E4' },
    ghost: { backgroundColor: 'transparent', color: '#1C1917', border: 'none' },
    danger: { backgroundColor: '#DC2626', color: 'white', border: 'none' },
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '14px' },
    md: { padding: '10px 16px', fontSize: '16px' },
    lg: { padding: '14px 24px', fontSize: '18px' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '10px',
        fontWeight: '500',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s',
        fontFamily: 'inherit',
        ...variants[variant],
        ...sizes[size],
        ...style
      }}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children}
    </button>
  );
};

const Input = ({ label, error, icon: Icon, style = {}, ...props }) => {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#57534E',
          marginBottom: '8px'
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#78716C',
            pointerEvents: 'none'
          }}>
            <Icon size={20} />
          </div>
        )}
        <input
          style={{
            width: '100%',
            padding: '12px 16px',
            paddingLeft: Icon ? '44px' : '16px',
            backgroundColor: 'white',
            border: `2px solid ${error ? '#DC2626' : '#E7E5E4'}`,
            borderRadius: '10px',
            fontSize: '16px',
            outline: 'none',
            transition: 'all 0.2s',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            ...style
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#2B5A3D';
            e.target.style.boxShadow = '0 0 0 3px rgba(43, 90, 61, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#DC2626' : '#E7E5E4';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
      </div>
      {error && <p style={{ marginTop: '4px', fontSize: '14px', color: '#DC2626' }}>{error}</p>}
    </div>
  );
};

const Card = ({ children, hover = false, style = {} }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #E7E5E4',
        padding: '24px',
        transition: 'box-shadow 0.2s',
        boxShadow: isHovered && hover ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
        ...style
      }}
    >
      {children}
    </div>
  );
};

// ==================== LOGIN PAGE ====================
const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('citizen');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      await api('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      const data = await api('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp, role }),
      });
      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2B5A3D 0%, #1F4029 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <Card style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#2B5A3D',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <FileText size={32} color="white" />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1C1917',
            margin: '0 0 1px 0'
          }}>
            {t('app.name')}
          </h1>
          <p style={{ color: '#57534E', margin: 0 }}>
            {t('app.tagline')}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Input
              label={t('login.mobileLabel')}
              type="tel"
              placeholder={t('login.mobilePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={Phone}
              maxLength="10"
              error={error}
            />

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#57534E',
                marginBottom: '12px'
              }}>
                {t('login.selectRole')}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {['citizen', 'technician', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: `2px solid ${role === r ? '#2B5A3D' : '#E7E5E4'}`,
                      backgroundColor: role === r ? 'rgba(43, 90, 61, 0.1)' : 'white',
                      color: role === r ? '#2B5A3D' : '#1C1917',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit'
                    }}
                  >
                    {t(`login.${r}`)}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? t('login.sending') : t('login.sendOtp')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#57534E', marginBottom: '16px' }}>
                {t('login.otpSent', { phone })}
              </p>
              <Input
                label={t('login.enterOtp')}
                type="text"
                placeholder={t('login.otpPlaceholder')}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                error={error}
              />
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#78716C' }}>
                {t('login.testOtp')} <strong>123456</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
                style={{ flex: 1 }}
              >
                {t('login.back')}
              </Button>
              <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ flex: 1 }}>
                {loading ? t('login.verifying') : t('login.verifyOtp')}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

// ==================== NAVBAR ====================
const Navbar = ({ activePage, setActivePage }) => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setLangMenuOpen(false);
  };

  const navigation = {
    citizen: [
      { id: 'home', label: t('nav.home'), icon: Home },
      { id: 'complaints', label: t('nav.myComplaints'), icon: FileText },
    ],
    technician: [
      { id: 'dashboard', label: t('nav.dashboard'), icon: Home },
      { id: 'assigned', label: t('nav.assigned'), icon: FileText },
    ],
    admin: [
      { id: 'dashboard', label: t('nav.dashboard'), icon: Home },
      { id: 'complaints', label: t('nav.complaints'), icon: FileText },
      { id: 'technicians', label: t('nav.technicians'), icon: Users },
      { id: 'reports', label: t('nav.reports'), icon: BarChart3 },
    ],
  };

  const navItems = navigation[user?.role] || navigation.citizen;

  return (
    <nav style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #E7E5E4',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#2B5A3D',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={24} color="white" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Gramin Seva</span>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontWeight: '500',
                    backgroundColor: activePage === item.id ? '#2B5A3D' : 'transparent',
                    color: activePage === item.id ? 'white' : '#57534E',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isMobile && (
              <>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      border: '2px solid #E7E5E4',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#57534E',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2B5A3D'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E7E5E4'}
                  >
                    <Languages size={18} />
                    {languages.find(l => l.code === i18n.language)?.name || 'English'}
                  </button>
                  {langMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      backgroundColor: 'white',
                      border: '1px solid #E7E5E4',
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 100,
                      minWidth: '150px'
                    }}>
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            textAlign: 'left',
                            backgroundColor: i18n.language === lang.code ? 'rgba(43, 90, 61, 0.1)' : 'transparent',
                            color: i18n.language === lang.code ? '#2B5A3D' : '#57534E',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: i18n.language === lang.code ? '600' : '400',
                            fontFamily: 'inherit',
                            transition: 'background-color 0.2s',
                            borderRadius: lang.code === languages[0].code ? '10px 10px 0 0' : 
                                        lang.code === languages[languages.length - 1].code ? '0 0 10px 10px' : '0'
                          }}
                          onMouseEnter={(e) => {
                            if (i18n.language !== lang.code) {
                              e.currentTarget.style.backgroundColor = '#F5F5F4';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (i18n.language !== lang.code) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>{user?.name}</p>
                  <p style={{ fontSize: '12px', color: '#78716C', textTransform: 'capitalize', margin: 0 }}>
                    {user?.role}
                  </p>
                </div>
                <Button variant="ghost" icon={LogOut} onClick={logout}>
                  {t('nav.logout')}
                </Button>
              </>
            )}
            
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  display: 'flex',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '10px'
                }}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <div style={{
            paddingTop: '16px',
            paddingBottom: '16px',
            borderTop: '1px solid #E7E5E4'
          }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  fontWeight: '500',
                  backgroundColor: activePage === item.id ? 'rgba(43, 90, 61, 0.1)' : 'transparent',
                  color: activePage === item.id ? '#2B5A3D' : '#57534E',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  fontFamily: 'inherit'
                }}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
            
            {/* Language Selector in Mobile */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #E7E5E4',
              marginTop: '8px'
            }}>
              <p style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#78716C',
                marginBottom: '8px',
                textTransform: 'uppercase'
              }}>
                Language / भाषा
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: i18n.language === lang.code ? '#2B5A3D' : 'transparent',
                      color: i18n.language === lang.code ? 'white' : '#57534E',
                      border: `2px solid ${i18n.language === lang.code ? '#2B5A3D' : '#E7E5E4'}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s'
                    }}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={logout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                color: '#DC2626',
                fontWeight: '500',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                marginTop: '8px',
                borderTop: '1px solid #E7E5E4'
              }}
            >
              <LogOut size={20} />
              {t('nav.logout')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

// ==================== CITIZEN PAGES ====================
const CitizenHome = ({ setActivePage }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward'); // for slide animation
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    phone: '',
    location: { address: '' },
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState('');
 
  const TOTAL_STEPS = 4;
 
  const categories = [
    { id: 'water', label: t('citizen.water'), icon: Droplet },
    { id: 'electricity', label: t('citizen.electricity'), icon: Zap },
    { id: 'roads', label: t('citizen.roads'), icon: Construction },
    { id: 'sanitation', label: t('citizen.sanitation'), icon: Trash2 },
    { id: 'drainage', label: t('citizen.drainage'), icon: Wind },
    { id: 'streetlight', label: t('citizen.streetlight'), icon: Lightbulb },
  ];
 
  const stepMeta = [
    { label: 'Category',  icon: LayoutGrid },
    { label: 'Details',   icon: FileText },
    { label: 'Location',  icon: MapPin },
    { label: 'Review',    icon: CheckCircle },
  ];
 
  const goNext = () => {
    setDirection('forward');
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const goBack = () => {
    setDirection('back');
    setStep((s) => Math.max(s - 1, 1));
  };
 
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files].slice(0, 5));
  };
 
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('category', formData.category);
      fd.append('description', formData.description);
      fd.append('citizenPhone', formData.phone);
      fd.append('location[address]', formData.location.address);
      fd.append('location[latitude]', '0');
      fd.append('location[longitude]', '0');
      images.forEach((img) => fd.append('images', img));
 
      const data = await api('/complaints', { method: 'POST', body: fd });
      setComplaintId(data.complaint.complaintId);
      setSuccess(true);
 
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        setFormData({ category: '', description: '', phone: '', location: { address: '' } });
        setImages([]);
        setComplaintId('');
      }, 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };
 
  // ─── Success Screen ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={styles.pageWrap}>
        <Card style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '48px 32px' }}>
          <div style={styles.successOrb}>
            <CheckCircle size={40} color="#065F46" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 10px' }}>
            {t('citizen.successTitle')}
          </h2>
          <p style={{ color: '#57534E', margin: '0 0 6px' }}>{t('citizen.successMessage')}</p>
          <p style={{ color: '#78716C', margin: '0 0 6px', fontSize: 13 }}>{t('citizen.complaintId')}</p>
          <p style={{ fontSize: 34, fontWeight: 800, color: '#2B5A3D', margin: '0 0 28px', letterSpacing: 2 }}>
            {complaintId}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" size="lg" icon={FileText} onClick={() => setActivePage('complaints')}>
              View My Complaints
            </Button>
            <Button variant="outline" size="lg" onClick={() => { setSuccess(false); setStep(1); }}>
              {t('citizen.submitAnother')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }
 
  // ─── Progress Bar ─────────────────────────────────────────────────────────────
  const ProgressHeader = () => (
    <div style={styles.progressHeader}>
      {/* Step dots */}
      <div style={styles.stepRow}>
        {stepMeta.map((s, idx) => {
          const num = idx + 1;
          const isActive = step === num;
          const isDone = step > num;
          const Icon = s.icon;
          return (
            <Fragment key={num}>
              {idx > 0 && (
                <div style={{
                  ...styles.connector,
                  backgroundColor: isDone ? '#2B5A3D' : '#E7E5E4',
                }}/>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  ...styles.stepDot,
                  backgroundColor: isDone ? '#2B5A3D' : isActive ? '#2B5A3D' : 'white',
                  border: `2px solid ${isActive || isDone ? '#2B5A3D' : '#D6D3D1'}`,
                  color: isActive || isDone ? 'white' : '#A8A29E',
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: isActive ? '0 0 0 4px rgba(43,90,61,0.15)' : 'none',
                }}>
                  {isDone ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#2B5A3D' : isDone ? '#57534E' : '#A8A29E',
                  whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>
 
      {/* Thin progress bar */}
      <div style={styles.progressTrack}>
        <div style={{
          ...styles.progressFill,
          width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%`,
        }} />
      </div>
    </div>
  );
 
  // ─── Step 1 — Category ────────────────────────────────────────────────────────
  const Step1 =  (
    <div style={styles.stepBody}>
      <div style={styles.stepHeading}>
        <h2 style={styles.stepTitle}>What's the issue?</h2>
        <p style={styles.stepSubtitle}>Pick the category that best describes your complaint.</p>
      </div>
      <div style={styles.categoryGrid}>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = formData.category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.id })}
              style={{
                ...styles.catBtn,
                border: `2px solid ${isSelected ? '#2B5A3D' : '#E7E5E4'}`,
                backgroundColor: isSelected ? 'rgba(43,90,61,0.07)' : 'white',
                boxShadow: isSelected ? '0 0 0 3px rgba(43,90,61,0.12)' : 'none',
              }}
            >
              <div style={{
                ...styles.catIconWrap,
                backgroundColor: isSelected ? 'rgba(43,90,61,0.12)' : '#F5F5F4',
              }}>
                <Icon size={26} color={isSelected ? '#2B5A3D' : '#78716C'} />
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: 500,
                color: isSelected ? '#2B5A3D' : '#292524',
                marginTop: 8,
              }}>
                {cat.label}
              </span>
              {isSelected && (
                <div style={styles.catCheck}>
                  <Check size={10} color="white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
 
  // ─── Step 2 — Details ─────────────────────────────────────────────────────────
  const Step2 = (
    <div style={styles.stepBody}>
      <div style={styles.stepHeading}>
        <h2 style={styles.stepTitle}>Tell us more</h2>
        <p style={styles.stepSubtitle}>Describe the problem and share your contact number.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={styles.label}>{t('citizen.description')}</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('citizen.descriptionPlaceholder')}
            required
            style={styles.textarea}
            onFocus={(e) => { e.target.style.borderColor = '#2B5A3D'; e.target.style.boxShadow = '0 0 0 3px rgba(43,90,61,0.1)'; }}
            onBlur={(e)  => { e.target.style.borderColor = '#E7E5E4'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <Input
          label={t('citizen.contactNumber')}
          type="tel"
          placeholder={t('citizen.contactPlaceholder')}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          icon={Phone}
          maxLength="10"
          required
        />
      </div>
    </div>
  );
 
  // ─── Step 3 — Location & Photos ───────────────────────────────────────────────
  const Step3 = (
    <div style={styles.stepBody}>
      <div style={styles.stepHeading}>
        <h2 style={styles.stepTitle}>Where & what does it look like?</h2>
        <p style={styles.stepSubtitle}>Add the location and optionally attach photos (up to 5).</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input
          label={t('citizen.location')}
          type="text"
          placeholder={t('citizen.locationPlaceholder')}
          value={formData.location.address}
          onChange={(e) => setFormData({ ...formData, location: { address: e.target.value } })}
          icon={MapPin}
          required
        />
 
        {/* Photo upload */}
        <div>
          <label style={styles.label}>{t('citizen.uploadPhotos')} <span style={{ color: '#A8A29E', fontWeight: 400 }}>(optional)</span></label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} id="image-upload" />
          <label
            htmlFor="image-upload"
            style={styles.uploadZone}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2B5A3D'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D6D3D1'}
          >
            <Camera size={32} color="#A8A29E" style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 2px', color: '#57534E' }}>{t('citizen.clickUpload')}</p>
            <p style={{ fontSize: 11, color: '#A8A29E', margin: 0 }}>{t('citizen.uptoImages')}</p>
          </label>
          {images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
              {images.map((img, idx) => (
                <div key={idx} style={styles.thumbWrap}>
                  <img src={URL.createObjectURL(img)} alt={`Upload ${idx + 1}`} style={styles.thumb} />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    style={styles.thumbRemove}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
 
// ─── Step 4 — Review ──────────────────────────────────────────────────────────
  const cat = categories.find((c) => c.id === formData.category);
  const CatIcon = cat?.icon;

  const Step4 = (
    <div style={styles.stepBody}>
      <div style={styles.stepHeading}>
        <h2 style={styles.stepTitle}>Review your complaint</h2>
        <p style={styles.stepSubtitle}>Everything look good? Submit when you're ready.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          {
            heading: 'Category',
            content: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {CatIcon && <CatIcon size={16} color="#2B5A3D" />}
                <span style={{ fontWeight: 500, color: '#292524' }}>{cat?.label}</span>
              </div>
            ),
            editStep: 1,
          },
          {
            heading: 'Description',
            content: <span style={{ color: '#57534E', lineHeight: 1.6 }}>{formData.description}</span>,
            editStep: 2,
          },
          {
            heading: 'Contact',
            content: <span style={{ color: '#57534E' }}>{formData.phone}</span>,
            editStep: 2,
          },
          {
            heading: 'Location',
            content: <span style={{ color: '#57534E' }}>{formData.location.address}</span>,
            editStep: 3,
          },
          images.length > 0 && {
            heading: `Photos (${images.length})`,
            content: (
              <div style={{ display: 'flex', gap: 8 }}>
                {images.map((img, idx) => (
                  <img key={idx} src={URL.createObjectURL(img)} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />
                ))}
              </div>
            ),
            editStep: 3,
          },
        ].filter(Boolean).map((row) => (
          <div key={row.heading} style={styles.reviewRow}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={styles.reviewLabel}>{row.heading}</span>
              <button
                type="button"
                onClick={() => { setDirection('back'); setStep(row.editStep); }}
                style={styles.editBtn}
              >
                Edit
              </button>
            </div>
            <div style={{ marginTop: 4 }}>{row.content}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Step validation ──────────────────────────────────────────────────────────
  const canProceed = () => {
    if (step === 1) return !!formData.category;
    if (step === 2) return formData.description.trim().length > 0 && formData.phone.trim().length > 0;
    if (step === 3) return formData.location.address.trim().length > 0;
    return true;
  };

  const stepComponents = [Step1, Step2, Step3, Step4];

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={styles.pageWrap}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>
            {t('citizen.registerComplaint')}
          </h1>
          <p style={{ color: '#78716C', margin: 0, fontSize: 14 }}>
            Step {step} of {TOTAL_STEPS} — {stepMeta[step - 1].label}
          </p>
        </div>

        {/* Progress */}
        <ProgressHeader />

        {/* Step card */}
        <Card style={{ marginTop: 24, padding: '28px 24px', minHeight: 340 }}>
          {stepComponents[step - 1]}
        </Card>

        {/* Navigation */}
        <div style={styles.navRow}>
          {step > 1 ? (
            <Button variant="outline" size="md" icon={ChevronLeft} onClick={goBack}>
              Back
            </Button>
          ) : <div />}

          {step < TOTAL_STEPS ? (
            <Button
              variant="primary"
              size="md"
              disabled={!canProceed()}
              onClick={goNext}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Continue <ChevronRight size={16} />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              icon={Send}
              disabled={submitting || !canProceed()}
              onClick={handleSubmit}
            >
              {submitting ? t('citizen.submitting') : t('citizen.submitComplaint')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
 

// ─── Inline style map ──────────────────────────────────────────────────────────
const styles = {
  pageWrap: {
    padding: '32px 16px',
  },
  progressHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  stepRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  connector: {
    flex: 1,
    height: 2,
    marginTop: 14,
    borderRadius: 1,
    transition: 'background-color 0.3s',
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.25s ease',
    cursor: 'default',
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: '#F5F5F4',
    borderRadius: 99,
    overflow: 'hidden',
    display: 'none', // hidden — step dots already convey progress
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2B5A3D',
    borderRadius: 99,
    transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
  },
  stepBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  stepHeading: {
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 700,
    margin: '0 0 4px',
    color: '#1C1917',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#78716C',
    margin: 0,
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 12,
  },
  catBtn: {
    padding: '16px 12px',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    fontFamily: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    outline: 'none',
  },
  catIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.18s',
  },
  catCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: '#2B5A3D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#57534E',
    marginBottom: 7,
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    border: '2px solid #E7E5E4',
    borderRadius: 10,
    fontSize: 15,
    resize: 'vertical',
    minHeight: 120,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
    color: '#1C1917',
    lineHeight: 1.6,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  uploadZone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '28px 20px',
    border: '2px dashed #D6D3D1',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  thumbWrap: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #E7E5E4',
  },
  thumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
  },
  reviewRow: {
    padding: '14px 16px',
    backgroundColor: '#FAFAF9',
    borderRadius: 10,
    border: '1px solid #E7E5E4',
  },
  reviewLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#A8A29E',
  },
  editBtn: {
    fontSize: 12,
    color: '#2B5A3D',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    padding: 0,
    fontFamily: 'inherit',
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
};
 

const CitizenComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Verification modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyComplaint, setVerifyComplaint] = useState(null);
  const [verifyConfirmed, setVerifyConfirmed] = useState(null); // true | false | null
  const [verifyNote, setVerifyNote] = useState('');
  const [verifyImages, setVerifyImages] = useState([]);
  const [verifySubmitting, setVerifySubmitting] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoadingComplaints(true);
    try {
      const data = await api('/complaints');
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints, refreshKey]);

  const openVerifyModal = (complaint) => {
    setVerifyComplaint(complaint);
    setVerifyConfirmed(null);
    setVerifyNote('');
    setVerifyImages([]);
    setVerifyModalOpen(true);
  };

  const handleVerifySubmit = async () => {
    if (verifyConfirmed === null) return;
    setVerifySubmitting(true);
    try {
      const fd = new FormData();
      fd.append('confirmed', verifyConfirmed);
      fd.append('note', verifyNote);
      verifyImages.forEach(img => fd.append('images', img));
      await api(`/complaints/${verifyComplaint._id}/citizen-verify`, {
        method: 'POST',
        body: fd,
      });
      setVerifyModalOpen(false);
      setVerifyComplaint(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setVerifySubmitting(false);
    }
  };

  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{t('citizen.myComplaints')}</h1>
          <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)} disabled={loadingComplaints}>
            Refresh
          </Button>
        </div>

        {loadingComplaints ? (
          <p style={{ color: '#78716C' }}>{t('citizen.loadingComplaints')}</p>
        ) : complaints.length === 0 ? (
          <p style={{ color: '#78716C' }}>{t('citizen.noComplaints')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {complaints.map((complaint) => {
              const Icon = categoryIcons[complaint.category] || AlertCircle;
              const needsVerification = complaint.status === 'pending_verification'
                && !complaint.citizenVerification?.respondedAt;

              return (
                <Card key={complaint.complaintId} hover>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(43,90,61,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={24} color="#2B5A3D" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0' }}>{complaint.complaintId}</h3>
                          <p style={{ fontSize: '14px', color: '#78716C', textTransform: 'capitalize', margin: 0 }}>
                            {complaint.category} • {complaint.location.address}
                          </p>
                        </div>
                        <StatusBadge status={complaint.status} />
                      </div>
                      <p style={{ color: '#57534E', margin: '0 0 12px 0' }}>{complaint.description}</p>

                      {/* ── Verification banner ── */}
                      {needsVerification && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#FFF7ED', borderRadius: '10px', border: '1px solid #FED7AA', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <AlertCircle size={18} color="#D97706" />
                            </div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 600, color: '#92400E', margin: '0 0 2px' }}>Action required</p>
                              <p style={{ fontSize: '13px', color: '#B45309', margin: 0 }}>The technician has marked this as resolved. Was your issue fixed?</p>
                            </div>
                          </div>
                          <Button variant="primary" size="sm" onClick={() => openVerifyModal(complaint)}>
                            Respond
                          </Button>
                        </div>
                      )}

                      {/* Already responded */}
                      {complaint.status === 'pending_verification' && complaint.citizenVerification?.respondedAt && (
                        <div style={{ padding: '10px 14px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '12px' }}>
                          <p style={{ fontSize: '13px', color: '#15803D', fontWeight: 500, margin: 0 }}>
                            ✓ Your response submitted — awaiting admin review
                          </p>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#78716C' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={16} />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Citizen Verification Modal ── */}
      {verifyModalOpen && verifyComplaint && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '480px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Was your issue resolved?</h2>
            <p style={{ fontSize: '14px', color: '#78716C', margin: 'a0 0 24px 0' }}>{verifyComplaint.complaintId}</p>

            {/* Yes / No selection */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              {[
                { value: true,  label: "Yes, it's fixed",   bg: '#F0FDF4', border: '#16A34A', color: '#15803D' },
                { value: false, label: "No, still an issue", bg: '#FEF2F2', border: '#DC2626', color: '#B91C1C' },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setVerifyConfirmed(opt.value)}
                  style={{
                    flex: 1,
                    padding: '16px 12px',
                    borderRadius: '10px',
                    border: `2px solid ${verifyConfirmed === opt.value ? opt.border : '#E7E5E4'}`,
                    backgroundColor: verifyConfirmed === opt.value ? opt.bg : 'white',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: verifyConfirmed === opt.value ? opt.color : '#57534E',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.value ? '✓' : '✗'} {opt.label}
                </button>
              ))}
            </div>

            {/* Optional note */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>
                Additional note <span style={{ color: '#A8A29E', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                placeholder={verifyConfirmed === false ? 'Describe what is still not working...' : 'Any additional feedback...'}
                style={{ width: '100%', padding: '10px 12px', border: '2px solid #E7E5E4', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#2B5A3D'}
                onBlur={(e) => e.target.style.borderColor = '#E7E5E4'}
              />
            </div>

            {/* Optional photo upload */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>
                Photo proof <span style={{ color: '#A8A29E', fontWeight: 400 }}>(optional, up to 3)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                id="verify-upload"
                style={{ display: 'none' }}
                onChange={(e) => setVerifyImages(Array.from(e.target.files).slice(0, 3))}
              />
              <label
                htmlFor="verify-upload"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', border: '2px dashed #D6D3D1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#78716C' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2B5A3D'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D6D3D1'}
              >
                <Camera size={16} /> Upload Photos
              </label>
              {verifyImages.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {verifyImages.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={URL.createObjectURL(img)} alt="" style={{ width: 52, height: 52, borderRadius: 6, objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setVerifyImages(verifyImages.filter((_, idx) => idx !== i))}
                        style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#DC2626', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="outline" onClick={() => setVerifyModalOpen(false)} style={{ flex: 1 }} disabled={verifySubmitting}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleVerifySubmit} disabled={verifyConfirmed === null || verifySubmitting} style={{ flex: 1 }}>
                {verifySubmitting ? 'Submitting...' : 'Submit Response'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ==================== ADMIN/TECHNICIAN PAGES ====================
const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState([
    { label: t('dashboard.totalComplaints'), value: '...', icon: FileText, color: '#3B82F6' },
    { label: t('dashboard.pending'), value: '...', icon: Clock, color: '#EAB308' },
    { label: t('dashboard.inProgress'), value: '...', icon: AlertCircle, color: '#F97316' },
    { label: t('dashboard.resolved'), value: '...', icon: CheckCircle, color: '#16A34A' },
  ]);
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (user?.role === 'admin') {
          const data = await api('/reports/dashboard');
          const o = data.overview;
          setStats([
            { label: t('dashboard.totalComplaints'), value: String(o.totalComplaints), icon: FileText, color: '#3B82F6' },
            { label: t('dashboard.pending'), value: String(o.pendingComplaints), icon: Clock, color: '#EAB308' },
            { label: t('dashboard.inProgress'), value: String(o.inProgressComplaints), icon: AlertCircle, color: '#F97316' },
            { label: t('dashboard.resolved'), value: String(o.resolvedComplaints), icon: CheckCircle, color: '#16A34A' },
          ]);
          setRecentComplaints(o.recentComplaints || []);
        } else {
          const data = await api('/complaints');
          const complaints = data.complaints || [];
          const assigned = complaints.filter(c => c.status === 'assigned').length;
          const inProgress = complaints.filter(c => c.status === 'in-progress').length;
          const resolved = complaints.filter(c => c.status === 'closed').length;
          setStats([
            { label: t('dashboard.totalComplaints'), value: String(complaints.length), icon: FileText, color: '#3B82F6' },
            { label: t('complaints.assigned'), value: String(assigned), icon: Clock, color: '#EAB308' },
            { label: t('dashboard.inProgress'), value: String(inProgress), icon: AlertCircle, color: '#F97316' },
            { label: t('dashboard.resolved'), value: String(resolved), icon: CheckCircle, color: '#16A34A' },
          ]);
          setRecentComplaints(complaints.slice(0, 10));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      }
    };
    fetchDashboard();
  }, [user, t]);

  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 32px 0' }}>{t('dashboard.overview')}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 4px 0' }}>{stat.label}</p>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stat.value}</p>
                  </div>
                  <div style={{ width: '56px', height: '56px', backgroundColor: stat.color + '20', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={28} color={stat.color} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        <Card>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0' }}>{t('dashboard.recentComplaints')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentComplaints.length === 0 ? (
              <p style={{ color: '#78716C' }}>{t('dashboard.noComplaints')}</p>
            ) : recentComplaints.map((c) => {
              const Icon = categoryIcons[c.category] || AlertCircle;
              return (
                <div key={c._id || c.complaintId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F5F5F4', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={20} color="#2B5A3D" />
                    <div>
                      <p style={{ fontWeight: '500', margin: 0 }}>{c.complaintId}</p>
                      <p style={{ fontSize: '14px', color: '#78716C', margin: 0, textTransform: 'capitalize' }}>{c.category} Issue</p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Admin: All Complaints ─────────────────────────────────────────────────────
const AllComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [closureModalOpen, setClosureModalOpen] = useState(false);
  const [closureComplaint, setClosureComplaint] = useState(null);
  const [closureNote, setClosureNote] = useState('');
  const [closureSubmitting, setClosureSubmitting] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null); // ← lightbox state

  // Resolve relative upload URLs to full backend URL
  const resolveUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`;
  };

  const fetchComplaints = useCallback(async () => {
    try {
      const data = await api('/complaints');
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const openAssignModal = async (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedTechnicianId('');
    setAssignModalOpen(true);
    try {
      const data = await api('/technicians');
      setTechnicians(data.technicians || []);
    } catch (err) {
      console.error('Failed to fetch technicians:', err);
    }
  };

  const handleAssign = async () => {
    if (!selectedTechnicianId || !selectedComplaint) return;
    setAssigning(true);
    try {
      await api(`/complaints/${selectedComplaint._id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ technicianId: selectedTechnicianId }),
      });
      setAssignModalOpen(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      alert(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await api(`/complaints/${complaintId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchComplaints();
    } catch (err) {
      alert(err.message);
    }
  };

  const openClosureModal = (complaint) => {
    setClosureComplaint(complaint);
    setClosureNote('');
    setClosureModalOpen(true);
  };

  const handleAdminClose = async (action) => {
    setClosureSubmitting(true);
    try {
      await api(`/complaints/${closureComplaint._id}/admin-close`, {
        method: 'POST',
        body: JSON.stringify({ action, note: closureNote }),
      });
      setClosureModalOpen(false);
      setClosureComplaint(null);
      fetchComplaints();
      if (action === 'reassigned') openAssignModal(closureComplaint);
    } catch (err) {
      alert(err.message);
    } finally {
      setClosureSubmitting(false);
    }
  };

  // ── Reusable image strip ──────────────────────────────────────────────────
  const ImageStrip = ({ images }) => {
    if (!images?.length) return null;
    return (
      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => setLightboxUrl(resolveUrl(img.url))}
            style={{ position: 'relative', cursor: 'zoom-in' }}
          >
            <img
              src={resolveUrl(img.url)}
              alt={`proof-${i + 1}`}
              style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '2px solid #E7E5E4', display: 'block' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            {/* zoom hint overlay */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 8,
              backgroundColor: 'rgba(0,0,0,0)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.25)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'}
            >
              <ZoomIn size={18} color="white" style={{ opacity: 0.9 }} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 32px 0' }}>{t('complaints.allComplaints')}</h1>

        {loadingComplaints ? (
          <p style={{ color: '#78716C' }}>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <p style={{ color: '#78716C' }}>No complaints found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {complaints.map((complaint) => {
              const Icon = categoryIcons[complaint.category] || AlertCircle;
              const awaitingClosure = complaint.status === 'pending_verification' &&
                complaint.technicianResolution?.resolvedAt &&
                complaint.citizenVerification?.respondedAt;

              return (
                <Card key={complaint._id} hover>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(43,90,61,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={24} color="#2B5A3D" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0' }}>{complaint.complaintId}</h3>
                          <p style={{ fontSize: '14px', color: '#78716C', margin: 0, textTransform: 'capitalize' }}>{complaint.category} • {complaint.location?.address || 'N/A'}</p>
                        </div>
                        <StatusBadge status={complaint.status} />
                      </div>
                      <p style={{ color: '#57534E', margin: '0 0 12px 0' }}>{complaint.description}</p>

                      {/* Dual verification summary */}
                      {complaint.status === 'pending_verification' && (
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 200, padding: '10px 14px', backgroundColor: complaint.technicianResolution?.resolvedAt ? '#F0FDF4' : '#FFF7ED', borderRadius: '8px', border: `1px solid ${complaint.technicianResolution?.resolvedAt ? '#BBF7D0' : '#FED7AA'}` }}>
                            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#78716C', margin: '0 0 4px' }}>Technician</p>
                            {complaint.technicianResolution?.resolvedAt ? (
                              <>
                                <p style={{ fontSize: '13px', color: '#15803D', fontWeight: 500, margin: '0 0 2px' }}>✓ Marked resolved</p>
                                {complaint.technicianResolution.note && (
                                  <p style={{ fontSize: '12px', color: '#57534E', margin: 0 }}>{complaint.technicianResolution.note}</p>
                                )}
                                <ImageStrip images={complaint.technicianResolution.images} />
                              </>
                            ) : (
                              <p style={{ fontSize: '13px', color: '#EA580C', margin: 0 }}>Awaiting update</p>
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 200, padding: '10px 14px', backgroundColor: complaint.citizenVerification?.respondedAt ? '#F0FDF4' : '#FFF7ED', borderRadius: '8px', border: `1px solid ${complaint.citizenVerification?.respondedAt ? '#BBF7D0' : '#FED7AA'}` }}>
                            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#78716C', margin: '0 0 4px' }}>Citizen</p>
                            {complaint.citizenVerification?.respondedAt ? (
                              <>
                                <p style={{ fontSize: '13px', fontWeight: 500, color: complaint.citizenVerification.confirmed ? '#15803D' : '#DC2626', margin: '0 0 2px' }}>
                                  {complaint.citizenVerification.confirmed ? '✓ Confirmed fixed' : '✗ Says not fixed'}
                                </p>
                                {complaint.citizenVerification.note && (
                                  <p style={{ fontSize: '12px', color: '#57534E', margin: 0 }}>{complaint.citizenVerification.note}</p>
                                )}
                                <ImageStrip images={complaint.citizenVerification.images} />
                              </>
                            ) : (
                              <p style={{ fontSize: '13px', color: '#EA580C', margin: 0 }}>Awaiting response</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {complaint.assignedTo ? (
                          <span style={{ fontSize: '14px', color: '#2B5A3D', fontWeight: '500' }}>
                            Assigned to: {complaint.assignedTo.name || 'Technician'}
                          </span>
                        ) : (
                          <Button variant="primary" size="sm" onClick={() => openAssignModal(complaint)}>
                            Assign Technician
                          </Button>
                        )}
                        {complaint.status === 'submitted' && (
                          <Button variant="danger" size="sm" onClick={() => handleStatusChange(complaint._id, 'rejected')}>
                            Reject
                          </Button>
                        )}
                        {awaitingClosure && (
                          <Button variant="primary" size="sm" onClick={() => openClosureModal(complaint)}>
                            Review & Close
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px', cursor: 'zoom-out' }}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 28, lineHeight: 1 }}
          >
            ×
          </button>
          <img
            src={lightboxUrl}
            alt="preview"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, objectFit: 'contain', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
          />
        </div>
      )}

      {/* ── Assign Technician Modal ── */}
      {assignModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Assign Technician</h2>
            <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 24px 0' }}>
              Complaint: {selectedComplaint?.complaintId} — <span style={{ textTransform: 'capitalize' }}>{selectedComplaint?.category}</span>
            </p>
            {technicians.length === 0 ? (
              <p style={{ color: '#78716C' }}>Loading technicians...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {technicians.map((tech) => {
                  const matchesCategory = tech.specialization?.includes(selectedComplaint?.category);
                  return (
                    <div key={tech._id} onClick={() => setSelectedTechnicianId(tech._id)} style={{ padding: '16px', borderRadius: '10px', border: `2px solid ${selectedTechnicianId === tech._id ? '#2B5A3D' : '#E7E5E4'}`, backgroundColor: selectedTechnicianId === tech._id ? 'rgba(43,90,61,0.05)' : 'white', cursor: 'pointer', transition: 'all 0.2s', opacity: matchesCategory ? 1 : 0.5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: '600', margin: '0 0 4px 0' }}>{tech.name}</p>
                          <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 4px 0' }}>{tech.phone}</p>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {tech.specialization?.map((s) => (
                              <span key={s} style={{ padding: '2px 8px', backgroundColor: s === selectedComplaint?.category ? '#D1FAE5' : '#F5F5F4', borderRadius: '4px', fontSize: '12px', textTransform: 'capitalize' }}>{s}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '12px', color: '#78716C', margin: '0 0 2px 0' }}>Active: {tech.activeComplaints || 0}</p>
                          {!matchesCategory && <p style={{ fontSize: '11px', color: '#DC2626', margin: 0 }}>Specialization mismatch</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={() => setAssignModalOpen(false)} style={{ flex: 1 }}>Cancel</Button>
              <Button variant="primary" onClick={handleAssign} disabled={!selectedTechnicianId || assigning} style={{ flex: 1 }}>
                {assigning ? 'Assigning...' : 'Assign'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Admin Closure Modal ── */}
      {closureModalOpen && closureComplaint && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Review & Close</h2>
            <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 20px 0' }}>{closureComplaint.complaintId}</p>

            {/* Technician response */}
            <div style={{ marginBottom: '12px', padding: '14px', backgroundColor: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#78716C', margin: '0 0 6px' }}>Technician Response</p>
              <p style={{ fontSize: '14px', color: '#15803D', fontWeight: 500, margin: '0 0 4px' }}>✓ Marked as resolved</p>
              {closureComplaint.technicianResolution?.note && (
                <p style={{ fontSize: '13px', color: '#57534E', margin: '0 0 6px' }}>{closureComplaint.technicianResolution.note}</p>
              )}
              <ImageStrip images={closureComplaint.technicianResolution?.images} />
            </div>

            {/* Citizen response */}
            <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: closureComplaint.citizenVerification?.confirmed ? '#F0FDF4' : '#FEF2F2', borderRadius: '10px', border: `1px solid ${closureComplaint.citizenVerification?.confirmed ? '#BBF7D0' : '#FECACA'}` }}>
              <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#78716C', margin: '0 0 6px' }}>Citizen Response</p>
              <p style={{ fontSize: '14px', fontWeight: 500, color: closureComplaint.citizenVerification?.confirmed ? '#15803D' : '#DC2626', margin: '0 0 4px' }}>
                {closureComplaint.citizenVerification?.confirmed ? '✓ Confirmed issue is fixed' : '✗ Says issue is not fixed'}
              </p>
              {closureComplaint.citizenVerification?.note && (
                <p style={{ fontSize: '13px', color: '#57534E', margin: '0 0 6px' }}>{closureComplaint.citizenVerification.note}</p>
              )}
              <ImageStrip images={closureComplaint.citizenVerification?.images} />
            </div>

            {/* Admin note */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>Admin Note (optional)</label>
              <textarea
                value={closureNote}
                onChange={(e) => setClosureNote(e.target.value)}
                placeholder="Add a note before closing or re-assigning..."
                style={{ width: '100%', padding: '10px 12px', border: '2px solid #E7E5E4', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#2B5A3D'}
                onBlur={(e) => e.target.style.borderColor = '#E7E5E4'}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="outline" onClick={() => setClosureModalOpen(false)} style={{ flex: 1 }} disabled={closureSubmitting}>Cancel</Button>
              <Button variant="danger" size="md" onClick={() => handleAdminClose('reassigned')} disabled={closureSubmitting} style={{ flex: 1 }}>Re-assign</Button>
              <Button variant="primary" size="md" onClick={() => handleAdminClose('closed')} disabled={closureSubmitting} style={{ flex: 1 }}>
                {closureSubmitting ? 'Closing...' : 'Close Complaint'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
// ─── Technicians ──────────────────────────────────────────────────────────────
const Technicians = () => {
  const { t } = useTranslation();
  const [technicians, setTechnicians] = useState([]);
  const [loadingTech, setLoadingTech] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTech, setNewTech] = useState({ name: '', phone: '', specialization: [] });
  const [adding, setAdding] = useState(false);

  const fetchTechnicians = useCallback(async () => {
    try {
      const data = await api('/technicians');
      setTechnicians(data.technicians || []);
    } catch (err) {
      console.error('Failed to fetch technicians:', err);
    } finally {
      setLoadingTech(false);
    }
  }, []);

  useEffect(() => { fetchTechnicians(); }, [fetchTechnicians]);

  const handleAddTechnician = async () => {
    if (!newTech.name || !newTech.phone || newTech.specialization.length === 0) {
      alert('Please fill all fields');
      return;
    }
    setAdding(true);
    try {
      await api('/technicians', { method: 'POST', body: JSON.stringify(newTech) });
      setNewTech({ name: '', phone: '', specialization: [] });
      setShowAddForm(false);
      fetchTechnicians();
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const toggleSpec = (spec) => {
    setNewTech(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }));
  };

  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Technicians</h1>
          <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add Technician'}
          </Button>
        </div>

        {showAddForm && (
          <Card style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>Add New Technician</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input label="Name" placeholder="Technician name" value={newTech.name} onChange={(e) => setNewTech({ ...newTech, name: e.target.value })} />
              <Input label="Phone" type="tel" placeholder="10-digit mobile number" value={newTech.phone} onChange={(e) => setNewTech({ ...newTech, phone: e.target.value })} maxLength="10" icon={Phone} />
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#57534E', marginBottom: '8px' }}>Specialization</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['water', 'electricity', 'roads', 'sanitation', 'drainage', 'streetlight'].map(spec => (
                    <button key={spec} type="button" onClick={() => toggleSpec(spec)} style={{ padding: '6px 14px', borderRadius: '8px', border: `2px solid ${newTech.specialization.includes(spec) ? '#2B5A3D' : '#E7E5E4'}`, backgroundColor: newTech.specialization.includes(spec) ? 'rgba(43,90,61,0.1)' : 'white', color: newTech.specialization.includes(spec) ? '#2B5A3D' : '#1C1917', fontSize: '14px', cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit' }}>
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="primary" onClick={handleAddTechnician} disabled={adding}>
                {adding ? 'Adding...' : 'Add Technician'}
              </Button>
            </div>
          </Card>
        )}

        {loadingTech ? (
          <p style={{ color: '#78716C' }}>Loading technicians...</p>
        ) : technicians.length === 0 ? (
          <p style={{ color: '#78716C' }}>No technicians found. Add one above.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {technicians.map((tech) => (
              <Card key={tech._id}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px 0' }}>{tech.name}</h3>
                  <p style={{ fontSize: '14px', color: '#78716C', margin: 0 }}>{tech.phone}</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#57534E', margin: '0 0 8px 0' }}>Specialization:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tech.specialization?.map((spec) => (
                      <span key={spec} style={{ padding: '4px 12px', backgroundColor: '#F5F5F4', borderRadius: '6px', fontSize: '12px', textTransform: 'capitalize' }}>{spec}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#78716C', margin: '0 0 4px 0' }}>Active</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{tech.activeComplaints || 0}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#78716C', margin: '0 0 4px 0' }}>Resolved</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{tech.resolvedCount || 0}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Reports ──────────────────────────────────────────────────────────────────
const Reports = () => {
  const { t } = useTranslation();
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoadingReport(true);
    try {
      const data = await api(`/reports/monthly?month=${month}&year=${year}`);
      setReport(data.report);
    } catch (err) {
      console.error('Failed to fetch report:', err);
      setReport(null);
    } finally {
      setLoadingReport(false);
    }
  }, [month, year]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push({ label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), month: d.getMonth() + 1, year: d.getFullYear() });
  }

  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 32px 0' }}>{t('reports.monthlyReports')}</h1>
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#57534E', marginBottom: '8px' }}>Select Month</label>
            <select value={`${month}-${year}`} onChange={(e) => { const [m, y] = e.target.value.split('-'); setMonth(Number(m)); setYear(Number(y)); }} style={{ padding: '12px 16px', border: '2px solid #E7E5E4', borderRadius: '10px', fontSize: '16px', fontFamily: 'inherit', outline: 'none' }}>
              {months.map((m) => (
                <option key={`${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>{m.label}</option>
              ))}
            </select>
          </div>

          {loadingReport ? (
            <p style={{ color: '#78716C' }}>Loading report...</p>
          ) : report ? (
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>Report Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {[
                  { label: 'Total Complaints', value: report.summary.totalComplaints },
                  { label: 'Resolved', value: report.summary.resolved },
                  { label: 'Avg Resolution Time', value: report.summary.avgResolutionTime },
                  { label: 'Month-over-Month', value: report.summary.monthOverMonthChange },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '16px', backgroundColor: '#F5F5F4', borderRadius: '10px' }}>
                    <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 4px 0' }}>{label}</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
              {report.technicianPerformance?.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>Technician Performance</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {report.technicianPerformance.map((tp, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F5F5F4', borderRadius: '10px' }}>
                        <span style={{ fontWeight: '500' }}>{tp.name}</span>
                        <span style={{ fontSize: '14px', color: '#78716C' }}>Assigned: {tp.assigned} | Resolved: {tp.resolved}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#78716C' }}>No data available for this month.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

// ─── Technician: Assigned Complaints ─────────────────────────────────────────
const AssignedComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveComplaint, setResolveComplaint] = useState(null);
  const [resolveNote, setResolveNote] = useState('');
  const [resolveImages, setResolveImages] = useState([]);
  const [resolveSubmitting, setResolveSubmitting] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      const data = await api('/complaints');
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to fetch assigned complaints:', err);
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await api(`/complaints/${complaintId}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      fetchComplaints();
    } catch (err) {
      alert(err.message);
    }
  };

  const openResolveModal = (complaint) => {
    setResolveComplaint(complaint);
    setResolveNote('');
    setResolveImages([]);
    setResolveModalOpen(true);
  };

  const handleTechnicianResolve = async () => {
    setResolveSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('note', resolveNote);
      resolveImages.forEach(img => fd.append('images', img));
      await api(`/complaints/${resolveComplaint._id}/technician-resolve`, { method: 'POST', body: fd });
      setResolveModalOpen(false);
      setResolveComplaint(null);
      fetchComplaints();
    } catch (err) {
      alert(err.message);
    } finally {
      setResolveSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 32px 0' }}>{t('assigned.assignedComplaints')}</h1>

        {loadingComplaints ? (
          <p style={{ color: '#78716C' }}>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <p style={{ color: '#78716C' }}>No complaints assigned to you.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {complaints.map((complaint) => {
              const Icon = categoryIcons[complaint.category] || AlertCircle;
              return (
                <Card key={complaint._id} hover>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(43,90,61,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={24} color="#2B5A3D" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0' }}>{complaint.complaintId}</h3>
                          <p style={{ fontSize: '14px', color: '#78716C', margin: 0 }}>{complaint.location?.address || 'N/A'}</p>
                        </div>
                        <StatusBadge status={complaint.status} />
                      </div>
                      <p style={{ color: '#57534E', margin: '0 0 12px 0' }}>{complaint.description}</p>

                      {/* pending_verification — show what was submitted */}
                      {complaint.status === 'pending_verification' && complaint.technicianResolution?.resolvedAt && (
                        <div style={{ padding: '10px 14px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '12px' }}>
                          <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#78716C', margin: '0 0 4px' }}>Your Resolution</p>
                          <p style={{ fontSize: '13px', color: '#15803D', margin: '0 0 2px' }}>✓ Submitted — awaiting citizen confirmation</p>
                          {complaint.technicianResolution.note && (
                            <p style={{ fontSize: '12px', color: '#57534E', margin: 0 }}>{complaint.technicianResolution.note}</p>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {complaint.status === 'assigned' && (
                          <Button variant="primary" size="sm" onClick={() => handleStatusChange(complaint._id, 'in-progress')}>
                            Mark In Progress
                          </Button>
                        )}
                        {complaint.status === 'in-progress' && (
                          <Button variant="primary" size="sm" onClick={() => openResolveModal(complaint)}>
                            Mark Resolved
                          </Button>
                        )}
                        {complaint.status === 'reopened' && (
                          <Button variant="primary" size="sm" onClick={() => openResolveModal(complaint)}>
                            Re-submit Resolution
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Technician Resolve Modal ── */}
      {resolveModalOpen && resolveComplaint && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '480px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Mark as Resolved</h2>
            <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 20px 0' }}>{resolveComplaint.complaintId}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>Resolution Note (optional)</label>
                <textarea
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="Describe what was done to fix the issue..."
                  style={{ width: '100%', padding: '10px 12px', border: '2px solid #E7E5E4', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '90px', boxSizing: 'border-box', outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = '#2B5A3D'}
                  onBlur={(e) => e.target.style.borderColor = '#E7E5E4'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>Proof Photos (optional, up to 3)</label>
                <input type="file" accept="image/*" multiple id="resolve-upload" style={{ display: 'none' }} onChange={(e) => setResolveImages(Array.from(e.target.files).slice(0, 3))} />
                <label htmlFor="resolve-upload" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: '2px dashed #D6D3D1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#78716C' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2B5A3D'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D6D3D1'}
                >
                  <Camera size={18} /> Upload Photos
                </label>
                {resolveImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    {resolveImages.map((img, i) => (
                      <img key={i} src={URL.createObjectURL(img)} alt="" style={{ width: 52, height: 52, borderRadius: 6, objectFit: 'cover' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <Button variant="outline" onClick={() => setResolveModalOpen(false)} style={{ flex: 1 }} disabled={resolveSubmitting}>Cancel</Button>
              <Button variant="primary" onClick={handleTechnicianResolve} disabled={resolveSubmitting} style={{ flex: 1 }}>
                {resolveSubmitting ? 'Submitting...' : 'Submit Resolution'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ==================== MAIN APP ====================
function App() {
  const { isAuthenticated, loading, user } = useAuth();
  const [activePage, setActivePage] = useState('home');

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'technician') {
      setActivePage('dashboard');
    } else {
      setActivePage('home');
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    if (user?.role === 'citizen') {
      // Force fresh data fetch every time user navigates to complaints page
      if (activePage === 'complaints') return <CitizenComplaints key={`complaints-${Date.now()}`} />;
      return <CitizenHome setActivePage={setActivePage} />;
    }

    if (user?.role === 'technician') {
      if (activePage === 'assigned') return <AssignedComplaints />;
      return <Dashboard />;
    }

    if (user?.role === 'admin') {
      if (activePage === 'complaints') return <AllComplaints />;
      if (activePage === 'technicians') return <Technicians />;
      if (activePage === 'reports') return <Reports />;
      return <Dashboard />;
    }

    return <CitizenHome />;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF9' }}>
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main>{renderPage()}</main>
    </div>
  );
}

export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
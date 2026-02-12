import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, FileText, Users, BarChart3, 
  MapPin, Phone, Camera, Send, CheckCircle, Clock, AlertCircle,
  Menu, X, LogOut, 
  Droplet, Zap, Construction, Trash2, Wind, Lightbulb, Download,
  Languages
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
  };

  const config = statusConfig[status] || statusConfig.submitted;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: '9999px',
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

  const categories = [
    { id: 'water', label: t('citizen.water'), icon: Droplet },
    { id: 'electricity', label: t('citizen.electricity'), icon: Zap },
    { id: 'roads', label: t('citizen.roads'), icon: Construction },
    { id: 'sanitation', label: t('citizen.sanitation'), icon: Trash2 },
    { id: 'drainage', label: t('citizen.drainage'), icon: Wind },
    { id: 'streetlight', label: t('citizen.streetlight'), icon: Lightbulb },
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files].slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      const data = await api('/complaints', {
        method: 'POST',
        body: fd,
      });

      setComplaintId(data.complaint.complaintId);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setFormData({ category: '', description: '', phone: '', location: { address: '' } });
        setImages([]);
        setComplaintId('');
      }, 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '32px 16px' }}>
        <Card style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#D1FAE5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <CheckCircle size={40} color="#065F46" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
            {t('citizen.successTitle')}
          </h2>
          <p style={{ color: '#57534E', margin: '0 0 8px 0' }}>{t('citizen.successMessage')}</p>
          <p style={{ color: '#78716C', margin: '0 0 8px 0' }}>{t('citizen.complaintId')}</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2B5A3D', margin: '0 0 24px 0' }}>
            {complaintId}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              icon={FileText}
              onClick={() => setActivePage('complaints')}
            >
              View My Complaints
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setSuccess(false);
                setComplaintId('');
                setFormData({ category: '', description: '', phone: '', location: { address: '' } });
                setImages([]);
              }}
            >
              {t('citizen.submitAnother')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
          {t('citizen.registerComplaint')}
        </h1>
        <p style={{ color: '#57534E', margin: '0 0 32px 0' }}>
          {t('citizen.fillDetails')}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>{t('citizen.selectCategory')}</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px'
            }}>
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: `2px solid ${formData.category === cat.id ? '#2B5A3D' : '#E7E5E4'}`,
                      backgroundColor: formData.category === cat.id ? 'rgba(43, 90, 61, 0.1)' : 'white',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <Icon size={32} color="#2B5A3D" style={{ marginBottom: '8px' }} />
                    <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>{cat.label}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>{t('citizen.complaintDetails')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#57534E',
                  marginBottom: '8px'
                }}>
                  {t('citizen.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('citizen.descriptionPlaceholder')}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'white',
                    border: '2px solid #E7E5E4',
                    borderRadius: '10px',
                    fontSize: '16px',
                    resize: 'vertical',
                    minHeight: '120px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2B5A3D';
                    e.target.style.boxShadow = '0 0 0 3px rgba(43, 90, 61, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E7E5E4';
                    e.target.style.boxShadow = 'none';
                  }}
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

              <Input
                label={t('citizen.location')}
                type="text"
                placeholder={t('citizen.locationPlaceholder')}
                value={formData.location.address}
                onChange={(e) => setFormData({ ...formData, location: { address: e.target.value } })}
                icon={MapPin}
                required
              />
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>{t('citizen.uploadPhotos')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px',
                  border: '2px dashed #E7E5E4',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2B5A3D'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E7E5E4'}
              >
                <Camera size={40} color="#78716C" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 4px 0' }}>
                  {t('citizen.clickUpload')}
                </p>
                <p style={{ fontSize: '12px', color: '#78716C', margin: 0 }}>{t('citizen.uptoImages')}</p>
              </label>
              
              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {images.map((img, idx) => (
                    <div key={idx} style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid #E7E5E4'
                    }}>
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Upload ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          padding: '4px',
                          backgroundColor: '#DC2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={Send}
            disabled={submitting || !formData.category || !formData.description}
            style={{ width: '100%' }}
          >
            {submitting ? t('citizen.submitting') : t('citizen.submitComplaint')}
          </Button>
        </form>
      </div>
    </div>
  );
};

const CitizenComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

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

  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{t('citizen.myComplaints')}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loadingComplaints}
          >
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
            return (
              <Card key={complaint.complaintId} hover>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'rgba(43, 90, 61, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={24} color="#2B5A3D" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0' }}>
                          {complaint.complaintId}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#78716C', textTransform: 'capitalize', margin: 0 }}>
                          {complaint.category} • {complaint.location.address}
                        </p>
                      </div>
                      <StatusBadge status={complaint.status} />
                    </div>
                    <p style={{ color: '#57534E', margin: '0 0 12px 0' }}>{complaint.description}</p>
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
          // Technician dashboard - use complaints endpoint
          const data = await api('/complaints');
          const complaints = data.complaints || [];
          const assigned = complaints.filter(c => c.status === 'assigned').length;
          const inProgress = complaints.filter(c => c.status === 'in-progress').length;
          const resolved = complaints.filter(c => c.status === 'resolved').length;
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 4px 0' }}>{stat.label}</p>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stat.value}</p>
                  </div>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: stat.color + '20',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
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
              <div key={c._id || c.complaintId} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: '#F5F5F4',
                borderRadius: '10px'
              }}>
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

const AllComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [assigning, setAssigning] = useState(false);

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

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

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
            return (
              <Card key={complaint._id} hover>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'rgba(43, 90, 61, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
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
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        )}
      </div>

      {/* Assign Technician Modal */}
      {assignModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
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
                    <div
                      key={tech._id}
                      onClick={() => setSelectedTechnicianId(tech._id)}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: `2px solid ${selectedTechnicianId === tech._id ? '#2B5A3D' : '#E7E5E4'}`,
                        backgroundColor: selectedTechnicianId === tech._id ? 'rgba(43, 90, 61, 0.05)' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: matchesCategory ? 1 : 0.5,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: '600', margin: '0 0 4px 0' }}>{tech.name}</p>
                          <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 4px 0' }}>{tech.phone}</p>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {tech.specialization?.map((s) => (
                              <span key={s} style={{
                                padding: '2px 8px',
                                backgroundColor: s === selectedComplaint?.category ? '#D1FAE5' : '#F5F5F4',
                                borderRadius: '4px',
                                fontSize: '12px',
                                textTransform: 'capitalize'
                              }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '12px', color: '#78716C', margin: '0 0 2px 0' }}>Active: {tech.activeComplaints || 0}</p>
                          {!matchesCategory && (
                            <p style={{ fontSize: '11px', color: '#DC2626', margin: 0 }}>Specialization mismatch</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={() => setAssignModalOpen(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAssign}
                disabled={!selectedTechnicianId || assigning}
                style={{ flex: 1 }}
              >
                {assigning ? 'Assigning...' : 'Assign'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

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

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  const handleAddTechnician = async () => {
    if (!newTech.name || !newTech.phone || newTech.specialization.length === 0) {
      alert('Please fill all fields');
      return;
    }
    setAdding(true);
    try {
      await api('/technicians', {
        method: 'POST',
        body: JSON.stringify(newTech),
      });
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
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpec(spec)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: `2px solid ${newTech.specialization.includes(spec) ? '#2B5A3D' : '#E7E5E4'}`,
                        backgroundColor: newTech.specialization.includes(spec) ? 'rgba(43,90,61,0.1)' : 'white',
                        color: newTech.specialization.includes(spec) ? '#2B5A3D' : '#1C1917',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        fontFamily: 'inherit'
                      }}
                    >
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
                    <span key={spec} style={{
                      padding: '4px 12px',
                      backgroundColor: '#F5F5F4',
                      borderRadius: '6px',
                      fontSize: '12px',
                      textTransform: 'capitalize'
                    }}>
                      {spec}
                    </span>
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

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

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
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#57534E', marginBottom: '8px' }}>
              Select Month
            </label>
            <select
              value={`${month}-${year}`}
              onChange={(e) => {
                const [m, y] = e.target.value.split('-');
                setMonth(Number(m));
                setYear(Number(y));
              }}
              style={{
                padding: '12px 16px',
                border: '2px solid #E7E5E4',
                borderRadius: '10px',
                fontSize: '16px',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            >
              {months.map((m) => (
                <option key={`${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {loadingReport ? (
            <p style={{ color: '#78716C' }}>Loading report...</p>
          ) : report ? (
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>Report Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#F5F5F4', borderRadius: '10px' }}>
                  <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 4px 0' }}>Total Complaints</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{report.summary.totalComplaints}</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#F5F5F4', borderRadius: '10px' }}>
                  <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 4px 0' }}>Resolved</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{report.summary.resolved}</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#F5F5F4', borderRadius: '10px' }}>
                  <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 4px 0' }}>Avg Resolution Time</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{report.summary.avgResolutionTime}</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#F5F5F4', borderRadius: '10px' }}>
                  <p style={{ fontSize: '14px', color: '#78716C', margin: '0 0 4px 0' }}>Month-over-Month</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{report.summary.monthOverMonthChange}</p>
                </div>
              </div>

              {report.technicianPerformance && report.technicianPerformance.length > 0 && (
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

const AssignedComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);

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

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

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
            const Icon = categoryIcons[complaint.category];
            return (
              <Card key={complaint._id} hover>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'rgba(43, 90, 61, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
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
                    <p style={{ color: '#57534E', marginBottom: '12px', margin: '0 0 12px 0' }}>{complaint.description}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {complaint.status === 'assigned' && (
                        <Button variant="primary" size="sm" onClick={() => handleStatusChange(complaint._id, 'in-progress')}>
                          Mark In Progress
                        </Button>
                      )}
                      {complaint.status === 'in-progress' && (
                        <Button variant="secondary" size="sm" onClick={() => handleStatusChange(complaint._id, 'resolved')}>
                          Mark Resolved
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
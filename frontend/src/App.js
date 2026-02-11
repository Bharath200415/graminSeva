import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Home, FileText, Users, BarChart3,
  MapPin, Phone, Camera, Send, CheckCircle, Clock, AlertCircle,
  Menu, X, LogOut,
  Droplet, Zap, Construction, Trash2, Wind, Lightbulb
} from 'lucide-react';
import './index.css';

// Auth Context
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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
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

// Category icons mapping
const categoryIcons = {
  water: Droplet,
  electricity: Zap,
  roads: Construction,
  sanitation: Trash2,
  drainage: Wind,
  streetlight: Lightbulb,
  other: AlertCircle,
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    submitted: { color: 'bg-yellow-100 text-yellow-800', text: 'Submitted' },
    assigned: { color: 'bg-blue-100 text-blue-800', text: 'Assigned' },
    'in-progress': { color: 'bg-orange-100 text-orange-800', text: 'In Progress' },
    resolved: { color: 'bg-green-100 text-green-800', text: 'Resolved' },
    rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
  };

  const config = statusConfig[status] || statusConfig.submitted;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

// Button component
const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, onClick, disabled, className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] active:scale-95',
    secondary: 'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-light)] active:scale-95',
    outline: 'border-2 border-[var(--color-border)] bg-white hover:bg-[var(--color-surface-hover)] active:scale-95',
    ghost: 'hover:bg-[var(--color-surface-hover)] active:scale-95',
    danger: 'bg-[var(--color-error)] text-white hover:bg-red-700 active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children}
    </button>
  );
};

// Input component
const Input = ({ label, error, icon: Icon, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
            <Icon size={20} />
          </div>
        )}
        <input
          className={`w-full px-4 py-3 ${Icon ? 'pl-11' : ''} bg-white border-2 border-[var(--color-border)] rounded-lg text-base focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all ${error ? 'border-red-500' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Card component
const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={`bg-white rounded-xl border border-[var(--color-border)] p-6 ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''} ${className}`}>
      {children}
    </div>
  );
};

// Login Page
const LoginPage = () => {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('citizen');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const TEST_OTP = '123456';

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStep(2);
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (otp !== TEST_OTP) {
      setError('Invalid OTP. Use: 123456');
      return;
    }

    setLoading(true);
    // Simulate login
    setTimeout(() => {
      const userData = {
        id: '1',
        phone,
        name: role === 'admin' ? 'Admin User' : role === 'technician' ? 'Technician' : 'Citizen',
        role,
      };
      login(userData);
      localStorage.setItem('authToken', 'test-token-' + Date.now());
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            Rural Complaint Portal
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Empowering Rural India
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <Input
              label="Mobile Number"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={Phone}
              maxLength="10"
              error={error}
            />

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                Select Role
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['citizen', 'technician', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                      role === r
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                OTP sent to +91 {phone}
              </p>
              <Input
                label="Enter OTP"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                error={error}
              />
              <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                Test OTP: <strong>123456</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
              >
                Back
              </Button>
              <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

// Navbar Component
const Navbar = ({ activePage, setActivePage }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = {
    citizen: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'complaints', label: 'My Complaints', icon: FileText },
    ],
    technician: [
      { id: 'home', label: 'Dashboard', icon: Home },
      { id: 'assigned', label: 'Assigned', icon: FileText },
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'complaints', label: 'Complaints', icon: FileText },
      { id: 'technicians', label: 'Technicians', icon: Users },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
    ],
  };

  const navItems = navigation[user?.role] || navigation.citizen;

  return (
    <nav className="bg-white border-b border-[var(--color-border)] sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-white" />
            </div>
            <span className="text-lg font-bold hidden sm:block">RCP</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activePage === item.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-[var(--color-text-tertiary)] capitalize">{user?.role}</p>
            </div>
            <Button variant="ghost" icon={LogOut} onClick={logout} className="hidden md:flex">
              Logout
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-[var(--color-surface-hover)] rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--color-border)]">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 font-medium transition-all ${
                  activePage === item.id
                    ? 'bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-medium hover:bg-red-50"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

// Citizen Home - New Complaint Form
const CitizenHome = () => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    phone: '',
    location: { latitude: '', longitude: '', address: '' },
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState('');

  const categories = [
    { id: 'water', label: 'Water Supply', icon: Droplet },
    { id: 'electricity', label: 'Electricity', icon: Zap },
    { id: 'roads', label: 'Roads', icon: Construction },
    { id: 'sanitation', label: 'Sanitation', icon: Trash2 },
    { id: 'drainage', label: 'Drainage', icon: Wind },
    { id: 'streetlight', label: 'Street Light', icon: Lightbulb },
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files].slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      const newComplaintId = `CMP${Date.now().toString().slice(-8)}`;
      setComplaintId(newComplaintId);
      setSuccess(true);
      setSubmitting(false);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          category: '',
          description: '',
          phone: '',
          location: { latitude: '', longitude: '', address: '' },
        });
        setImages([]);
        setComplaintId('');
      }, 3000);
    }, 1500);
  };

  if (success) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Complaint Submitted Successfully!</h2>
          <p className="text-[var(--color-text-secondary)] mb-2">Your complaint ID is:</p>
          <p className="text-3xl font-bold text-[var(--color-primary)] mb-6">{complaintId}</p>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Please save this ID for tracking your complaint
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Register New Complaint</h1>
        <p className="text-[var(--color-text-secondary)] mb-8">
          Fill in the details below to submit your complaint
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Select Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      formData.category === cat.id
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-10'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                    }`}
                  >
                    <Icon size={32} className="mx-auto mb-2 text-[var(--color-primary)]" />
                    <p className="text-sm font-medium">{cat.label}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Complaint Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the issue in detail..."
                  className="w-full px-4 py-3 bg-white border-2 border-[var(--color-border)] rounded-lg text-base focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 transition-all resize-none"
                  rows="5"
                  required
                />
              </div>

              <Input
                label="Contact Number"
                type="tel"
                placeholder="Enter your mobile number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                icon={Phone}
                maxLength="10"
                required
              />

              <Input
                label="Location Address"
                type="text"
                placeholder="Enter complaint location"
                value={formData.location.address}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, address: e.target.value }
                })}
                icon={MapPin}
                required
              />
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Upload Photos (Optional)</h3>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-primary)] transition-colors"
              >
                <Camera size={40} className="text-[var(--color-text-tertiary)] mb-3" />
                <p className="text-sm font-medium mb-1">Click to upload images</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Up to 5 images</p>
              </label>
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[var(--color-border)]">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
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
            className="w-full"
            disabled={submitting || !formData.category || !formData.description}
          >
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </Button>
        </form>
      </div>
    </div>
  );
};

// Citizen Complaints List
const CitizenComplaints = () => {
  const [complaints] = useState([
    {
      complaintId: 'CMP2602001',
      category: 'water',
      description: 'No water supply for the last 3 days in our area',
      status: 'in-progress',
      createdAt: '2024-02-10',
      location: { address: 'Village Ashta' },
    },
    {
      complaintId: 'CMP2601045',
      category: 'electricity',
      description: 'Street light not working',
      status: 'resolved',
      createdAt: '2024-01-28',
      location: { address: 'Main Road, Ashta' },
    },
  ]);

  const getCategoryIcon = (category) => {
    const Icon = categoryIcons[category] || AlertCircle;
    return Icon;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Complaints</h1>

        <div className="space-y-4">
          {complaints.map((complaint) => {
            const Icon = getCategoryIcon(complaint.category);
            return (
              <Card key={complaint.complaintId} hover>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[var(--color-primary)] bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={24} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{complaint.complaintId}</h3>
                        <p className="text-sm text-[var(--color-text-tertiary)] capitalize">
                          {complaint.category} • {complaint.location.address}
                        </p>
                      </div>
                      <StatusBadge status={complaint.status} />
                    </div>
                    <p className="text-[var(--color-text-secondary)] mb-3">
                      {complaint.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-tertiary)]">
                      <span className="flex items-center gap-1">
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
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => {
  const stats = [
    { label: 'Total Complaints', value: '156', icon: FileText, color: 'blue' },
    { label: 'Pending', value: '23', icon: Clock, color: 'yellow' },
    { label: 'In Progress', value: '45', icon: AlertCircle, color: 'orange' },
    { label: 'Resolved', value: '88', icon: CheckCircle, color: 'green' },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-tertiary)] mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                  <Icon size={28} className={`text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <h2 className="text-xl font-bold mb-4">Recent Complaints</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[var(--color-surface-hover)] rounded-lg">
              <div className="flex items-center gap-3">
                <Droplet size={20} className="text-[var(--color-primary)]" />
                <div>
                  <p className="font-medium">CMP260200{i}</p>
                  <p className="text-sm text-[var(--color-text-tertiary)]">Water Supply Issue</p>
                </div>
              </div>
              <StatusBadge status="submitted" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Main App Component
function App() {
  const { isAuthenticated, loading, user } = useAuth();
  const [activePage, setActivePage] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    if (user?.role === 'citizen') {
      switch (activePage) {
        case 'home':
          return <CitizenHome />;
        case 'complaints':
          return <CitizenComplaints />;
        default:
          return <CitizenHome />;
      }
    }

    if (user?.role === 'admin') {
      switch (activePage) {
        case 'dashboard':
          return <AdminDashboard />;
        default:
          return <AdminDashboard />;
      }
    }

    return <CitizenHome />;
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main>{renderPage()}</main>
    </div>
  );
}

// Main entry point with AuthProvider
export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
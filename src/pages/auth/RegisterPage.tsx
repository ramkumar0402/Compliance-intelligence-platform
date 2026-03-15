import React, { useState } from 'react';
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  Building,
  Briefcase,
  Check
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { DEPARTMENTS, TITLES } from '../../types/auth';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onRegistrationSuccess: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateToLogin,
  onRegistrationSuccess,
}) => {
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    title: '',
    acceptTerms: false,
    acceptPrivacy: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    return checks;
  };

  const passwordChecks = validatePassword(formData.password);
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const errors = {
    firstName: touched.firstName && !formData.firstName ? 'First name is required' : '',
    lastName: touched.lastName && !formData.lastName ? 'Last name is required' : '',
    email: touched.email && !formData.email 
      ? 'Email is required' 
      : touched.email && !validateEmail(formData.email)
      ? 'Please enter a valid email address'
      : '',
    password: touched.password && !formData.password 
      ? 'Password is required' 
      : touched.password && passwordStrength < 3
      ? 'Password is too weak'
      : '',
    confirmPassword: touched.confirmPassword && !formData.confirmPassword
      ? 'Please confirm your password'
      : touched.confirmPassword && formData.password !== formData.confirmPassword
      ? 'Passwords do not match'
      : '',
    department: touched.department && !formData.department ? 'Please select a department' : '',
    title: touched.title && !formData.title ? 'Please select a title' : '',
    terms: touched.acceptTerms && !formData.acceptTerms ? 'You must accept the terms' : '',
    privacy: touched.acceptPrivacy && !formData.acceptPrivacy ? 'You must accept the privacy policy' : '',
  };

  const isStep1Valid = formData.firstName && formData.lastName && validateEmail(formData.email);
  const isStep2Valid = passwordStrength >= 3 && formData.password === formData.confirmPassword;
  const isStep3Valid = formData.department && formData.title && formData.acceptTerms && formData.acceptPrivacy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    const success = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      department: formData.department,
      title: formData.title,
      acceptTerms: formData.acceptTerms,
      acceptPrivacy: formData.acceptPrivacy,
    });

    if (success) {
      onRegistrationSuccess();
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ClearanceIQ</h1>
              <p className="text-blue-200 text-sm">Compliance Intelligence Platform</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Create Your<br />Account
              </h2>
              <p className="text-blue-200 text-lg max-w-md">
                Join thousands of compliance professionals using ClearanceIQ to streamline 
                their risk management workflows.
              </p>
            </div>

            {/* Steps Indicator */}
            <div className="space-y-4">
              {[
                { num: 1, title: 'Personal Information', desc: 'Your name and email' },
                { num: 2, title: 'Secure Password', desc: 'Create a strong password' },
                { num: 3, title: 'Professional Details', desc: 'Department and role' },
              ].map((s) => (
                <div 
                  key={s.num}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    step === s.num 
                      ? 'bg-white/10 border border-white/20' 
                      : step > s.num
                      ? 'opacity-60'
                      : 'opacity-40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step > s.num 
                      ? 'bg-green-500 text-white' 
                      : step === s.num
                      ? 'bg-white text-navy-900'
                      : 'bg-white/20 text-white'
                  }`}>
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{s.title}</p>
                    <p className="text-blue-200 text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-3 text-blue-200 text-sm">
            <Shield className="w-5 h-5" />
            <span>256-bit SSL encryption • SOC 2 compliant</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 bg-gray-50">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ClearanceIQ</h1>
              <p className="text-gray-500 text-xs">Compliance Intelligence</p>
            </div>
          </div>

          {/* Mobile Steps */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step ? 'w-8 bg-navy-900' : s < step ? 'w-2 bg-green-500' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 1 && 'Personal Information'}
              {step === 2 && 'Create Password'}
              {step === 3 && 'Professional Details'}
            </h2>
            <p className="text-gray-600">
              {step === 1 && 'Enter your personal details to get started'}
              {step === 2 && 'Choose a strong, secure password'}
              {step === 3 && 'Tell us about your role'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium text-sm">Registration Failed</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        onBlur={() => handleBlur('firstName')}
                        placeholder="John"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.firstName
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        onBlur={() => handleBlur('lastName')}
                        placeholder="Doe"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.lastName
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="john.doe@company.com"
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.email
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {formData.email && validateEmail(formData.email) && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      placeholder="Create a strong password"
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.password
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Password strength</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength <= 2 ? 'text-red-600' :
                          passwordStrength <= 3 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {[
                          { key: 'length', label: '8+ characters' },
                          { key: 'uppercase', label: 'Uppercase letter' },
                          { key: 'lowercase', label: 'Lowercase letter' },
                          { key: 'number', label: 'Number' },
                          { key: 'special', label: 'Special character' },
                        ].map((check) => (
                          <div 
                            key={check.key}
                            className={`flex items-center gap-1.5 text-xs ${
                              passwordChecks[check.key as keyof typeof passwordChecks]
                                ? 'text-green-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {passwordChecks[check.key as keyof typeof passwordChecks] ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                            )}
                            {check.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="Confirm your password"
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.confirmPassword
                          ? 'border-red-300 focus:ring-red-500'
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-green-300 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Passwords match
                    </p>
                  )}
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}

            {/* Step 3: Professional Details */}
            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      onBlur={() => handleBlur('department')}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none bg-white ${
                        errors.department
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    >
                      <option value="">Select department</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  {errors.department && (
                    <p className="mt-1 text-xs text-red-600">{errors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      onBlur={() => handleBlur('title')}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none bg-white ${
                        errors.title
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    >
                      <option value="">Select title</option>
                      {TITLES.map(title => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                  </div>
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Terms and Privacy */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                      I agree to the{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">End User License Agreement</a>
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="acceptPrivacy"
                      checked={formData.acceptPrivacy}
                      onChange={(e) => handleInputChange('acceptPrivacy', e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="acceptPrivacy" className="text-sm text-gray-600">
                      I have read and accept the{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Privacy Policy</a>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || (step === 3 && !isStep3Valid)}
                className="flex-1 py-3 px-4 bg-navy-900 hover:bg-navy-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-navy-900/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : step === 3 ? (
                  <>
                    Create Account
                    <CheckCircle className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onNavigateToLogin}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

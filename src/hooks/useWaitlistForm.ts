import { useState } from 'react';
import confetti from 'canvas-confetti';

export function useWaitlistForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    isChecking: false,
    error: '',
    domainValid: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [rateLimit, setRateLimit] = useState({
    attempts: 0,
    lastAttempt: 0,
    blocked: false,
    cooldownEnd: 0
  });

  // Confetti effect function
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff4fa3', '#721422', '#F7A8B8', '#721422', '#18321f'],
      shapes: ['circle', 'square'],
      gravity: 0.8,
      ticks: 200
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#ff4fa3', '#721422', '#F7A8B8'],
        shapes: ['circle'],
        gravity: 1,
        ticks: 150
      });
    }, 200);
  };

  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmailDomain = async (email: string): Promise<boolean> => {
    const domain = email.split('@')[1];
    if (!domain) return false;
    try {
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
      const data = await response.json();
      return data.Answer && data.Answer.length > 0;
    } catch {
      return false;
    }
  };

  const validateEmail = async (email: string) => {
    if (!email) {
      setEmailValidation({
        isValid: false,
        isChecking: false,
        error: '',
        domainValid: false
      });
      return;
    }
    const formatValid = validateEmailFormat(email);
    if (!formatValid) {
      setEmailValidation({
        isValid: false,
        isChecking: false,
        error: 'Please enter a valid email address',
        domainValid: false
      });
      return;
    }
    setEmailValidation(prev => ({ ...prev, isChecking: true }));
    const domainValid = await validateEmailDomain(email);
    setEmailValidation({
      isValid: formatValid && domainValid,
      isChecking: false,
      error: domainValid ? '' : 'This email domain appears to be invalid',
      domainValid
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') {
      validateEmail(e.target.value);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const now = Date.now();
    if (rateLimit.blocked && now < rateLimit.cooldownEnd) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }
    const timeWindow = 60000;
    const maxAttempts = 3;
    if (now - rateLimit.lastAttempt < timeWindow) {
      const newAttempts = rateLimit.attempts + 1;
      if (newAttempts > maxAttempts) {
        const cooldownTime = 300000;
        setRateLimit({
          attempts: newAttempts,
          lastAttempt: now,
          blocked: true,
          cooldownEnd: now + cooldownTime
        });
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
        return;
      }
      setRateLimit(prev => ({
        ...prev,
        attempts: newAttempts,
        lastAttempt: now
      }));
    } else {
      setRateLimit(prev => ({
        ...prev,
        attempts: 1,
        lastAttempt: now,
        blocked: false,
        cooldownEnd: 0
      }));
    }
    if (!emailValidation.isValid) {
      setEmailValidation(prev => ({ ...prev, error: 'Please enter a valid email address' }));
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      const subscribeResponse = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email
        })
      });
      if (!subscribeResponse.ok) {
        const errorData = await subscribeResponse.json();
        setSubmitStatus('error');
        setIsSubmitting(false);
        setEmailValidation(prev => ({
          ...prev,
          error: errorData.error || 'Failed to subscribe to waitlist'
        }));
        setTimeout(() => setSubmitStatus('idle'), 3000);
        return;
      }
      setIsSubmitting(false);
      setSubmitStatus('success');
      triggerConfetti();
      setTimeout(() => {
        setFormData({ name: '', email: '' });
        setEmailValidation({
          isValid: false,
          isChecking: false,
          error: '',
          domainValid: false
        });
        setSubmitStatus('idle');
        setRateLimit({
          attempts: 0,
          lastAttempt: 0,
          blocked: false,
          cooldownEnd: 0
        });
      }, 3000);
    } catch {
      setIsSubmitting(false);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  return {
    formData,
    handleFormChange,
    handleFormSubmit,
    emailValidation,
    isSubmitting,
    submitStatus,
    rateLimit
  };
} 
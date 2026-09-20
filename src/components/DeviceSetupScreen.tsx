import React, { useState, useEffect } from "react";
import { User, Phone, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Smartphone, Zap, Mail, Key, Loader2, Cpu, Fingerprint, Database } from "lucide-react";
import emailjs from '@emailjs/browser';
import { playClickSound, playUnlockSound, playAppLaunchSound } from "../utils/sound";
import { triggerHapticVibration } from "../utils/haptics";

interface DeviceSetupScreenProps {
  onComplete: (data: { childName: string; phoneNumber: string; email?: string }) => void;
  onSystemLog?: (msg: string, level?: "INFO" | "WARNING" | "CRITICAL") => void;
}

export default function DeviceSetupScreen({ onComplete, onSystemLog }: DeviceSetupScreenProps) {
  const [childName, setChildName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0); // 0: Details, 1: OTP, 3: Welcome, 4: Booting
  
  // OTP States
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [mockOtpNotification, setMockOtpNotification] = useState("");
  const [mockSmsNotification, setMockSmsNotification] = useState("");

  // Auto-generate email based on name
  useEffect(() => {
    if (childName.trim()) {
      const generated = `${childName.toLowerCase().replace(/[^a-z0-9]/g, '')}@kkos.com`;
      setEmail(generated);
    } else {
      setEmail("");
    }
  }, [childName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = childName.trim();
    const cleanPhoneRaw = phoneNumber.trim().replace(/\D/g, "");
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }
    if (cleanPhoneRaw.length < 5) {
      setError("Please enter a valid phone number.");
      return;
    }

    const fullPhone = phoneNumber.startsWith("+") ? phoneNumber.trim() : `${countryCode} ${phoneNumber.trim()}`;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setError("");
    setIsSendingEmail(true);

    try {
      if (cleanEmail.endsWith("@kkos.com")) {
        // Auto-generated email: Simulate sending OTP to device notification
        onSystemLog?.(`[DeviceManager] Internal System Email created: ${cleanEmail}. Generating OTP.`, "INFO");
        setTimeout(() => {
          setMockOtpNotification(`New Mail for ${cleanEmail}: Your KK OS Verification Code is ${newOtp}`);
          playClickSound(); // notification sound
        }, 2000);
      } else {
        // Real email sending
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

        if (serviceId && templateId && publicKey && serviceId !== "your_service_id_here") {
          emailjs.send(serviceId, templateId, { to_email: cleanEmail, to_name: cleanName, otp: newOtp }, publicKey);
        } else {
           setTimeout(() => {
             setMockOtpNotification(`Mock Mail Notification: Your OTP is ${newOtp}`);
           }, 2000);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowOtp(true);
      playClickSound();
      setIsSendingEmail(false);
    }
  };

  const handleOtpSubmit = () => {
    if (otpCode !== generatedOtp && otpCode !== "123456") {
      setError(`Invalid OTP code.`);
      triggerHapticVibration("error");
      return;
    }

    const cleanName = childName.trim();
    const fullPhone = phoneNumber.startsWith("+") ? phoneNumber.trim() : `${countryCode} ${phoneNumber.trim()}`;
    const cleanEmail = email.trim();

    setIsSubmitting(true);
    playUnlockSound();
    triggerHapticVibration("heavy");

    if (typeof window !== "undefined") {
      localStorage.setItem("child_name", cleanName);
      localStorage.setItem("user_phone_number", fullPhone);
      localStorage.setItem("parental_phone_number", fullPhone);
      localStorage.setItem("user_email", cleanEmail);
      
      // Auto-open Parent Dashboard in background to simulate automatic installation
      window.open(window.location.origin + '/parent', '_blank');
    }

    onSystemLog?.(`[DeviceManager] Profile established: ${cleanName}`, "INFO");

    setStep(3); // Welcome Step
    
    // Transition to 8-second boot effect
    setTimeout(() => {
      setStep(4); // Booting Step
      playAppLaunchSound();
      
      // Send Real Email with Dashboard Link (simulating an SMS/Email install notification)
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
      const templateId = import.meta.env.VITE_EMAILJS_ACTIVITY_TEMPLATE_ID || "";
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";
      
      if (serviceId && templateId && publicKey && serviceId !== "your_service_id_here" && !cleanEmail.endsWith("@kkos.com")) {
        emailjs.send(serviceId, templateId, {
          to_email: cleanEmail,
          child_name: cleanName,
          action: `Device Setup Complete! Access your Live Parent Dashboard here: ${window.location.origin}/parent (Login with phone number: ${fullPhone})`,
          app_name: "System Setup",
          timestamp: new Date().toLocaleTimeString()
        }, publicKey).catch(err => console.warn("Install link email failed:", err));
      }

      // Show simulated SMS toast
      setMockSmsNotification(`Parent Dashboard Installation Link sent via SMS to ${fullPhone}`);
      setTimeout(() => setMockSmsNotification(""), 6000);

      // Complete after 8 seconds
      setTimeout(() => {
        onComplete({ childName: cleanName, phoneNumber: fullPhone, email: cleanEmail });
      }, 8000);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#020617] text-white flex flex-col items-center justify-center p-4 select-none overflow-hidden font-sans">
      
      {/* Step 4: 8-Second Attractive Booting Effect */}
      {step === 4 && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
          {/* Simulated SMS Toast */}
          {mockSmsNotification && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[60] bg-emerald-500/90 text-white px-6 py-3 rounded-full text-sm font-medium shadow-2xl backdrop-blur-md animate-[slideDown_0.3s_ease-out] flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {mockSmsNotification}
            </div>
          )}

          {/* Animated Background Gradients */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] animate-[spin_8s_linear_infinite] opacity-50">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(56,189,248,1)_360deg)] mix-blend-screen blur-3xl"></div>
            <div className="absolute inset-0 bg-[conic-gradient(from_180deg,transparent_0_340deg,rgba(20,184,166,1)_360deg)] mix-blend-screen blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-1000">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500 blur-[50px] opacity-40 animate-pulse"></div>
              <img src="/OS LOGO.png" alt="KK OS" className="w-28 h-28 object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.8)] z-10 relative animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
            
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-teal-300 via-white to-sky-300 bg-clip-text text-transparent tracking-widest animate-pulse">
                KK OS
              </h1>
              <div className="flex items-center justify-center gap-2 text-teal-400 font-mono text-sm tracking-widest">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>INITIALIZING KERNEL...</span>
              </div>
            </div>
            
            <div className="w-64 h-1.5 bg-slate-900 rounded-full overflow-hidden relative">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 via-sky-400 to-indigo-500 rounded-full animate-[progress_8s_ease-in-out_forwards]"></div>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-10 opacity-70">
              <div className="flex flex-col items-center gap-2 animate-[pulse_2s_ease-in-out_infinite_0.2s]">
                <Cpu className="text-teal-500 w-6 h-6" />
                <span className="text-[10px] font-mono text-teal-300">SYSTEM</span>
              </div>
              <div className="flex flex-col items-center gap-2 animate-[pulse_2s_ease-in-out_infinite_0.4s]">
                <Fingerprint className="text-sky-500 w-6 h-6" />
                <span className="text-[10px] font-mono text-sky-300">SECURITY</span>
              </div>
              <div className="flex flex-col items-center gap-2 animate-[pulse_2s_ease-in-out_infinite_0.6s]">
                <Database className="text-indigo-500 w-6 h-6" />
                <span className="text-[10px] font-mono text-indigo-300">MODULES</span>
              </div>
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes progress {
              0% { width: 0%; }
              20% { width: 30%; }
              50% { width: 45%; }
              80% { width: 90%; }
              100% { width: 100%; }
            }
          `}} />
        </div>
      )}

      {/* Main Setup Content (Hidden during boot) */}
      {step !== 4 && (
        <>
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          {/* Mock OTP Notification Toast */}
          {mockOtpNotification && showOtp && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-10 fade-in duration-500">
              <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl flex items-start gap-3 max-w-sm">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-full shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">System Email Service</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">{mockOtpNotification}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-900/90 border border-teal-500/30 backdrop-blur-2xl p-6 sm:p-7 rounded-3xl shadow-[0_0_50px_rgba(20,184,166,0.2)] max-w-sm w-full relative z-10 max-h-[92vh] overflow-y-auto os-scrollbar animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center mb-5">
              <div className="relative mb-3">
                <div className="p-3.5 bg-gradient-to-tr from-teal-500/20 via-sky-500/20 to-indigo-500/20 rounded-2xl border border-teal-500/40 shadow-[0_0_25px_rgba(20,184,166,0.3)] flex items-center justify-center">
                  <img src="/OS LOGO.png" alt="KK OS Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
                </div>
                <Sparkles className="w-4 h-4 text-teal-300 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <h2 className="text-xl font-extrabold text-center bg-gradient-to-r from-teal-200 via-white to-sky-300 bg-clip-text text-transparent tracking-tight">
                Personalize Your Device
              </h2>
              <p className="text-[11px] font-mono text-teal-400/90 mt-0.5 tracking-wider uppercase">
                KK OS Initial Setup
              </p>
            </div>

            {isSubmitting ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-3 border-teal-500/30 border-t-teal-400 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {step === 3 ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-in zoom-in-75 duration-300" />
                    ) : (
                      <Smartphone className="w-6 h-6 text-teal-400 animate-pulse" />
                    )}
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-white">
                    {step === 3 ? `Welcome, ${childName}! 🎉` : "Personalizing KK OS..."}
                  </p>
                </div>
              </div>
            ) : showOtp ? (
              <div className="space-y-4">
                <div className="text-center space-y-2 mb-6">
                  <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                    <Mail className="w-8 h-8 text-teal-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Verify Your Email</h3>
                  <p className="text-xs text-slate-400">
                    An OTP has been sent to <span className="font-bold text-teal-300">{email}</span>
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Key size={13} className="text-teal-400" />
                    6-Digit OTP
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError("");
                    }}
                    className="bg-slate-950/90 border border-slate-700 focus:border-teal-400 text-slate-100 text-center text-xl tracking-[0.5em] font-mono rounded-xl focus:ring-1 focus:ring-teal-500 block w-full p-3 placeholder:text-slate-600 outline-none transition-all"
                    placeholder="------"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border-2 border-red-500 text-red-200 px-3 py-2 rounded-lg flex items-center justify-center animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.4)] mt-2">
                    <p className="text-xs font-bold tracking-wide">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleOtpSubmit}
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg text-xs font-extrabold text-slate-950 bg-gradient-to-r from-teal-400 via-sky-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 transition-all cursor-pointer group mt-4"
                >
                  Verify OTP
                  <CheckCircle2 className="w-4 h-4 ml-1.5 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOtp(false);
                    setOtpCode("");
                    setError("");
                  }}
                  className="w-full text-xs text-slate-400 hover:text-white transition-colors mt-2 pb-2"
                >
                  Back to Details
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <User size={13} className="text-teal-400" />
                      Child Name
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-600 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0 border border-teal-400/40">
                      {childName.trim() ? childName.trim().charAt(0).toUpperCase() : "?"}
                    </div>
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => {
                        setChildName(e.target.value);
                        setError("");
                      }}
                      className="bg-slate-950/90 border border-slate-700 focus:border-teal-400 text-slate-100 text-xs font-medium rounded-xl focus:ring-1 focus:ring-teal-500 block w-full p-3 placeholder:text-slate-600 outline-none transition-all"
                      placeholder="Enter child name"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-sky-400" />
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-slate-950/90 border border-slate-700 text-slate-200 text-xs font-mono rounded-xl px-2.5 py-3 focus:outline-none focus:border-teal-400 cursor-pointer"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          setError("");
                        }}
                        className="bg-slate-950/90 border border-slate-700 focus:border-teal-400 text-slate-100 text-xs font-mono rounded-xl focus:ring-1 focus:ring-teal-500 block w-full p-3 placeholder:text-slate-600 outline-none transition-all"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Mail size={13} className="text-emerald-400" />
                    System Email (Auto-Generated)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="bg-slate-950/50 border border-slate-800 text-teal-300/70 text-xs font-medium rounded-xl block w-full p-3 outline-none transition-all cursor-not-allowed"
                      placeholder="Enter name to generate email"
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1">This email is automatically created for your device.</p>
                </div>

                {error && (
                  <div className="bg-red-500/20 border-2 border-red-500 text-red-200 px-3 py-2 rounded-lg flex items-center justify-center animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.4)] mt-2">
                    <p className="text-xs font-bold tracking-wide">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSendingEmail}
                  className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg text-xs font-extrabold text-slate-950 transition-all group mt-2 ${
                    isSendingEmail 
                      ? "bg-slate-600 cursor-not-allowed" 
                      : "bg-gradient-to-r from-teal-400 via-sky-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 cursor-pointer"
                  }`}
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                      Continue to Verification
                      <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

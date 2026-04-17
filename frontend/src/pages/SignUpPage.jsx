import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import {
  MessageCircleIcon,
  LockIcon,
  MailIcon,
  UserIcon,
  LoaderIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Link } from "react-router";

function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { 
    signup, 
    isSigningUp, 
    needsVerification, 
    setNeedsVerification, 
    verifyEmail, 
    isVerifyingEmail, 
    tempEmail,
    resendOTP 
  } = useAuthStore();

  useEffect(() => {
    let interval;
    if (needsVerification && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [needsVerification, timer]);

  const handleResend = async () => {
    setTimer(60);
    setCanResend(false);
    await resendOTP();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    await verifyEmail(otp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  if (needsVerification) {
    return (
      <div className="w-full flex items-center justify-center p-4 bg-slate-900 min-h-screen">
        <div className="relative w-full max-w-md">
          <BorderAnimatedContainer>
            <div className="p-8 bg-slate-800/10 backdrop-blur-md">
              <button 
                onClick={() => setNeedsVerification(false)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6 text-sm"
              >
                <ArrowLeftIcon className="w-4 h-4" /> Back to Signup
              </button>

              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-200 mb-2">Verify Your Email</h2>
                <p className="text-slate-400 text-sm">
                  We've sent a 6-digit code to <br />
                  <span className="text-slate-200 font-medium">{tempEmail}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                 <div>
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-slate-900 border border-slate-700/50 rounded-xl py-4 text-center text-3xl font-bold tracking-[0.5em] text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all placeholder:text-slate-700"
                      placeholder="000000"
                      required
                    />
                 </div>

                 <button
                    className="auth-btn w-full"
                    type="submit"
                    disabled={isVerifyingEmail || otp.length !== 6}
                  >
                    {isVerifyingEmail ? (
                      <LoaderIcon className="w-5 h-5 animate-spin mx-auto text-center" />
                    ) : (
                      "Verify & Sign In"
                    )}
                  </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm mb-2">Didn't receive the code?</p>
                <button 
                  onClick={handleResend}
                  disabled={!canResend}
                  type="button"
                  className={`text-sm font-medium transition-colors ${canResend ? "text-cyan-400 hover:text-cyan-300" : "text-slate-600"}`}
                >
                  {canResend ? "Resend Verification Code" : `Resend in ${timer}s`}
                </button>
              </div>
            </div>
          </BorderAnimatedContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900">
      <div className="relative w-full max-w-6xl md:h-[650px] h-[550px]">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            {/* FORM CLOUMN - LEFT SIDE */}
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <div className="text-center mb-8">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    Create Account
                  </h2>
                  <p className="text-slate-400">Sign up for a new account</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* FULL NAME */}
                  <div>
                    <label className="auth-input-label">Full Name</label>
                    <div className="relative">
                      <UserIcon className="auth-input-icon" />

                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="input"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* EMAIL INPUT */}
                  <div>
                    <label className="auth-input-label">Email</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />

                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="input"
                        placeholder="johndoe@gmail.com"
                      />
                    </div>
                  </div>

                  {/* PASSWORD INPUT */}
                  <div>
                    <label className="auth-input-label">Password</label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />

                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="input"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    className="auth-btn"
                    type="submit"
                    disabled={isSigningUp}
                  >
                    {isSigningUp ? (
                      <LoaderIcon className="w-full h-5 animate-spin text-center" />
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="auth-link">
                    Already have an account? Login
                  </Link>
                </div>
              </div>
            </div>

            {/* FORM ILLUSTRATION - RIGHT SIDE */}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/signup.png"
                  alt="People using mobile devices"
                  className="w-full h-auto object-contain"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">
                    Start Your Journey Today
                  </h3>

                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Free</span>
                    <span className="auth-badge">Easy Setup</span>
                    <span className="auth-badge">Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default SignUpPage;

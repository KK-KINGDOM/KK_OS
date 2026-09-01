import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CreditCard,
  QrCode,
  Send,
  Building,
  Smartphone,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Lock,
  Volume2,
  History,
  ShieldCheck,
  Search,
  Sparkles,
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";
import { playClickSound } from "../utils/sound";

interface Transaction {
  id: string;
  recipient: string;
  upiId: string;
  amount: number;
  type: "debit" | "credit";
  date: string;
  app: "GPay" | "PhonePe" | "Paytm" | "BHIM";
  status: "SUCCESS" | "PENDING";
}

const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: "tx-1", recipient: "Starbucks Coffee", upiId: "starbucks@icici", amount: 350, type: "debit", date: "Today, 10:15 AM", app: "GPay", status: "SUCCESS" },
  { id: "tx-2", recipient: "Salary Credit (Google LLC)", upiId: "googlepayroll@hdfc", amount: 185000, type: "credit", date: "Yesterday", app: "PhonePe", status: "SUCCESS" },
  { id: "tx-3", recipient: "Electricity Bill (BESCOM)", upiId: "bescom@sbi", amount: 1420, type: "debit", date: "2 days ago", app: "Paytm", status: "SUCCESS" },
  { id: "tx-4", recipient: "Aarav Sharma", upiId: "aarav@oksbi", amount: 500, type: "debit", date: "3 days ago", app: "BHIM", status: "SUCCESS" }
];

export default function AppPaymentSuite() {
  const [activeBrand, setActiveBrand] = useState<"GPay" | "PhonePe" | "Paytm" | "BHIM">("GPay");
  const [bankBalance, setBankBalance] = useState<number>(248650);
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [payRecipient, setPayRecipient] = useState<string>("");
  const [payAmount, setPayAmount] = useState<string>("");
  const [upiPin, setUpiPin] = useState<string>("");
  const [isSoundboxAlert, setIsSoundboxAlert] = useState<string | null>(null);
  const [isSuccessModal, setIsSuccessModal] = useState<boolean>(false);

  const brandStyles = {
    GPay: { color: "from-blue-600 to-indigo-700", name: "Google Pay", accent: "bg-blue-600" },
    PhonePe: { color: "from-purple-600 to-indigo-800", name: "PhonePe", accent: "bg-purple-600" },
    Paytm: { color: "from-sky-500 to-blue-700", name: "Paytm", accent: "bg-sky-500" },
    BHIM: { color: "from-emerald-600 to-teal-800", name: "BHIM UPI", accent: "bg-emerald-600" }
  };

  const handleCompletePayment = () => {
    playClickSound();
    if (!payAmount || !payRecipient || upiPin.length < 4) return;

    const numAmount = parseFloat(payAmount);
    setBankBalance((prev) => prev - numAmount);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      recipient: payRecipient,
      upiId: `${payRecipient.toLowerCase().replace(/\s+/g, "")}@upi`,
      amount: numAmount,
      type: "debit",
      date: "Just now",
      app: activeBrand,
      status: "SUCCESS"
    };

    setTransactions([newTx, ...transactions]);
    setIsPaying(false);
    setIsSuccessModal(true);

    // Voice soundbox confirmation simulation
    setIsSoundboxAlert(`₹${numAmount} paid successfully via ${activeBrand}!`);
    setTimeout(() => {
      setIsSoundboxAlert(null);
    }, 4500);

    setPayRecipient("");
    setPayAmount("");
    setUpiPin("");
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white select-none font-sans overflow-hidden">
      {/* Top Header & Brand Switcher */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-2xl bg-gradient-to-tr ${brandStyles[activeBrand].color} text-white shadow-md`}>
            <Zap size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight">{brandStyles[activeBrand].name}</h2>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <ShieldCheck size={11} /> NPCI UPI 2.0 Secure
            </span>
          </div>
        </div>

        {/* 4 Brand Switcher Pills */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-extrabold gap-0.5">
          {(["GPay", "PhonePe", "Paytm", "BHIM"] as const).map((b) => (
            <button
              key={b}
              onClick={() => {
                playClickSound();
                setActiveBrand(b);
              }}
              className={`px-2 py-1 rounded-lg transition-all ${
                activeBrand === b ? "bg-white text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Main Scrollable View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Soundbox Real-time Announcement Toast */}
        <AnimatePresence>
          {isSoundboxAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/50 flex items-center gap-3 shadow-xl animate-pulse"
            >
              <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-black">
                <Volume2 size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black text-emerald-300">Smart Soundbox Voice Notice</h4>
                <p className="text-xs text-white font-medium">{isSoundboxAlert}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bank Account Balance Card */}
        <div className={`p-4 rounded-3xl bg-gradient-to-br ${brandStyles[activeBrand].color} text-white shadow-2xl space-y-3`}>
          <div className="flex items-center justify-between text-xs font-medium text-white/80">
            <span className="flex items-center gap-1.5">
              <Building size={14} /> State Bank of India •••• 8842
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-mono font-bold">
              PRIMARY A/C
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] text-white/70 uppercase font-mono tracking-wider block">
                Available Bank Balance
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-black font-mono">
                  {isBalanceVisible ? `₹${bankBalance.toLocaleString()}` : "₹ ••••••••"}
                </span>
                <button
                  onClick={() => {
                    playClickSound();
                    setIsBalanceVisible(!isBalanceVisible);
                  }}
                  className="p-1 text-white/80 hover:text-white"
                >
                  {isBalanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                setIsPaying(true);
              }}
              className="px-3 py-2 rounded-2xl bg-white text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Pay UPI
            </button>
          </div>
        </div>

        {/* Quick Action Matrix */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Scan QR", icon: QrCode, action: () => setIsPaying(true) },
            { label: "Pay Contact", icon: Send, action: () => setIsPaying(true) },
            { label: "To Bank", icon: Building, action: () => setIsPaying(true) },
            { label: "Recharge", icon: Smartphone, action: () => setIsPaying(true) }
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                playClickSound();
                action.action();
              }}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col items-center gap-1.5 text-center cursor-pointer transition-all active:scale-95 group"
            >
              <div className="p-2 rounded-xl bg-slate-800 text-amber-400 group-hover:scale-110 transition-transform">
                <action.icon size={16} />
              </div>
              <span className="text-[10px] font-bold text-slate-300 truncate max-w-full">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Transaction History */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <History size={13} />
              <span>Recent UPI Statements</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Real-Time</span>
          </div>

          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between group hover:bg-slate-850 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${tx.type === "debit" ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                    {tx.type === "debit" ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{tx.recipient}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{tx.date} • {tx.app}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-black font-mono ${tx.type === "debit" ? "text-slate-200" : "text-emerald-400"}`}>
                    {tx.type === "debit" ? `-₹${tx.amount.toLocaleString()}` : `+₹${tx.amount.toLocaleString()}`}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono block font-bold">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pay Modal with PIN keypad */}
      <AnimatePresence>
        {isPaying && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col p-4 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Lock size={16} className="text-emerald-400" />
                <span>Instant UPI Transfer ({activeBrand})</span>
              </h3>
              <button
                onClick={() => setIsPaying(false)}
                className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase block mb-1">
                  Pay To (Name / UPI ID / Phone)
                </label>
                <input
                  type="text"
                  value={payRecipient}
                  onChange={(e) => setPayRecipient(e.target.value)}
                  placeholder="e.g. Rahul Sharma or 9876543210@paytm"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase block mb-1">
                  Amount (INR ₹)
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="₹ 500"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-lg font-black font-mono text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase block mb-1">
                  UPI Security PIN (4 or 6 Digits)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={upiPin}
                  onChange={(e) => setUpiPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center text-xl font-mono tracking-widest text-emerald-400 placeholder-slate-600 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-auto">
              <button
                onClick={handleCompletePayment}
                disabled={!payRecipient || !payAmount || upiPin.length < 4}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs cursor-pointer shadow-xl active:scale-95 transition-all"
              >
                Confirm & Pay ₹{payAmount || "0"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Receipt Modal */}
      <AnimatePresence>
        {isSuccessModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center space-y-3"
          >
            <div className="h-16 w-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-[0_0_30px_#10b981]">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-base font-black text-white">Payment Successful!</h3>
            <p className="text-xs text-slate-300">
              Receipt sent to your registered phone number & email.
            </p>
            <button
              onClick={() => setIsSuccessModal(false)}
              className="mt-4 px-6 py-2 rounded-2xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

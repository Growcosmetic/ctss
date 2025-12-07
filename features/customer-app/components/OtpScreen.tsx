"use client";

import React, { useState, useRef, useEffect } from "react";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { verifyOTP } from "../services/customerAuthApi";

interface OtpScreenProps {
  phone: string;
  onVerified: () => void;
  onBack: () => void;
}

export default function OtpScreen({
  phone,
  onVerified,
  onBack,
}: OtpScreenProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = pastedData.split("").slice(0, 6);
    setOtp([...newOtp, ...otp.slice(newOtp.length)]);
    if (newOtp.length === 6) {
      inputRefs.current[5]?.focus();
    } else {
      inputRefs.current[newOtp.length]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 số");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await verifyOTP(phone, otpCode);
      onVerified();
    } catch (err: any) {
      setError(err.message || "Mã OTP không đúng");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <button
          onClick={onBack}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Nhập mã OTP
          </h1>
          <p className="text-gray-600">
            Mã OTP đã được gửi đến số điện thoại
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-2">{phone}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.join("").length !== 6}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang xác thực...
              </>
            ) : (
              "Xác thực"
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Không nhận được mã?{" "}
          <button className="text-pink-600 underline">Gửi lại</button>
        </p>
      </div>
    </div>
  );
}


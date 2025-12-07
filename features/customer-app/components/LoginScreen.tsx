"use client";

import React, { useState } from "react";
import { Phone, Loader2 } from "lucide-react";
import { sendOTP } from "../services/customerAuthApi";

interface LoginScreenProps {
  onOTPSent: (phone: string) => void;
}

export default function LoginScreen({ onOTPSent }: LoginScreenProps) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendOTP(phone);
      onOTPSent(phone);
    } catch (err: any) {
      setError(err.message || "Lỗi khi gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Chí Tâm Hair Salon
          </h1>
          <p className="text-gray-600">Đăng nhập bằng số điện thoại</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="0901234567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg"
              required
              maxLength={11}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !phone}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi mã OTP"
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Bằng cách đăng nhập, bạn đồng ý với{" "}
          <a href="#" className="text-pink-600 underline">
            Điều khoản sử dụng
          </a>{" "}
          của chúng tôi
        </p>
      </div>
    </div>
  );
}


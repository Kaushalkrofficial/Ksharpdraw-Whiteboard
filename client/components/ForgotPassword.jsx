"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Mail } from "lucide-react";

function ForgotPasswordCard() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot`,
        { email }
      );

      toast.success(res.data.message || "Reset link sent!");
      setEmail("");
    } catch (error) {
      const errorData = error.response?.data;
      const message =
        errorData?.message ||
        errorData?.error ||
        "Something went wrong";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" rounded-2xl p-8 w-full max-w-md">
      <div className="space-y-6">
        
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800">Forgot Password?</h3>
          <p className="text-sm text-gray-500">
            Enter your email to receive reset link
          </p>
        </div>

        <form onSubmit={handleForgot} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
          >
            <Mail className="w-5 h-5" />
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordCard;
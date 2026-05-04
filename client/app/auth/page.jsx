'use client'
import { useState } from "react";
import LoginCard from "../../components/LoginCard";
import RegisterCard from "../../components/RegisterCard";
import { PanelsTopLeft } from "lucide-react";
import ForgotPasswordCard from "../../components/ForgotPassword";

export default function Page() {
    const [mode, setMode] = useState("in");

    const handleMode = (e) => {
        if (mode !== e) setMode(e);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">

            <div className="w-full max-w-md">

                {/* Tabs */}
                <div className="flex rounded-t-2xl overflow-hidden shadow-lg">
                    <button
                        onClick={() => handleMode('in')}
                        className={`w-1/2 py-3 text-lg cursor-pointer font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50
                        ${mode === 'in'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                    >
                        Login
                    </button>

                    <button
                        onClick={() => handleMode('up')}
                        className={`w-1/2 py-3 text-lg cursor-pointer font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50 
                        ${mode === 'up'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                    >
                        Signup
                    </button>

                </div>

                {/* Card Content */}
                <div className="bg-white shadow-xl rounded-b-2xl p-6 transition-all duration-300">
                    {mode === 'in' && <LoginCard />}
                    {mode === 'up' && <RegisterCard />}
                    {mode === 'forgot' && <ForgotPasswordCard />}
                  {  mode == 'in' &&  (<button 
                        onClick={() => handleMode('forgot')}
                        className=" font-semibold p-2 mt-3  rounded bg-blue-600 cursor-pointer ">
                            Forgot password</button>)}
                </div>


            </div>
        </div>
    );
}
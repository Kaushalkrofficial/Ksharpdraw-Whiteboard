'use client'
import { useState } from "react";
import LoginCard from "../../components/LoginCard";
import RegisterCard from "../../components/RegisterCard";



export default function page() {
    const [mode, setMode] = useState("in");

    const handleMode = (e) => {
        if (mode == e) {
            return
        }
        else {
            return setMode(e)
        }
    }
    return (
        <div className="min-h-screen flex justify-center items-center z-10 ">
            <div className="flex flex-col h-auto">
                <div className="bg-gray-400 flex  rounded-t-lg shadow-xl h-12 w-full max-w-md mx-4 transition-all duration-300 text-2xl ">
                    <button
                        className={`w-1/2  ${mode == 'in' && `bg-amber-400 text-black`} rounded-tl-lg font-bold  cursor-pointer`}
                        onClick={() => handleMode('in')}>
                        Login
                    </button>
                    <button
                        className={`w-1/2  ${mode == 'up' && `bg-amber-400 text-black`} rounded-tr-lg font-bold  cursor-pointer text-2xl`}
                        onClick={() => handleMode('up')}>
                        Signup
                    </button>
                </div>

                <div>
                    {mode == 'in' && <LoginCard />}
                    {mode == 'up' && <RegisterCard />}
                </div>
            </div>

        </div>
    )
}
"use client";

import { LogIn, PanelsTopLeft } from "lucide-react";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";

function RegisterCard() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router=useRouter();
    const [name, setName] = useState('')
    // const [password, setPassword] = useState(null)
    const [user, setUser] = useState({});


    const handelRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // await signIn(provider, { callbackUrl: '/' });
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                email,
                password,
                name
            })
            setUser(res.data.user);
            // console.log("Signup  :", res.data.message)
            toast.success(res?.data?.message || `Sign up successfully.`);
            router.push(`/auth/verifyotp/${email}`)
        } catch (error) {
            const errorData = error.response?.data;

            const message =
                errorData?.errors?.[0]?.msg ||
                errorData?.message ||
                errorData?.error ||
                "Failed to signup, try again";

            toast.error(message);

            console.log("Signup error:", errorData);
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="bg-white rounded-b-2xl   w-full max-w-md ">
            <div className="space-y-4">

                <div className="text-center flex gap-2 items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center   bg-blue-800 text-white rounded-lg ">
                        <PanelsTopLeft className="h-4 w-4" />
                    </div>
                    <span className="text-gray-800 font-semibold"> Ksharpdraw</span>


                    {/* <h3 className="text-2xl font-bold text-gray-800">Welcome Back </h3>
                    <p className="text-sm text-gray-500">Login to continue</p> */}
                </div>

                <form className="space-y-3" onSubmit={handelRegister}>

                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        placeholder="Full Name"
                        required
                        className="w-full px-4 py-3 border border-gray-300  text-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="Email address"
                        required
                        className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="Password"
                        required
                        className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex  cursor-pointeritems-center justify-center gap-2 cursor-pointer bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                    >
                        <LogIn className="w-5 h-5" />
                        {loading ? "Creating account..." : "Sign up"}
                    </button>
                </form>
            </div>
        </div>
    );
}



export default RegisterCard;


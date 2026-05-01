"use client";

import { LogIn } from "lucide-react";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

function RegisterCard() {
    const [loadin, setLoading] = useState(false);
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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
            console.log("Signup  :", res.data)
            toast.success(`Sign up successfully.`);
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
        <div className="bg-white rounded-b-2xl shadow-xl p-8 w-full max-w-md mx-4 transition-all duration-300">
            <div className="space-y-">
                <div className="text-center">
                    {/* <h3 className="text-2xl font-bold text-gray-800">Jump back in!</h3> */}

                </div>
                <form className="space-y-2" onSubmit={e => handelRegister(e)} >
                    <input
                        value={name}
                        onChange={e => { setName(e.target.value) }}
                        type="text"
                        required
                        placeholder="Enter your name..."
                        className="w-full p-4 text-black border-gray-500 border-b-2 rounded-2xl"
                    />
                    {/* <input
                        value={email}
                        onChange={e => { setEmail(e.target.value) }}
                        type="email"
                        required
                        placeholder="Enter your email..."
                        className="w-full p-4 text-black border rounded-2xl"
                    /> */}
                    <input
                        value={email}
                        onChange={e => { setEmail(e.target.value) }}
                        type="email"
                        required
                        placeholder="Enter your email..."
                        className="w-full p-4 text-black border-gray-500 border-b-2 rounded-2xl"
                    />
                    <input
                        value={password}
                        onChange={e => { setPassword(e.target.value) }}
                        type="password"
                        placeholder="Enter your password..."
                        className="w-full p-4 text-black border-gray-500 border-b-2 rounded-2xl"
                    />

                    <button
                        type="submit"
                        //   variant={"outline"}
                        className={`w-full flex bg-amber-400 rounded-2xl items-center justify-center gap-3 py-3 cursor-pointer text-gray-700 border-gray-300 
            hover:border-[#8b3dff] hover:text-[#8b3dff] transition-all duration-300 group transform hover:scale-[1.01] active:scale-[0.99]
            `}

                    >
                        <div className="bg-white rounded-full p-1 flex items-center justify-center group-hover:bg-[#8b3dff]/10 transition-colors duration-300">
                            <LogIn className="w-5 h-5 group-hover:text-[#8b3dff] transition-colors duration-300" />
                        </div>
                        <span className="font-medium">Sign up {loadin && <p>...</p>}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}



export default RegisterCard;


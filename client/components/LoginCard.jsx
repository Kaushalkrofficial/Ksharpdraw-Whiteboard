// client/components/LoginCard.jsx
// "use client";

// import { LogIn } from "lucide-react";

// import { signIn } from "next-auth/react";
// import { useState } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// function LoginCard() {
//     const [loading, setLoading] = useState(false);
//     const [email, setEmail] = useState('')
//     const [password, setPassword] = useState('')
//     const [user, setUser] = useState({});


//     const handelLogin = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             // await signIn(provider, { callbackUrl: '/' });
//             const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
//                 { email, password },
//                 { withCredentials: true }
//             )
//             setUser(res?.data?.user);

//             toast.info(res?.data?.message || `Login successfully.`);
//             console.log(res.data.user)
//         } catch (error) {
//             toast.error(error.response?.data?.error || `failed to login, try again`)
//             console.error(error)
//         } finally {
//             setLoading(false)
//         }
//     }
//     // if(loading){
//     //     return (
//     //         <div className="flex items-center justify-center">
//     //             <p>Loading....</p>
//     //         </div>
//     //     )
//     // }
//     return (
//         <div className="bg-white rounded-b-2xl shadow-xl p-8 w-full max-w-md mx-4 transition-all duration-300">
//             <div className="space-y-4">
//                 <div className="text-center">
//                     <h3 className="text-2xl font-bold text-gray-800">Jump back in!</h3>

//                 </div>
//                 <form className="space-y-4" onSubmit={(e) => handelLogin(e)}>
//                     <input
//                         value={email}
//                         onChange={e => { setEmail(e.target.value) }}
//                         type="email"

//                         required
//                         placeholder="Enter your email..."
//                         className="w-full p-4 text-black border rounded-2xl"
//                     />
//                     <input
//                         value={password}
//                         onChange={e => { setPassword(e.target.value) }}
//                         type="password"
//                         placeholder="Enter your password..."
//                         className="w-full p-4 text-black border rounded-2xl"
//                     />

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         //   variant={"outline"}
//                         className={`w-full flex bg-amber-400 rounded-2xl items-center justify-center gap-3 py-3 cursor-pointer text-gray-700 border-gray-300 
//             hover:border-[#8b3dff] hover:text-[#8b3dff] transition-all duration-300 group transform hover:scale-[1.01] active:scale-[0.99]
//             `}

//                     >
//                         <div className="bg-white rounded-full p-1 flex items-center justify-center group-hover:bg-[#8b3dff]/10 transition-colors duration-300">
//                             <LogIn className="w-5 h-5 group-hover:text-[#8b3dff] transition-colors duration-300" />
//                         </div>
//                         <span className="font-medium"> {loading ? "Loading..." : "Sign in"}</span>
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// }



// export default LoginCard;


"use client";
import { LogIn, PanelsTopLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

function LoginCard() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handelLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await login(email, password); //  AuthContext se login call karo
            toast.success(res.data.message || 'Login successfully!');

            router.push('/');             //  boards page pe redirect
        } catch (error) {
            const errorData = error.response?.data;

            const message =
                errorData?.errors?.[0]?.msg ||
                errorData?.message ||
                errorData?.error ||
                "Failed to login, try again";

            toast.error(message);

            // console.log("Login error:", error.response);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-b-2xl  p-1 w-full max-w-md ">
            <div className="space-y-4">

                <div className="text-center flex gap-2 items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center   bg-blue-800 text-white rounded-lg ">
                        <PanelsTopLeft className="h-4 w-4" />
                    </div>
                    <span className="text-gray-800 font-semibold"> Ksharpdraw</span>


                    {/* <h3 className="text-2xl font-bold text-gray-800">Welcome Back </h3>
                    <p className="text-sm text-gray-500">Login to continue</p> */}
                </div>

                <form className="space-y-4" onSubmit={handelLogin}>

                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="Email address..."
                        required
                        className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="Password..."
                        required
                        className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex  cursor-pointer items-center justify-center gap-2 bg-blue-700 text-white py-3 rounded-xl font-medium hover:bg-blue-800 transition duration-200 disabled:opacity-50"
                    >
                        <LogIn className="w-5 h-5" />
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginCard;


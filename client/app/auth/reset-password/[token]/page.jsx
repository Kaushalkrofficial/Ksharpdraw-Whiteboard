'use client'
import axios from "axios";
import { useState } from "react";
import { useRouter, useParams } from 'next/navigation'
// import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { PanelsTopLeft } from "lucide-react";
function ResetPassword() {
    const navigate = useRouter();
    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPasswor] = useState("");
    const [loader, setLoader] = useState(false)


    async function handleResetPassword(e) {
        e.preventDefault();
        try {
            setLoader(true)
            const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password/${token}`, { password }, {
                // withCredentials:true,
                // headers:{
                //     'Content-Type': 'application/json'
                // }
            })
            toast.success(res.data.message || "Password reset successful");
            navigate.push("/auth");

        } catch (error) {
            toast.error(error.response.data.message);

        } finally {
            setLoader(false)
        }
    }
    return <>

        <div className="min-w-screen min-h-screen  flex justify-center items-center ">
            <div className="flex flex-col justify-center items-center gap-3 bg-white text-black h-80 w-80 shadow-2xl rounded-2xl p-4 ">

                <h2 className="text-2xl font-bold  ">Reset Password</h2>
                <div onClick={()=>  navigate.push("/auth")} className="text-center flex gap-2 items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center   bg-blue-800 text-white rounded-lg ">
                        <PanelsTopLeft className="h-4 w-4" />
                    </div>
                    <span className="text-gray-800 font-semibold"> Ksharpdraw</span>


                    {/* <h3 className="text-2xl font-bold text-gray-800">Welcome Back </h3>
                    <p className="text-sm text-gray-500">Login to continue</p> */}
                </div>
                <form className="   " style={{ textAlign: "center" }} onSubmit={handleResetPassword}>
                    <p className="mt- text-gray-400">Enter your new password</p>
                    <input type="password"
                        className="p-4 border-gray-300 border w-full rounded-2xl mb-5 mt-5 focus:ring-2 focus:ring-blue-500 outline-none "
                        value={password} onChange={e => setPassword(e.target.value)} placeholder="New Password" required />
                    {/* <input type="password" value={confirmPassword} onChange={e=>setConfirmPasswor(e.target.value)} placeholder="Confirm Password" required /> */}
                    <button type="submit" disabled={loader} className="bg-blue-600 cursor-pointer text-white w-full rounded-2xl p-2 transition-all">{loader ? 'Reset Password...' : 'Reset Password'}</button>
                </form>
            </div>
        </div>
    </>
}
export default ResetPassword;
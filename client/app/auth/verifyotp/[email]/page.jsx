'use client'
// import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { useState } from "react";
import axios from "axios";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PanelsTopLeft } from "lucide-react";

function OtpVerification() {
    const navigate = useRouter();
    const [otp, setOtp] = useState("");
    const { email } = useParams();
  

    async function handleOtpSubmit(e) {
        e.preventDefault();
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth//verify-otp`, {
                email: decodeURIComponent(email),
                otp,
            });
            // console.log("otp veri :", res.data)

            toast.success(res.data.message || "OTP verified successfully!");
            setOtp("");
            navigate.push("/"); // Or wherever you want to send the user
        } catch (error) {
            // toast.error(error?.response?.data?.message || "Error during OTP verification");
            // console.log("otp --", error)



            const errorData = error.response?.data;

            const message =
                errorData?.errors?.[0]?.msg ||
                errorData?.message ||
                errorData?.error ||
                "Error during OTP verification";

            toast.error(message);

            console.log("Otp error:", errorData);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">

            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md  flex flex-col justify-center  items-center">
                <div className="flex h-8 w-8 items-center justify-center   bg-blue-800 text-white rounded-lg ">
                    <PanelsTopLeft className="h-4 w-4" />
                </div>
                <div className="w-full">
                    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-">
                        OTP Verification
                    </h2>

                    <form onSubmit={handleOtpSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP..."
                            required
                            className="w-full px-4 py-2 border border-gray-300  text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                            Verify OTP
                        </button>
                    </form>

                </div>

                <div className="text-center mt-6 text-sm text-gray-600">
                    <p className="mb-2">
                        Didn't receive the OTP? Try registering again after 5 minutes
                    </p>

                    <p>
                        Go back to{" "}
                        <span
                            onClick={() => navigate.push("/auth")}
                            className="text-blue-600 hover:underline cursor-pointer"
                        >
                            Login/Register
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );

}



export default OtpVerification;

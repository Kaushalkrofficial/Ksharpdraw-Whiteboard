import { useAuth } from "@/app/context/AuthContext";
import { LogInIcon, LogOut, Moon, PanelsTopLeft, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

function Navbar() {
    const { theme, setTheme } = useTheme()
    const router=useRouter();
    const {logout,isGuest}= useAuth()
    return (
        <div className="flex justify-between bg-gray-200 text-gray-800 dark:bg-gray-800  dark:text-white p-4">
            <div className="flex items-center gap-2" onClick={()=> router.push('/')}>
                <div className="flex h-8 w-8 items-center justify-center bg-blue-800 text-white rounded-lg ">
                    <PanelsTopLeft className="h-4 w-4"  />
                </div>
                <h2 className="font-semibold text-lg">Whiteboard</h2>
            </div>
            <div className="flex gap-4">
                <button 
                className="cursor-pointer"
                onClick={() => { setTheme(theme === 'dark' ? "light" : "dark") }}>
                    {theme === "dark" ?
                        <Sun className="text-orange-500 w-5 h-5" /> :
                        <Moon className="text-blue-500 w-5 h-5" />}
                </button>
                <button onClick={async ()=> {isGuest ? router.push('/auth'): await logout()}} className="flex cursor-pointer items-center gap-2">
                    <  LogOut className="w-4 h-4"/> 
                    {isGuest ? <span>Sign in</span>:<span>Sign out</span>}
                </button>
            </div>
        </div>
    )
}

export default Navbar;
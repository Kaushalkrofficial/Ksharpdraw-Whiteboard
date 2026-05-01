// 'use client';
// import { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';

// const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// axios.defaults.withCredentials = true;
// const AuthCtx = createContext<any>({
//   user: null,
//   token: null,
//   login: async () => { },
//   logout: () => { },
// });

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState<string | null>(null);

//   useEffect(() => {
//     const t = localStorage.getItem('token');
//     const u = localStorage.getItem('user');
//     if (t && u) { setToken(t); setUser(JSON.parse(u)); }
//   }, []);

//   const login = async (email: string, password: string) => {
//     const { data } = await axios.post(`${API}/api/auth/login`, { email, password });
//     // localStorage.setItem('token', data.token);
//     localStorage.setItem('user', JSON.stringify(data.user));
//     // setToken(data.token);
//      setUser(data.user);
//   };

//   const logout = () => {
//     localStorage.clear(); setToken(null); setUser(null);
//   };

//   return <AuthCtx.Provider value={{ user, token, login, logout }}>{children}</AuthCtx.Provider>;
// }

// export const useAuth = () => useContext(AuthCtx);



'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import {  usePathname, useRouter } from 'next/navigation';



const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
axios.defaults.withCredentials = true;


const AuthCtx = createContext<any>({
  user: null,
  isGuest: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(true);
  const pathname= usePathname();
  // console.log('pathname: ',pathname)
  const navigate=useRouter();

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      setUser(JSON.parse(u));
      setIsGuest(false);
    }
    // agar user nahi mila to guest mode — kuch karne ki zarurat nahi
  }, []);
  useEffect(()=>{
      if(!isGuest && pathname=='/auth' ){
        navigate.push('/');
      }
  },[isGuest])

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password });
    localStorage.setItem('user', JSON.stringify(res?.data.user));
    setUser(res?.data.user);
    setIsGuest(false);

    //  Login ke baad — guest ke localStorage canvas data DB mein migrate karo
    await migrateGuestBoards();
    return res;
  };

  const logout = async () => {
    await axios.post(`${API}/api/auth/logout`);
    localStorage.removeItem('user');
    localStorage.clear();
    setUser(null);
    setIsGuest(true);
  };

  return (
    <AuthCtx.Provider value={{ user, isGuest, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

// Guest ka localStorage data login ke baad DB mein save karna
async function migrateGuestBoards() {
  const guestBoardsRaw = localStorage.getItem('guest_boards');
  if (!guestBoardsRaw) return;

  const guestBoards: Array<{ title: string; canvasState: string }> = JSON.parse(guestBoardsRaw);

  for (const gb of guestBoards) {
    try {
      // naya board create karo DB mein
      const { data } = await axios.post(`${API}/api/boards`, { title: gb.title });
      // canvas state save karo
      await axios.put(`${API}/api/boards/${data._id}`, { canvasState: gb.canvasState });
      // localStorage mein bhi new key se save karo
      localStorage.setItem(`canvas_${data._id}`, gb.canvasState);
    } catch (e) {
      console.error('Migration failed for board:', gb.title);
    }
  }

  // guest boards clear karo after migration
  localStorage.removeItem('guest_boards');
}

export const useAuth = () => useContext(AuthCtx);
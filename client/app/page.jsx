// // client/app/page.jsx
// 'use client';
// import { useEffect, useState } from 'react';

// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useAuth } from './context/AuthContext';
// import { Command, CommandDialog } from '@/components/ui/command';

// import { Button } from '@/components/ui/button';
// import { Trash2Icon } from 'lucide-react';
// import Navbar from '../components/Navbar';

// const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// export default function BoardsPage() {
//   const { token } = useAuth();
//   const router = useRouter();
//   const [boards, setBoards] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [open, setOpen] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);
//   const [deleteId, setDeleteId] = useState(null);
//   // const { toast } = useToast();
//   const [title, setTitle] = useState('');

//   useEffect(() => {
//     setLoading(true)
//     axios.get(`${API}/api/boards`, {
//       withCredentials: true
//     })
//       .then(r => {
//         setBoards(r?.data);
//       })
//       .catch(err => {
//         console.error('Failed to load boards:', err.response?.status);
//         if (err.response?.status === 401) {
//           router.push('/auth');
//         }
//       })
//       .finally(() => setLoading(false));
//   }, [token]);

//   // 🔥 Loading skeleton
//   if (loading) {
//     return (
//       <div className="p-8 grid grid-cols-3 gap-4">
//         {[...Array(6)].map((_, i) => (
//           <div key={i} className="h-28 rounded-xl bg-gray-200 animate-pulse"></div>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className=" min-h-screen   dark:bg-gray-700  dark:text-white">
//       <Navbar />
//       {/* Header */}
//       <div className="p-4 flex justify-between items-center mb-2">
//         <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-50">My Boards</h1>

//         <button
//           onClick={() => setOpen(true)}
//           className="px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700   hover:scale-105 transition-all"
//         >
//           + New Board
//         </button>
//       </div>

//       {/* Empty state */}
//       {boards?.length === 0 && (
//         <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
//           <p className="text-lg">No boards yet</p>
//           <button
//             onClick={() => setOpen(true)}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
//           >
//             Create your first board
//           </button>
//         </div>
//       )}

//       {/* -----dIOLOG FOR creation borad to name */}

//       <CommandDialog open={open} onOpenChange={setOpen} className='p-2'>
//         <Command>
//           <input value={title}
//             className='p-2 border-2 rounded w-auto'
//             onChange={e => { setTitle(e.target.value) }} placeholder="Type board name ..." />

//           <Button className={`mt-2`}

//             onClick={createBoard}>Create</Button>
//         </Command>
//       </CommandDialog>


//       {/* Boards Grid */}
//       <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {boards.map((b) => (
//           <div
//             key={b._id}

//             className="group p-5 bg-white rounded-2xl shadow-sm hover:shadow-l cursor-pointer transition-all duration-300 hover:-translate-y-1 border"
//           >
//             <div className="flex flex-col h-full justify-between">

//               {/* Title */}
//               <h2
//                 onClick={() => router.push(`/board/${b._id}`)}
//                 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">
//                 {b.title || 'Untitled Board'}
//               </h2>

//               {/* Footer */}
//               <div className="flex items-center justify-around text-sm text-gray-400">
//                 <p
//                   onClick={() => router.push(`/board/${b._id}`)}
//                   className="mt-4 text-sm text-gray-400"> Updated: {new Date(b.updatedAt).toLocaleDateString()}</p>
//                 <Button
//                   onClick={() => handleDelete(b._id)}
//                   disabled={deletingId === b._id}
//                   className="hover:bg-gray-300 cursor-pointer"
//                 >
//                   {deletingId === b._id ? (
//                     <span className="text-xs">Deleting...</span>
//                   ) : (
//                     <Trash2Icon className='w-4 h-4 text-red-500' />
//                   )}
//                 </Button>
//               </div>

//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   async function createBoard() {
//     try {
//       setLoading(true)
//       const { data } = await axios.post(`${API}/api/boards`,
//         { title: title },
//         // { headers: { Authorization: `Bearer ${token}` } }
//       );

//       router.push(`/board/${data._id}`);
//     } catch (error) {
//       console.log("create board:", error)
//     } finally {
//       setLoading(false);
//     }
//   }


//   //--------Delete One Board
//   async function handleDelete(id) {
//     try {
//       setDeletingId(id); // sirf is board pe loading

//       await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/boards/${id}`);

//       // localStorage clean
//       localStorage.removeItem(`canvas_${id}`);
//       // UI se remove karo (no reload)
//       setBoards(prev => prev.filter(b => b._id !== id));

//     } catch (error) {
//       console.log("Delete board:", error);
//     } finally {
//       setDeletingId(null);
//     }
//   }
// }




'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { Command, CommandDialog } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import Navbar from '../components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Guest boards localStorage se lo
const getGuestBoards = () => {
  const raw = localStorage.getItem('guest_boards');
  return raw ? JSON.parse(raw) : [];
};

const saveGuestBoards = (boards) => {
  localStorage.setItem('guest_boards', JSON.stringify(boards));
};

export default function BoardsPage() {
  const { user, isGuest } = useAuth();
  const router = useRouter();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (isGuest) {
      //  Guest — localStorage se boards lo
      setBoards(getGuestBoards());
      return;
    }

    //  Logged in — DB se boards lo
    setLoading(true);
    axios.get(`${API}/api/boards`, { withCredentials: true })
      .then(r => setBoards(r.data))
      .catch(err => {
        if (err.response?.status === 401) router.push('/auth');
      })
      .finally(() => setLoading(false));
  }, [isGuest, user]);

  if (loading) return (
    <div className="p-8 grid grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-28 rounded-xl bg-gray-200 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen dark:bg-gray-700 dark:text-white">
      <Navbar />

      <div className="p-4 flex justify-between items-center mb-2">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-50">My Boards</h1>
        <button onClick={() => setOpen(true)}
          className="px-5 py-2.5 cursor-pointer bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 hover:scale-105 transition-all">
          + New Board
        </button>
      </div>

      {/* Guest banner */}
      {isGuest && (
        <div className="mx-8 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          Guest mode — boards are saved locally only.
          <button onClick={() => router.push('/auth')}
            className="ml-2  underline font-medium hover:text-blue-600 cursor-pointer">Sign in to sync</button>
        </div>
      )}

      {boards.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
          <p className="text-lg">No boards yet</p>
          <button onClick={() => setOpen(true)}
            className="mt-4 cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition-all">
            Create your first board
          </button>
        </div>
      )}

      <CommandDialog open={open} onOpenChange={setOpen} className="p-2">
        <Command>
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="p-2 border-2 rounded w-auto"
            placeholder="Type board name..." />
          <Button className="mt-2" onClick={createBoard}>Create</Button>
        </Command>
      </CommandDialog>

      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {boards.map((b) => (
          <div key={b._id || b.guestId}
            className="group p-5 bg-white rounded-2xl shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 border">
            <div className="flex flex-col h-full justify-between">
              <h2 onClick={() => router.push(isGuest ? `/board/guest_${b.guestId}` : `/board/${b._id}`)}
                className="font-semibold text-gray-800 group-hover:text-blue-600 transition">
                {b.title || 'Untitled Board'}
              </h2>
              <div className="flex items-center justify-around text-sm text-gray-400">
                <p className="mt-4 text-sm text-gray-400">
                  Updated: {new Date(b.updatedAt || b.createdAt).toLocaleDateString()}
                </p>
                <Button onClick={() => handleDelete(b._id || b.guestId)}
                  disabled={deletingId === (b._id || b.guestId)}
                  className="hover:bg-gray-400 bg-gray-200 font-bold cursor-pointer">
                  {deletingId === (b._id || b.guestId)
                    ? <span className="text-xs">Deleting...</span>
                    : <Trash2Icon className="w-4 h-4 font-bold text-red-500" />}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  async function createBoard() {
    try {
      setLoading(true);

      if (isGuest) {
        //  Guest — sirf localStorage mein save karo
        const guestId = `guest_${Date.now()}`;
        const newBoard = {
          guestId,
          title: title || 'Untitled Board',
          canvasState: '{}',
          createdAt: new Date().toISOString(),
        };
        const existing = getGuestBoards();
        const updated = [newBoard, ...existing];
        saveGuestBoards(updated);
        setBoards(updated);
        setOpen(false);
        router.push(`/board/guest_${guestId}`);
        return;
      }

      // ✅ Logged in — DB mein save karo
      const { data } = await axios.post(`${API}/api/boards`, { title: title || 'Untitled Board' });
      setOpen(false);
      router.push(`/board/${data._id}`);
    } catch (error) {
      console.error('Create board:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      setDeletingId(id);

      if (isGuest) {
        //  Guest — localStorage se remove karo
        const updated = getGuestBoards().filter(b => b.guestId !== id);
        saveGuestBoards(updated);
        localStorage.removeItem(`canvas_${id}`);
        setBoards(updated);
        return;
      }

      //  Logged in — DB se delete karo
      await axios.delete(`${API}/api/boards/${id}`);
      localStorage.removeItem(`canvas_${id}`);
      setBoards(prev => prev.filter(b => b._id !== id));
    } catch (error) {
      console.error('Delete board:', error);
    } finally {
      setDeletingId(null);
    }
  }
}


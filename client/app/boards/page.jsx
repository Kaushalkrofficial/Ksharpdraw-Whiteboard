'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Command, CommandDialog, CommandInput } from '@/components/ui/command';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function BoardsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);


  useEffect(() => {
    // if (!token) return; // wait until token exists

    axios.get(`${API}/api/boards`, {
      withCredentials: true
    })
      .then(r => {
        setBoards(r.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load boards:', err.response?.status);
        if (err.response?.status === 401) {
          router.push('/auth');
        }
      });
  }, [token]);

  if (loading) return <div className="p-8 text-gray-500">Loading boards...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between mb-6 bg-white ">
        <h1 className="text-2xl font-medium">My Boards</h1>
        <button onClick={createBoard}  className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          + New Board
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {boards.map((b) => (
          <div key={b._id} 
            className="p-4 border rounded-lg cursor-pointer  hover:bg-gray-50 ">
            <p className="font-medium hover:text-black">{b.title}</p>
            <p className="text-sm text-gray-500">{new Date(b.updatedAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      {/* <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <input value={title}  onChange={e=>{setTitle(e.target.value)}} placeholder="Type a board name ..." />
          {/* <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
            </CommandGroup>
          </CommandList>
          <button></button>
        </Command>
      </CommandDialog> */}
    </div>
  );

  async function createBoard() {
    setOpen(true);
    const { data } = await axios.post(`${API}/api/boards`,
      { title: title },
      // { headers: { Authorization: `Bearer ${token}` } }
    );

    if(title){
      router.push(`/board/${data._id}`);
    }
  }
}
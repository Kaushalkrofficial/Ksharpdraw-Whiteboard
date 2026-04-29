// import { useState } from 'react';
// import { ScrollArea } from '../ui/scroll-area';
// import { Circle, Eraser, MousePointer2, Pencil, Square, Trash2, Type } from 'lucide-react';


// export default function Sidebar({clearCanvas,addShape}) {
// const [tool, setTool] = useState('select');

//     const tools = [
//         { id: 'select', icon: <MousePointer2 className="w-6 h-6" /> },
//         { id: 'pen', icon: <Pencil /> },
//         { id: 'rect', icon: <Square /> },
//         { id: 'circle', icon: <Circle /> },
//         { id: 'text', icon: <Type /> },
//         { id: 'sticky', icon: '📋' },
//         { id: 'eraser', icon: <Eraser /> },
//     ];

//     return (
//         <ScrollArea className="w-14 border-r flex flex-col justify-center items-center py-4 gap-2 bg-white dark:bg-gray-900">


//             {tools.map((t) => (
//                 <button
//                     key={t.id}
//                     onClick={() => {
//                         setTool(t.id);
//                         if (!['pen', 'select', 'eraser'].includes(t.id)) {
//                             addShape(t.id);
//                         }
//                     }}
//                     className={`w-9 h-9 rounded-lg transition pl-1 ${tool === t.id
//                         ? 'bg-blue-100 dark:bg-blue-800'
//                         : 'hover:bg-gray-100 dark:hover:bg-gray-700'
//                         }`}
//                 >
//                     {t.icon}
//                 </button>
//             ))}

//             {/* CLEAR */}
//             <button onClick={clearCanvas}>
//                 <Trash2 className="text-red-500" />
//             </button>

//             {/* COLOR */}
//             <input
//                 type="color"
//                 value={color}
//                 onChange={(e) => setColor(e.target.value)}
//                 className="w-9 h-9"
//             />

//             {/* BACKGROUND */}
//             <input
//                 type="color"
//                 value={bgcolor}
//                 onChange={(e) => setBgColor(e.target.value)}
//                 className="w-9 h-9"
//             />



//         </ScrollArea >
//     )
// }
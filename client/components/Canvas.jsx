'use client';

import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { io } from 'socket.io-client';
import { ArrowLeft, ChevronLeft, Circle, Eraser, MousePointer2, Paintbrush, Palette, Pencil, Settings, Square, Trash2, Type } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Canvas({ boardId, onCanvasReady }) {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const [activeSidebar, setActiveSidebar] = useState(null);
  const [isPanelCollapsed, setIsPanelCollaspsed] = useState(false);


  const [fc, setFc] = useState(null);
  const [tool, setTool] = useState('select');
  const [color, setColor] = useState('#1a1a1a');
  const [bgcolor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(3);



  const colorPresets = [
    { "name": "Red", "hex": "#FF0000", "rgb": "rgb(255, 0, 0)" },
    { "name": "Green", "hex": "#00FF00", "rgb": "rgb(0, 255, 0)" },
    { "name": "Blue", "hex": "#0000FF", "rgb": "rgb(0, 0, 255)" },
    { "name": "Yellow", "hex": "#FFFF00", "rgb": "rgb(255, 255, 0)" },
    { "name": "Cyan", "hex": "#00FFFF", "rgb": "rgb(0, 255, 255)" },
    { "name": "Magenta", "hex": "#FF00FF", "rgb": "rgb(255, 0, 255)" },
    { "name": "Black", "hex": "#000000", "rgb": "rgb(0, 0, 0)" },
    { "name": "White", "hex": "#FFFFFF", "rgb": "rgb(255, 255, 255)" },
    { "name": "Navy", "hex": "#000080", "rgb": "rgb(0, 0, 128)" },
  { "name": "Maroon", "hex": "#800800", "rgb": "rgb(128, 0, 0)" },

  ]

  //  INIT CANVAS (ONLY ONCE)
  useEffect(() => {
    if (!canvasRef.current) return;


    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 70,
      height: window.innerHeight - 64,
      backgroundColor: bgcolor,
    });

    setFc(canvas);
    onCanvasReady?.(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // BACKGROUND UPDATE
  useEffect(() => {
    if (!fc) return;


    fc.backgroundColor = bgcolor;
    fc.renderAll();

  }, [bgcolor, fc]);

  //  SOCKET INIT
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join-board', { boardId });

    return () => {
      socket.disconnect();
    };
  }, [boardId]);

  //  TOOL HANDLING
  useEffect(() => {
    if (!fc) return;


    if (tool === 'pen') {
      fc.isDrawingMode = true;

      const brush = new fabric.PencilBrush(fc);
      brush.color = color;
      brush.width = size;
      fc.freeDrawingBrush = brush;
      fc.selection = false;

    } else if (tool === 'eraser') {
      fc.isDrawingMode = true;

      const brush = new fabric.PencilBrush(fc);
      brush.color = bgcolor; // dynamic erase
      brush.width = size * 3;

      fc.freeDrawingBrush = brush;
      fc.selection = false;

    } else {
      fc.isDrawingMode = false;
      fc.selection = true;
    }


  }, [tool, color, size, bgcolor, fc]);

  //  REAL-TIME SYNC (FIXED)
  useEffect(() => {
    if (!fc) return;
    const socket = socketRef.current;
    if (!socket) return;


    const handleAdd = (e) => {
      const obj = e.target;
      socket.emit('canvas-update', {
        boardId,
        delta: {
          type: 'add',
          obj: obj.toJSON(),
        },
      });
    };

    fc.on('object:added', handleAdd);

    socket.on('canvas-update', ({ delta }) => {
      if (delta.type === 'add') {
        fabric.util.enlivenObjects([delta.obj], (objects) => {
          objects.forEach((o) => fc.add(o));
          fc.renderAll();
        });
      }
    });

    return () => {
      fc.off('object:added', handleAdd);
      socket.off('canvas-update');
    };


  }, [fc, boardId]);

  //  ADD SHAPES
  const addShape = (type) => {
    if (!fc) return;


    const opts = {
      left: 200,
      top: 200,
      fill: color,
      stroke: '#333',
      strokeWidth: 1,
    };

    let obj;

    if (type === 'rect') {
      obj = new fabric.Rect({ ...opts, width: 120, height: 80, rx: 6 });
    }

    if (type === 'circle') {
      obj = new fabric.Circle({ ...opts, radius: 50, fill: color });
    }

    if (type === 'text') {
      obj = new fabric.IText('Edit me', {
        left: 200,
        top: 200,
        fontSize: 18,
        fill: color,
        fontFamily: 'Patrick Hand',
        textAlign: 'center',
      });
    }

    if (type === 'sticky') {
      const rect = new fabric.Rect({
        width: 150,
        height: 120,
        fill: '#fef08a',
        rx: 4,
      });

      const text = new fabric.IText('Note...', {
        fontSize: 14,
        left: 10,
        top: 10,
        fill: '#333',
      });

      obj = new fabric.Group([rect, text], {
        left: 200,
        top: 200,
      });
    }

    if (obj) {
      fc.add(obj);
      fc.setActiveObject(obj);
    }


  };

  //  CLEAR CANVAS
  const clearCanvas = () => {
    if (!fc) return;


    fc.clear();
    fc.backgroundColor = bgcolor;
    fc.renderAll();


  };

  const tools = [
    { id: 'select', icon: <MousePointer2 className="w-6 h-6" /> },
    { id: 'pen', icon: <Pencil /> },
    { id: 'rect', icon: <Square /> },
    { id: 'circle', icon: <Circle /> },
    { id: 'text', icon: <Type /> },
    { id: 'sticky', icon: '📋' },
    { id: 'eraser', icon: <Eraser /> },
  ];

  const handleItemClick = (id) => {
    // setTool(id);
    // if (id === activeSidebar && isPanelCollapsed) return;
    setActiveSidebar(id);
    setIsPanelCollaspsed(!isPanelCollapsed);
  }
  // const activeItem=  tools|| sidebarItems?.find(item => item.id === activeSidebar);


  const closeSecondaryPanel = () => {
    setActiveSidebar(null)
  }

  const togglePanelCollapse = (e) => {
    e.stopPropagation();

    setIsPanelCollaspsed(!isPanelCollapsed)
  }

  const setActiveTab = () => {

  }


  return (
    <div className="flex h-screen w-screen  ">

      {/* Sidebar */}
      <ScrollArea className="w-14 flex flex-col items-center justify-center py-4 gap-2 bg-gray-300 dark:bg-gray-800 overflow-visible">

        {tools.map((t) => (
          <div key={t.id} className="relative group flex justify-center">

            <button
              title={t.id}
              onClick={() => {
                setTool(t.id);
                // handleItemClick(t.id);
                if (!['pen', 'select', 'eraser'].includes(t.id)) {
                  addShape(t.id);
                }
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition
          ${tool === t.id
                  ? 'bg-blue-100 dark:bg-blue-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <span>{t.icon}</span>
            </button>

            {/* Tooltip FIXED */}
            {/* <div className="absolute left-4 top-2/2 -translate-y-1/2 
        bg-black text-white text-xs px-2 py-1 rounded
        opacity-0 group-hover:opacity-100 transition duration-200 z-50 whitespace-nowrap">
              {t.id}
            </div> */}

          </div>
        ))}

        <div className="flex flex-col items-center gap-3 mt-2">

          {/* CLEAR */}
          <button onClick={clearCanvas} title='clear'>
            <Trash2 className="text-red-500" />
          </button>

          {/* COLOR */}
          <input
            title='color'
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-9 h-9 cursor-pointer rounded-full"
          />

          {/* BACKGROUND */}

          <Settings
            className={`cursor-pointer w-8 h-8`}
            onClick={()=>handleItemClick('setting')}
          />

          <input
            title='backgroundColor'
            type="color"
            value={bgcolor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-9 h-9 rounded-full cursor-pointer"
          />

        </div>

      </ScrollArea>


      {activeSidebar &&
        <div className={`border-2 border-r-gray-500 ${isPanelCollapsed ? 'collapse' : ''}`}
          style={{
            width: isPanelCollapsed ? '0' : '250px',
            opacity: isPanelCollapsed ? '0' : '1',
            overflow: isPanelCollapsed ? 'hidden' : 'visible'
          }}
        >

          <div className='panel-hiddedn  p-2 flex items-center border-b-gray-500 border'>
            <button className='flex items-center justify-center bg-none border-none cursor-pointer p-4 mr-3 text-gray-300 '
              onClick={closeSecondaryPanel}>
              <ArrowLeft className='w-5 h-5 dark:text-gray-300 text-gray-700' />
            </button>
            <span className='text-2xl font-bold dark:text-gray-300'>
              {/* {activeItem?.label} */}
              Setting
            </span >
          </div >
          <Tabs
            defaultValue='colors'
            className={`w-full flex justify-around`}
            // value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value='color'>
                <Palette className='mr-2 h-4 w-4' />
                Colors
              </TabsTrigger>
              <TabsTrigger value='brush'>
                <Paintbrush className='mr-2 h-4 w-4' />
                Brush
              </TabsTrigger>
              <TabsTrigger value='tools'>
                <Palette className='mr-2 h-4 w-4' />
                Tools
              </TabsTrigger>

            </TabsList>
            <TabsContent value='color'>

               {/* ---------Background color setting------- */}
              <div className='space-y-3 p-1'>
                <div className='flex items-center justify-between'>
                  <label>Color Palette</label>
                  {/* <div
                    className='w-6 h-6 rounded-full border shadow-sm'
                    style={{ backgroundColor: bgcolor }}
                  /> */}
                  <div className='flex items-center w-auto gap-3'>
                    <label className="text-xs ">Background</label>
                    <input
                      className='w-10 h-10 rounded-full border shadow-sm cursor-pointer transition-transform  hover:scale-110'
                      type="color" value={bgcolor} onChange={(e) => setBgColor(e.target.value)} />
                  </div>

                </div>
                <div className='grid grid-cols-5 gap-2'>
                  {
                    colorPresets.map(color => (
                      <div key={color.hex}>
                        <button
                          onClick={() => setBgColor(color.hex)}
                          className={`w-10 h-10 rounded-full cursor-pointer
                             border border-gray-500 transition-transform  hover:scale-110 ${color.hex === color ? 'ring-1 ring-offset-2 ring-primary' : ''
                            }`}
                          style={{ backgroundColor: color.hex }} />


                      </div>
                    ))
                  }
                </div>

              </div>
              <hr className=' '/>
{/* -----------Stroke colors setting------------ */}
              <div className='space-y-3 p-1'>
                <div className='flex items-center justify-between'>
                  <label>Color Palette</label>
                  <div className='flex items-center w-auto gap-3'>
                    <label className="text-xs ">Stroke color</label>
                    <input
                      className='w-10 h-10 rounded-full border   shadow-sm cursor-pointer transition-transform  hover:scale-110'
                      type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                  </div>

                </div>
                <div className='grid grid-cols-5 gap-2'>
                  {
                    colorPresets.map(color => (
                      <div key={color.hex}>
                        <button
                          onClick={() => setColor(color.hex)}
                          className={`w-10 h-10 rounded-full cursor-pointer
                             border border-gray-500 transition-transform  hover:scale-110 ${color.hex === color ? 'ring-1 ring-offset-2 ring-primary' : ''
                            }`}
                          style={{ backgroundColor: color.hex }} />


                      </div>
                    ))
                  }
                </div>



              </div>
            </TabsContent>
          </Tabs>

          <div className='h-full overflow-y-auto'>
            {/* activeItem?.panel() */}
            <div className="flex flex-col gap-5 p-3">
          
              <div className='w-full flex-col justify-between'>
                <label className="text-xs w-full font-semibold">Pen / Eraser Size: {size}</label>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={size}
                  className={`w-full`}
                  onChange={(e) => setSize(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          <button className='collapse-button
           absolute left-71
           top-1/2 translate-y-1/2
           w-6 h-6 bg-white text-black border-2 border-gray-300 rounded flex items-center
           justify-center cursor-pointer shadow-emerald-950 z-20 
           '
            onClick={
              closeSecondaryPanel
              // togglePanelCollapse
            }
          >
            <ChevronLeft className='h-5 w-5' />
          </button>

        </div >}


      {/* CANVAS */}
      <div className="flex-1 overflow-hidden">
        <canvas ref={canvasRef} />
      </div>
    </div >


  );
}

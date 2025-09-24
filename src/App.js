import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Compact } from '@uiw/react-color';
import { Upload, Download, Image as ImageIcon, Shapes, Palette, Search } from 'lucide-react';
import { sampleSvgShapes } from './sampleSvgData';

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 600;
const MAX_SIZE = 600;
const ICONS_PER_ROW = 3;
const ICON_HEIGHT = 120; // Height of each icon item including padding

function App() {
  const [mode, setMode] = useState('shapes');
  const [selectedShape, setSelectedShape] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [svgColor, setSvgColor] = useState('#F40BF4');
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showSvgColorPicker, setShowSvgColorPicker] = useState(false);
  const [elementPosition, setElementPosition] = useState({ x: 300, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [allShapes, setAllShapes] = useState(sampleSvgShapes);
  const [isLoadingIcons, setIsLoadingIcons] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [iconSource, setIconSource] = useState('builtin'); // 'builtin' or 'folder'
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 12 }); // For virtualization
  const [showIconModal, setShowIconModal] = useState(false);
  // Separate state for each text overlay
  const [pushHeader1, setPushHeader1] = useState('Your notification title');
  const [pushPreheader1, setPushPreheader1] = useState('Notification description text');
  const [pushHeader2, setPushHeader2] = useState('Your notification title');
  const [pushPreheader2, setPushPreheader2] = useState('Notification description text');
  const [editingText, setEditingText] = useState(null); // 'header1', 'preheader1', 'header2', 'preheader2', or null
  const [tempText, setTempText] = useState('');
  
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const iconGridRef = useRef(null);
  const searchInputRef = useRef(null);
  const mockupCanvasRef = useRef(null);
  const mockupCanvasSquareRef = useRef(null);

  // Load icons from static JSON file (production) or API (development)
  const loadIconsFromFolder = async () => {
    setIsLoadingIcons(true);
    try {
      // Try to load from static JSON file first (works in production)
      const response = await fetch(`/icons-data.json?t=${Date.now()}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.icons && data.icons.length > 0) {
          setAllShapes(data.icons);
          setIconSource('folder');
          console.log(`✅ Loaded ${data.icons.length} icons from static JSON`);
          return;
        }
      }
      
      // Fallback: try the API endpoint (development only)
      try {
        const apiResponse = await fetch(`/api/icons?t=${Date.now()}`);
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          
          if (apiData.icons && apiData.icons.length > 0) {
            setAllShapes(apiData.icons);
            setIconSource('folder');
            console.log(`✅ Loaded ${apiData.icons.length} icons from API`);
            return;
          }
        }
      } catch (apiError) {
        // API not available (expected in production)
        console.log('API endpoint not available, using built-in icons');
      }
      
      // Final fallback: use built-in icons
      setAllShapes(sampleSvgShapes);
      setIconSource('builtin');
      console.log('📦 Using built-in sample icons');
      
    } catch (error) {
      console.log('Error loading icons, using built-in icons:', error);
      // Fall back to built-in icons
      setAllShapes(sampleSvgShapes);
      setIconSource('builtin');
    } finally {
      setIsLoadingIcons(false);
    }
  };

  // Load icons on app start
  useEffect(() => {
    loadIconsFromFolder();
  }, []);

  // Set default sticker icon when shapes are loaded (only if no uploaded image)
  useEffect(() => {
    if (allShapes.length > 0 && !selectedShape && !uploadedImage) {
      // Look for Sticker Outline icon specifically as default (processed name from IconStickerOutline.svg)
      const stickerIcon = allShapes.find(shape => 
        shape.name && (
          shape.name === 'Sticker Outline' ||
          shape.name === 'IconStickerOutline' ||
          shape.name.toLowerCase().includes('sticker outline')
        )
      );
      
      if (stickerIcon) {
        selectShape(stickerIcon);
      }
    }
  }, [allShapes, selectedShape, uploadedImage]);

  // Filter shapes based on search with memoization
  const filteredShapes = useMemo(() => {
    if (!searchTerm) return allShapes;
    const searchLower = searchTerm.toLowerCase();
    return allShapes.filter(shape => 
      shape.name.toLowerCase().includes(searchLower) ||
      shape.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }, [allShapes, searchTerm]);

  // Virtual scrolling calculations
  const { visibleItems, totalHeight, scrollHandler } = useMemo(() => {
    const containerHeight = 384; // max-h-96 = 24rem = 384px
    const rowsToShow = Math.ceil(containerHeight / ICON_HEIGHT) + 2; // Add buffer
    const totalRows = Math.ceil(filteredShapes.length / ICONS_PER_ROW);
    const totalHeight = totalRows * ICON_HEIGHT;
    
    const scrollHandler = (e) => {
      const scrollTop = e.target.scrollTop;
      const startRow = Math.floor(scrollTop / ICON_HEIGHT);
      const endRow = Math.min(startRow + rowsToShow, totalRows);
      
      setVisibleRange({
        start: startRow * ICONS_PER_ROW,
        end: endRow * ICONS_PER_ROW
      });
    };

    // Get visible items
    const visibleItems = filteredShapes.slice(visibleRange.start, visibleRange.end);
    
    return { visibleItems, totalHeight, scrollHandler };
  }, [filteredShapes, visibleRange.start, visibleRange.end]);

  // Calculate center position
  const calculateCenterPosition = (width, height) => {
    return {
      x: (CANVAS_WIDTH - width) / 2,
      y: (CANVAS_HEIGHT - height) / 2
    };
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (height > MAX_SIZE) {
          const ratio = MAX_SIZE / height;
          width *= ratio;
          height = MAX_SIZE;
        }
        
        if (width > MAX_SIZE) {
          const ratio = MAX_SIZE / width;
          height *= ratio;
          width = MAX_SIZE;
        }

        const uploadedData = {
          src: e.target.result,
          width,
          height,
          originalWidth: img.width,
          originalHeight: img.height,
          name: file.name
        };

        setSelectedShape(null); // Clear selected shape first
        setUploadedImage(uploadedData);
        
        const { x, y } = calculateCenterPosition(width, height);
        setElementPosition({ x, y });
      };
      img.onerror = () => {};
      img.src = e.target.result;
    };
    reader.onerror = () => {};
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] },
    multiple: false,
    onDropAccepted: () => {},
    onDropRejected: () => {},
    onError: () => {}
  });

  // Draw on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background (only if not transparent)
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Draw element (prioritize uploaded image over selected shape)
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, elementPosition.x, elementPosition.y, uploadedImage.width, uploadedImage.height);
      };
      img.onerror = () => {
        // Handle image load error silently
      };
      img.src = uploadedImage.src;
    } else if (selectedShape) {
      const img = new Image();
      const svg = new Blob([selectedShape.svg.replace(/fill="[^"]*"/g, `fill="${svgColor}"`)], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svg);
      
      img.onload = () => {
        ctx.drawImage(img, elementPosition.x, elementPosition.y, MAX_SIZE, MAX_SIZE);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  }, [backgroundColor, selectedShape, uploadedImage, elementPosition, svgColor]);

  // Update canvas when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Focus search input when modal opens
  useEffect(() => {
    if (showIconModal && searchInputRef.current) {
      // Clear search term and focus input
      setSearchTerm('');
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showIconModal]);

  // Draw mockup canvas
  const drawMockupCanvas = useCallback(() => {
    const canvas = mockupCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas (2:1 aspect ratio, high resolution)
    ctx.clearRect(0, 0, 480, 240);
    
    // Draw background if not transparent
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, 480, 240);
    }
    
    // Draw element
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(480 / uploadedImage.width, 240 / uploadedImage.height);
        const width = uploadedImage.width * scale;
        const height = uploadedImage.height * scale;
        const x = (480 - width) / 2;
        const y = (240 - height) / 2;
        ctx.drawImage(img, x, y, width, height);
      };
      img.src = uploadedImage.src;
    } else if (selectedShape) {
      const img = new Image();
      const svg = new Blob([selectedShape.svg.replace(/fill="[^"]*"/g, `fill="${svgColor}"`)], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svg);
      img.onload = () => {
        // Center the icon in the 2:1 canvas
        const iconSize = Math.min(480, 240);
        const x = (480 - iconSize) / 2;
        const y = (240 - iconSize) / 2;
        ctx.drawImage(img, x, y, iconSize, iconSize);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  }, [backgroundColor, selectedShape, uploadedImage, svgColor]);

  // Update mockup canvas when dependencies change
  useEffect(() => {
    drawMockupCanvas();
  }, [drawMockupCanvas]);

  // Draw square mockup canvas
  const drawMockupSquareCanvas = useCallback(() => {
    const canvas = mockupCanvasSquareRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas (1:1 aspect ratio, high resolution)
    ctx.clearRect(0, 0, 240, 240);
    
    // Draw background if not transparent
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, 240, 240);
    }
    
    // Draw element
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(240 / uploadedImage.width, 240 / uploadedImage.height);
        const width = uploadedImage.width * scale;
        const height = uploadedImage.height * scale;
        const x = (240 - width) / 2;
        const y = (240 - height) / 2;
        ctx.drawImage(img, x, y, width, height);
      };
      img.src = uploadedImage.src;
    } else if (selectedShape) {
      const img = new Image();
      const svg = new Blob([selectedShape.svg.replace(/fill="[^"]*"/g, `fill="${svgColor}"`)], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svg);
      img.onload = () => {
        // Fill the entire square canvas with the icon
        ctx.drawImage(img, 0, 0, 240, 240);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  }, [backgroundColor, selectedShape, uploadedImage, svgColor]);

  // Update square mockup canvas when dependencies change
  useEffect(() => {
    drawMockupSquareCanvas();
  }, [drawMockupSquareCanvas]);

  // Handle mouse drag on canvas
  const handleCanvasMouseDown = (e) => {
    if (!selectedShape && !uploadedImage) return;
    
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const scale = rect.width / CANVAS_WIDTH;
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;
    
    const elementWidth = uploadedImage ? uploadedImage.width : MAX_SIZE;
    const elementHeight = uploadedImage ? uploadedImage.height : MAX_SIZE;
    
    // Check if click is within element bounds
    if (mouseX >= elementPosition.x && mouseX <= elementPosition.x + elementWidth &&
        mouseY >= elementPosition.y && mouseY <= elementPosition.y + elementHeight) {
      setIsDragging(true);
      
      const offsetX = mouseX - elementPosition.x;
      const offsetY = mouseY - elementPosition.y;
      
      const handleMouseMove = (e) => {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        const scale = rect.width / CANVAS_WIDTH;
        const newX = (e.clientX - rect.left) / scale - offsetX;
        const newY = (e.clientY - rect.top) / scale - offsetY;
        
        setElementPosition({
          x: Math.max(0, Math.min(CANVAS_WIDTH - elementWidth, newX)),
          y: Math.max(0, Math.min(CANVAS_HEIGHT - elementHeight, newY))
        });
      };
      
      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  // Generate smart filename based on template: "Lifecycle_toolName_color_background_1200x600"
  const generateFileName = () => {
    let toolName = 'unknown';
    let colorName = 'unknown';
    let backgroundName = 'unknown';
    
    // Get tool name
    if (uploadedImage) {
      // Use uploaded image name without extension
      toolName = uploadedImage.name
        .replace(/\.[^/.]+$/, '')  // Remove file extension
        .replace(/\s+/g, '')  // Remove spaces
        .replace(/[^a-zA-Z0-9]/g, '')  // Remove special characters
        .toLowerCase();
    } else if (selectedShape) {
      // Clean the icon name for filename (remove spaces, special chars)
      toolName = selectedShape.name
        .replace(/\s+/g, '')  // Remove spaces
        .replace(/[^a-zA-Z0-9]/g, '')  // Remove special characters
        .toLowerCase();
    }
    
    // Get color name
    if (selectedShape) {
      // Convert hex color to readable name or use hex without #
      colorName = svgColor.replace('#', '').toLowerCase();
      
      // Convert common colors to names
      const colorMap = {
        'f40bf4': 'pink',
        'ff0000': 'red',
        '00ff00': 'green',
        '0000ff': 'blue',
        'ffff00': 'yellow',
        'ff00ff': 'magenta',
        '00ffff': 'cyan',
        '000000': 'black',
        'ffffff': 'white',
        'ffa500': 'orange',
        '800080': 'purple'
      };
      
      colorName = colorMap[colorName] || colorName;
    } else {
      colorName = 'original';
    }
    
    // Get background name
    if (backgroundColor === 'transparent') {
      backgroundName = 'transparent';
    } else {
      backgroundName = backgroundColor.replace('#', '').toLowerCase();
      
      // Convert common background colors to names
      const bgColorMap = {
        'ffffff': 'white',
        '000000': 'black',
        'ff0000': 'red',
        '00ff00': 'green',
        '0000ff': 'blue',
        'ffff00': 'yellow',
        'ffa500': 'orange',
        '800080': 'purple'
      };
      
      backgroundName = bgColorMap[backgroundName] || backgroundName;
    }
    
    return `Lifecycle_${toolName}_${colorName}_${backgroundName}_1200x600.png`;
  };

  // Export as PNG
  const exportAsPNG = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFileName();
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Select shape
  const selectShape = (shape) => {
    setUploadedImage(null); // Clear uploaded image first
    setSelectedShape(shape);
    const { x, y } = calculateCenterPosition(MAX_SIZE, MAX_SIZE);
    setElementPosition({ x, y });
  };

  // Helper function to truncate text with ellipsis
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Get current text based on editing type
  const getCurrentText = (textType) => {
    switch (textType) {
      case 'header1': return pushHeader1;
      case 'preheader1': return pushPreheader1;
      case 'header2': return pushHeader2;
      case 'preheader2': return pushPreheader2;
      default: return '';
    }
  };

  // Handle text editing
  const handleTextDoubleClick = (textType) => {
    const currentText = getCurrentText(textType);
    setTempText(currentText);
    setEditingText(textType);
  };

  const handleTextSave = () => {
    if (editingText) {
      switch (editingText) {
        case 'header1':
        case 'header2':
          // Sync both headers together
          setPushHeader1(tempText);
          setPushHeader2(tempText);
          break;
        case 'preheader1':
        case 'preheader2':
          // Sync both preheaders together
          setPushPreheader1(tempText);
          setPushPreheader2(tempText);
          break;
      }
      setEditingText(null);
      setTempText('');
    }
  };

  const handleTextCancel = () => {
    setEditingText(null);
    setTempText('');
  };

  const handleTextKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleTextCancel();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Canvas Area */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Canvas</h2>
                  <p className="text-sm text-gray-500">Click and drag to position</p>
                </div>
                <button
                  onClick={exportAsPNG}
                  disabled={!selectedShape && !uploadedImage}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                >
                  <Download size={16} />
                  Export PNG
                </button>
              </div>
              
              {/* Canvas */}
              <div 
                ref={canvasContainerRef}
                className={`relative border-2 border-gray-200 rounded-lg overflow-hidden ${
                  backgroundColor === 'transparent' ? 'bg-white' : 'bg-gray-100'
                }`}
                style={{ 
                  paddingBottom: '50%',
                  ...(backgroundColor === 'transparent' && {
                    backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  })
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className={`absolute inset-0 w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  onMouseDown={handleCanvasMouseDown}
                />
              </div>

              {/* Controls */}
              <div className="mt-4 flex items-center justify-between">
                
                {/* Left Side - Buttons */}
                <div className="flex items-center gap-3">
                  
                  {/* Change Icon */}
                  <button
                    onClick={() => setShowIconModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors"
                  >
                    <Shapes size={16} />
                    <span className="text-sm">Change Icon</span>
                  </button>

                  {/* Upload */}
                  <div 
                    {...getRootProps()} 
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <input {...getInputProps()} />
                    <Upload size={16} />
                    <span className="text-sm">{isDragActive ? 'Drop' : 'Upload'}</span>
                  </div>
                  
                </div>

                {/* Right Side - Colors */}
                  <div className="flex items-center gap-3">
                    
                    {/* Background Color */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">BG</span>
                      <div className="relative">
                        <button
                          onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                          className="w-8 h-8 rounded border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden"
                        >
                          {backgroundColor === 'transparent' ? (
                            <div className="w-full h-full bg-gray-100" style={{ 
                              backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                              backgroundSize: '4px 4px',
                              backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                            }} />
                          ) : (
                            <div className="w-full h-full" style={{ backgroundColor }} />
                          )}
                        </button>
                        
                        {showBgColorPicker && (
                          <div className="absolute z-20 mt-2 right-0 min-w-max">
                            <div className="fixed inset-0" onClick={() => setShowBgColorPicker(false)} />
                            <div className="bg-white rounded-lg shadow-xl p-3 border border-gray-200">
                              <div className="mb-3">
                                <button
                                  onClick={() => {
                                    setBackgroundColor('transparent');
                                    setShowBgColorPicker(false);
                                  }}
                                  className={`w-full px-3 py-2 text-xs rounded transition-colors font-medium ${
                                    backgroundColor === 'transparent' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-gray-100 hover:bg-gray-200'
                                  }`}
                                >
                                  ✓ Transparent
                                </button>
                              </div>
                              <Compact
                                color={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                                onChange={(color) => setBackgroundColor(color.hex)}
                                style={{ width: '240px' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shape Color */}
                  {selectedShape && !uploadedImage && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Icon</span>
                      <div className="relative">
                        <button
                          onClick={() => setShowSvgColorPicker(!showSvgColorPicker)}
                          className="w-8 h-8 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                          style={{ backgroundColor: svgColor }}
                        />
                        
                        {showSvgColorPicker && (
                          <div className="absolute z-20 mt-2 right-0 min-w-max">
                            <div className="fixed inset-0" onClick={() => setShowSvgColorPicker(false)} />
                            <div className="bg-white rounded-lg shadow-xl p-3 border border-gray-200">
                              <Compact
                                color={svgColor}
                                onChange={(color) => setSvgColor(color.hex)}
                                style={{ width: '240px' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                </div>
              )}
                </div>

              </div>

            </div>
          </div>

          {/* Push Notification Mockup */}
          <div className="hidden xl:block xl:col-span-1">
            {/* Mockup Container */}
              <div className="relative rounded-lg min-h-[300px]">
                {/* Mockup Background Image */}
                <img 
                  src="/Mockup.png" 
                  alt="Push notification mockup"
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => {}}
                />
                
                {/* Canvas Result Overlay - 2:1 Aspect Ratio */}
                <div className="absolute top-[55.6%] left-[5%] w-[90.5%]" style={{ aspectRatio: '2/1' }}>
                  <canvas
                    ref={mockupCanvasRef}
                    width={480}
                    height={240}
                    className="w-full h-full"
                    style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}
                  />
                </div>

                {/* Canvas Result Overlay - 1:1 Aspect Ratio (Square) */}
                <div className="absolute top-[48.5%] left-[84%] w-[8%]" style={{ aspectRatio: '1/1' }}>
                  <canvas
                    ref={mockupCanvasSquareRef}
                    width={240}
                    height={240}
                    className="w-full h-full"
                    style={{ borderRadius: '0.3em' }}
                  />
                </div>
                
                {/* Text Overlays - First Set */}
                <div className="absolute top-[46%] left-[20%] space-y-1" style={{ width: '170px' }}>
                  {/* Header Text */}
                  <div className="text-white font-semibold text-sm leading-tight whitespace-nowrap overflow-hidden">
                    {editingText === 'header1' ? (
                      <input
                        type="text"
                        value={tempText}
                        onChange={(e) => setTempText(e.target.value)}
                        onKeyDown={handleTextKeyDown}
                        onBlur={handleTextSave}
                        className="bg-transparent border border-white/30 rounded px-1 text-white text-sm font-semibold leading-tight focus:outline-none focus:border-white/60 whitespace-nowrap"
                        style={{ width: '170px' }}
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => handleTextDoubleClick('header1')}
                        className="cursor-pointer hover:bg-white/10 rounded px-1 transition-colors whitespace-nowrap overflow-hidden text-ellipsis block"
                        title={pushHeader1}
                        style={{ maxWidth: '170px' }}
                      >
                        {truncateText(pushHeader1, 25)}
                      </span>
                    )}
                  </div>
                  {/* Preheader Text */}
                  <div className="text-white/80 text-xs leading-tight whitespace-nowrap overflow-hidden">
                    {editingText === 'preheader1' ? (
                      <input
                        type="text"
                        value={tempText}
                        onChange={(e) => setTempText(e.target.value)}
                        onKeyDown={handleTextKeyDown}
                        onBlur={handleTextSave}
                        className="bg-transparent border border-white/30 rounded px-1 text-white/80 text-xs leading-tight focus:outline-none focus:border-white/60 whitespace-nowrap"
                        style={{ width: '170px' }}
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => handleTextDoubleClick('preheader1')}
                        className="cursor-pointer hover:bg-white/10 rounded px-1 transition-colors whitespace-nowrap overflow-hidden text-ellipsis block"
                        title={pushPreheader1}
                        style={{ maxWidth: '170px' }}
                      >
                        {truncateText(pushPreheader1, 34)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Text Overlays - Second Set (Duplicate) */}
                <div className="absolute top-[77.75%] left-[8%] space-y-1" style={{ width: '270px' }}>
                  {/* Header Text */}
                  <div className="text-white font-semibold text-sm leading-tight whitespace-nowrap overflow-hidden">
                    {editingText === 'header2' ? (
                      <input
                        type="text"
                        value={tempText}
                        onChange={(e) => setTempText(e.target.value)}
                        onKeyDown={handleTextKeyDown}
                        onBlur={handleTextSave}
                        className="bg-transparent border border-white/30 rounded px-1 text-white text-sm font-semibold leading-tight focus:outline-none focus:border-white/60 whitespace-nowrap"
                        style={{ width: '240px' }}
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => handleTextDoubleClick('header2')}
                        className="cursor-pointer hover:bg-white/10 rounded px-1 transition-colors whitespace-nowrap overflow-hidden text-ellipsis block"
                        title={pushHeader2}
                        style={{ maxWidth: '240px' }}
                      >
                        {truncateText(pushHeader2, 40)}
                      </span>
                    )}
                  </div>
                  {/* Preheader Text */}
                  <div className="text-white/80 text-xs leading-tight whitespace-nowrap overflow-hidden">
                    {editingText === 'preheader2' ? (
                      <input
                        type="text"
                        value={tempText}
                        onChange={(e) => setTempText(e.target.value)}
                        onKeyDown={handleTextKeyDown}
                        onBlur={handleTextSave}
                        className="bg-transparent border border-white/30 rounded px-1 text-white/80 text-xs leading-tight focus:outline-none focus:border-white/60 whitespace-nowrap"
                        style={{ width: '240px' }}
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => handleTextDoubleClick('preheader2')}
                        className="cursor-pointer hover:bg-white/10 rounded px-1 transition-colors whitespace-nowrap overflow-hidden text-ellipsis block"
                        title={pushPreheader2}
                        style={{ maxWidth: '240px' }}
                      >
                        {truncateText(pushPreheader2, 65)}
                      </span>
                    )}
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Icon Selection Modal */}
      {showIconModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowIconModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setShowIconModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-6 pt-12 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search icons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Icon Grid */}
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                {filteredShapes.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => {
                      selectShape(shape);
                      setShowIconModal(false);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 flex flex-col items-center justify-center aspect-square ${
                      selectedShape?.id === shape.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    title={shape.name}
                  >
                    <div 
                      className="w-8 h-8 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ 
                        __html: shape.svg.replace(/fill="[^"]*"/g, 'fill="#000000"').replace(/stroke="[^"]*"/g, 'stroke="#000000"')
                      }}
                    />
                  </button>
                ))}
              </div>
              
              {filteredShapes.length === 0 && !isLoadingIcons && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No icons found matching your search.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
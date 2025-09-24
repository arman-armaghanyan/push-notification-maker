const fs = require('fs');
const path = require('path');

// Icon processing script to generate static JSON file
function buildIcons() {
  console.log('Building icons for production...');
  
  const iconsDir = path.join(__dirname, '../public/icons');
  const outputPath = path.join(__dirname, '../public/icons-data.json');
  
  try {
    // Check if directory exists
    if (!fs.existsSync(iconsDir)) {
      console.log('Icons directory not found, creating empty icons data');
      fs.writeFileSync(outputPath, JSON.stringify({ icons: [], count: 0 }, null, 2));
      return;
    }
    
    // Read all SVG files from the directory
    const files = fs.readdirSync(iconsDir);
    const svgFiles = files.filter(file => file.endsWith('.svg') && file !== 'README.md');
    
    // Simple and reliable name parsing function (same as setupProxy.js)
    const parseIconName = (filename) => {
      let name = filename.replace('.svg', '').replace(/^Icon/, '');
      
      // First, add space before capital letters (both patterns)
      name = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2'); // lowercase/number to uppercase
      name = name.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2'); // uppercase to uppercase+lowercase
      
      // Fix specific acronyms that should stay together (order matters!)
      name = name.replace(/3 D/g, '3D');
      name = name.replace(/A I/g, 'AI');
      name = name.replace(/H D/g, 'HD');
      name = name.replace(/Q R/g, 'QR');
      name = name.replace(/C P U/g, 'CPU');
      name = name.replace(/U I/g, 'UI');
      name = name.replace(/U X/g, 'UX');
      name = name.replace(/A P I/g, 'API');
      name = name.replace(/U R L/g, 'URL');
      name = name.replace(/P D F/g, 'PDF');
      name = name.replace(/S V G/g, 'SVG');
      name = name.replace(/C S S/g, 'CSS');
      name = name.replace(/H T M L/g, 'HTML');
      name = name.replace(/J S/g, 'JS');
      
      // Clean up multiple spaces and trim
      name = name.replace(/\s+/g, ' ').trim();
      
      return name;
    };
    
    const icons = svgFiles.map((file, index) => {
      const filePath = path.join(iconsDir, file);
      const svgContent = fs.readFileSync(filePath, 'utf8');
      
      // Extract meaningful name from filename using smart parsing
      let name = parseIconName(file);
      
      // Special name overrides
      if (file === 'IconAIGen.svg') {
        name = 'AI Enhance';
      }
      
      // Generate tags from camelCase filename (simpler version for tags)
      const baseName = file.replace('.svg', '').replace(/^Icon/, '');
      const tags = baseName.split(/(?=[A-Z])/).map(tag => tag.toLowerCase()).filter(tag => tag.length > 1);
      
      // Add category tags based on filename patterns
      const categoryTags = [];
      if (file.includes('AI')) {
        categoryTags.push('ai', 'artificial intelligence', 'ai tools', 'ai tool');
      }
      if (file.includes('Video')) categoryTags.push('video', 'media');
      if (file.includes('Photo') || file.includes('Image')) categoryTags.push('photo', 'image');
      if (file.includes('Text')) categoryTags.push('text', 'typography');
      if (file.includes('Background')) categoryTags.push('background', 'bg');
      if (file.includes('Effect')) categoryTags.push('effects');
      if (file.includes('Brush')) categoryTags.push('brush', 'drawing');
      if (file.includes('Outline')) categoryTags.push('outline', 'line');
      if (file.includes('Profile') || file.includes('Account')) categoryTags.push('user', 'profile');
      if (file.includes('Heart') || file.includes('Like')) categoryTags.push('like', 'favorite');
      if (file.includes('Share')) categoryTags.push('share', 'social');
      if (file.includes('Download') || file.includes('Upload')) categoryTags.push('transfer', 'file');
      if (file.includes('3D')) categoryTags.push('3d', 'three-dimensional');
      if (file.includes('HD')) categoryTags.push('hd', 'high-definition');
      if (file.includes('QR')) categoryTags.push('qr', 'qr-code');
      
      // Add specific alternative names based on exact filename matches
      const alternativeNames = [];
      
      // Background shortcuts - any icon with "Background" can be found with "bg"
      if (file.includes('Background')) {
        const bgVersion = name.replace(/Background/gi, 'BG');
        alternativeNames.push(bgVersion.toLowerCase());
      }
      
      // Specific icon alternative names
      const specificAlternatives = {
        'IconAIGenerator.svg': ['text to image', 't2i', 'text2image'],
        'IconVideoGenerator.svg': ['text to video', 't2v', 'text2video'], 
        'IconLensFlare.svg': ['ai effects', 'spark', 'lens'],
        'IconStyle.svg': ['ai'],
        'IconAIGen.svg': ['ai enhance', 'enhance', 'ai tool'],
        'IconBackgroundRemove.svg': ['remove bg', 'bg remove', 'background removal'],
        'IconSetBackground.svg': ['set bg', 'bg set'],
        'IconAIBackground.svg': ['ai bg', 'bg ai']
      };
      
      if (specificAlternatives[file]) {
        alternativeNames.push(...specificAlternatives[file]);
      }
      
      // Combine all tags
      const allTags = [...new Set([...tags, ...categoryTags, ...alternativeNames])];
      
      return {
        id: `icon-${index + 1}`,
        name: name,
        filename: file,
        tags: allTags,
        svg: svgContent
      };
    });
    
    const result = { icons, count: icons.length };
    
    // Write the JSON file
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    console.log(`✅ Successfully built ${icons.length} icons to ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error building icons:', error);
    // Create empty file on error
    fs.writeFileSync(outputPath, JSON.stringify({ icons: [], count: 0 }, null, 2));
  }
}

// Run if called directly
if (require.main === module) {
  buildIcons();
}

module.exports = buildIcons;

export async function getDominantColor(imageUrl: string): Promise<{ r: number; g: number; b: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        
        // Scale down significantly for performance
        canvas.width = 30;
        canvas.height = 30;
        
        ctx.drawImage(img, 0, 0, 30, 30);
        
        const data = ctx.getImageData(0, 0, 30, 30).data;
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let i = 0; i < data.length; i += 16) {
          // Skip highly transparent or completely dark/white pixels to get 'vibrant' colors
          if (data[i + 3] < 128) continue;
          const isDark = (data[i] + data[i+1] + data[i+2]) < 60;
          const isWhite = (data[i] + data[i+1] + data[i+2]) > 700;
          if (isDark || isWhite) continue;

          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        
        if (count === 0) return resolve(null);
        
        // Boost vibrancy slightly
        const boost = 1.2;
        resolve({
          r: Math.min(255, Math.floor((r / count) * boost)),
          g: Math.min(255, Math.floor((g / count) * boost)),
          b: Math.min(255, Math.floor((b / count) * boost))
        });
      } catch (err) {
        console.warn("CORS blocked dominant color extraction:", err);
        resolve(null);
      }
    };
    
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}

"use client";

import { ImageUploadClient } from "@/components/image-upload-client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileImage } from "lucide-react";

export default function Home() {
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    originalSize: number;
    compressedSize: number;
    compressionRatio: string;
  } | null>(null);

  const handleImageCompressed = (
    imageData: string,
    compressionStats: {
      originalSize: number;
      compressedSize: number;
      compressionRatio: string;
    }
  ) => {
    setCompressedImage(`data:image/png;base64,${imageData}`);
    setStats(compressionStats);
  };

  const handleDownloadImage = () => {
    if (!compressedImage) return;

    try {
      // Create a temporary link element
      const link = document.createElement("a");
      link.href = compressedImage;
      link.download = `compressed-image-${Date.now()}.png`;
      link.style.display = "none";

      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
      // Fallback: open in new tab
      window.open(compressedImage, "_blank");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="h-screen bg-background">
      {/* Studio Frame - Full Screen */}
      <div className="h-full">
        {/* Black outer frame taking full screen */}
        <div className="bg-studio-outer h-full p-1 md:p-2">
          <div className="h-full flex flex-col md:flex-row gap-1 md:gap-2">
            {/* Left section - Image Upload */}
            <div className="flex-1">
              <ImageUploadClient onImageCompressed={handleImageCompressed} />
            </div>

            {/* Right section - the actual "canvas/result" area */}
            <div className="flex-1 bg-studio-inner rounded-xl flex items-center justify-center overflow-hidden relative">
              {compressedImage ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6">
                  <div className="flex-1 w-full flex items-center justify-center">
                    <img
                      src={compressedImage}
                      alt="Compressed image result"
                      className="max-w-1/2 object-contain rounded-lg shadow-lg"
                    />
                  </div>

                  {/* Stats and Download section */}
                  <div className="w-full max-w-md mt-4 space-y-3">
                    {stats && (
                      <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-white mb-3">
                          Estadísticas de Compresión
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-white/10 rounded p-2">
                            <p className="text-white/70 mb-1">
                              Tamaño Original
                            </p>
                            <p className="text-white font-semibold">
                              {formatBytes(stats.originalSize)}
                            </p>
                          </div>
                          <div className="bg-white/10 rounded p-2">
                            <p className="text-white/70 mb-1">
                              Tamaño Comprimido
                            </p>
                            <p className="text-white font-semibold">
                              {formatBytes(stats.compressedSize)}
                            </p>
                          </div>
                          <div className="bg-white/10 rounded p-2 col-span-2">
                            <p className="text-white/70 mb-1">
                              Reducción de Tamaño
                            </p>
                            <p className="text-white font-semibold text-green-400">
                              {stats.compressionRatio}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleDownloadImage}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Imagen Comprimida
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground px-4">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted/40 flex items-center justify-center">
                    <FileImage className="w-12 h-12" />
                  </div>
                  <p className="text-lg font-semibold">Imagen Comprimida</p>
                  <p className="text-sm mt-2">
                    Sube tu imagen para ver el resultado aquí
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

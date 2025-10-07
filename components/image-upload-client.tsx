"use client";

import * as React from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

interface ImageUploadClientProps {
  onImageCompressed?: (
    imageData: string,
    stats: {
      originalSize: number;
      compressedSize: number;
      compressionRatio: string;
    }
  ) => void;
}

export function ImageUploadClient({
  onImageCompressed,
}: ImageUploadClientProps = {}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [quality, setQuality] = React.useState(70);
  const [maxWidth, setMaxWidth] = React.useState(1920);

  const maxSize = 10485760; // 10MB for images

  // Cleanup preview on unmount
  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      if (acceptedFiles.length !== 1) {
        setError(`Selecciona solo 1 imagen.`);
        return;
      }

      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);

      // Clean up old preview
      if (preview) URL.revokeObjectURL(preview);

      // Create new preview
      const newPreview = URL.createObjectURL(selectedFile);
      setPreview(newPreview);
    },
    [preview]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize,
  });

  const handleCompress = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      // Create FormData with the image
      const formData = new FormData();
      formData.append("image", file);
      formData.append("quality", quality.toString());
      formData.append("maxWidth", maxWidth.toString());

      // Simple progress simulation
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      // Call the /api/upload endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to compress image");
      }

      const result = await response.json();

      clearInterval(interval);
      setProgress(100);

      // Reset after successful compression
      setTimeout(() => {
        setFile(null);
        // Clean up preview URL
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setProgress(0);
        setUploading(false);

        // Call the callback with the compressed image
        if (onImageCompressed && result.image) {
          onImageCompressed(result.image, {
            originalSize: result.originalSize,
            compressedSize: result.compressedSize,
            compressionRatio: result.compressionRatio,
          });
        }

        console.log("Image compressed successfully!", result);
      }, 500);
    } catch (err) {
      console.error("Compression error:", err);
      setError(
        err instanceof Error ? err.message : "Error comprimiendo la imagen"
      );
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setError(null);
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-sm sm:max-w-md space-y-4 sm:space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Comprimir Imagen
          </h2>
          <p className="text-muted-foreground">
            <span className="hidden sm:inline">
              Arrastra y suelta tu imagen aquí o haz clic para seleccionarla
            </span>
            <span className="inline sm:hidden">
              Toca para seleccionar tu imagen
            </span>
            <br />
            <span className="text-xs font-bold">
              (JPG, PNG, WEBP - hasta 10MB)
            </span>
          </p>
        </div>
        <div className="space-y-4">
          {/* Show dropzone when no file is selected */}
          {!file && (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-colors hover:bg-muted-foreground/10",
                isDragActive ? "border-primary bg-muted-foreground/10" : "",
                error && "border-destructive"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-3">
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? "Suelta la imagen aquí"
                    : "Arrastra tu imagen aquí o haz clic para seleccionarla"}
                </p>
                <p
                  className={`text-xs font-bold text-muted-foreground ${
                    isDragActive ? "opacity-0" : ""
                  }`}
                >
                  JPG, JPEG, PNG, WEBP (máx. 10MB)
                </p>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Show file preview when file is selected */}
          {file && preview && (
            <div className="space-y-3">
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt={file.name}
                  className="max-w-full h-48 sm:h-64 object-contain bg-muted/20 mx-auto"
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)}MB
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  disabled={uploading}
                  title="Eliminar imagen"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Compression settings */}
          {file && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium">Calidad</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={quality}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuality(Math.min(100, Math.max(1, val)));
                      }}
                      min={1}
                      max={100}
                      disabled={uploading}
                      className="w-16 px-2 py-1 text-sm text-right border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <Slider
                  value={[quality]}
                  onValueChange={(value) => setQuality(value[0])}
                  min={1}
                  max={100}
                  step={1}
                  disabled={uploading}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Afecta los colores y detalles de la imagen
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium">Ancho Máximo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={maxWidth}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 10;
                        setMaxWidth(Math.min(7680, Math.max(10, val)));
                      }}
                      min={10}
                      max={3840}
                      disabled={uploading}
                      className="w-20 px-2 py-1 text-sm text-right border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">px</span>
                  </div>
                </div>
                <Slider
                  value={[maxWidth]}
                  onValueChange={(value) => setMaxWidth(value[0])}
                  min={5}
                  max={3840}
                  step={1}
                  disabled={uploading}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    La imagen se redimensionará, esta opción es la más efectiva
                  </span>
                </div>
              </div>
            </div>
          )}

          {progress > 0 && <Progress value={progress} className="h-2" />}

          {/* Show compress button when file is selected */}
          {file && (
            <Button
              onClick={handleCompress}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? "Comprimiendo..." : "Comprimir Imagen"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

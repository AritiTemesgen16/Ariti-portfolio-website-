import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle2, Save, X } from 'lucide-react';
import { PROFILE } from '../../data/portfolioData';

interface ProfilePhotoCardProps {
  className?: string;
  showUploadButton?: boolean;
}

export const ProfilePhotoCard: React.FC<ProfilePhotoCardProps> = ({
  className = '',
  showUploadButton = true
}) => {
  const [defaultPhoto] = useState<string>(PROFILE.profileImage);
  const [savedPhotoUrl, setSavedPhotoUrl] = useState<string>(PROFILE.profileImage);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string>(PROFILE.profileImage);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if user uploaded a custom photo previously
    const savedPhoto = localStorage.getItem('ariti_portfolio_custom_photo');
    if (savedPhoto) {
      setSavedPhotoUrl(savedPhoto);
      setPreviewPhotoUrl(savedPhoto);
      PROFILE.profileImage = savedPhoto;
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image file size is too large. Please upload an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPreviewPhotoUrl(result);
        setHasUnsavedChanges(true);
        setSaveSuccess(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSavePhoto = () => {
    if (!previewPhotoUrl) return;

    setIsSaving(true);
    try {
      localStorage.setItem('ariti_portfolio_custom_photo', previewPhotoUrl);
      PROFILE.profileImage = previewPhotoUrl;
      setSavedPhotoUrl(previewPhotoUrl);
      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.warn('LocalStorage size limit exceeded for photo storage', err);
      alert('Could not save photo to browser storage (size limit exceeded). Try a smaller image file.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewPhotoUrl(savedPhotoUrl);
    setHasUnsavedChanges(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem('ariti_portfolio_custom_photo');
    PROFILE.profileImage = defaultPhoto;
    setSavedPhotoUrl(defaultPhoto);
    setPreviewPhotoUrl(defaultPhoto);
    setHasUnsavedChanges(false);
    setSaveSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isCustomPhotoSaved = localStorage.getItem('ariti_portfolio_custom_photo') !== null;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xl group ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        id="profile-photo-upload-input"
      />

      <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-square relative overflow-hidden bg-slate-950">
        <img
          src={previewPhotoUrl}
          alt={`${PROFILE.name} - Software Developer & Full-Stack Engineer`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

        {/* Action Controls Bar Top-Right */}
        {showUploadButton && (
          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            {isCustomPhotoSaved && !hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleReset}
                title="Reset to default photo"
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md text-xs transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Reset</span>
              </button>
            )}

            {!hasUnsavedChanges ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white border border-blue-400/40 text-xs font-medium backdrop-blur-md shadow-lg transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>
            ) : null}
          </div>
        )}

        {/* Unsaved Changes Save Action Banner */}
        {hasUnsavedChanges && (
          <div className="absolute top-3 inset-x-3 z-30 p-2.5 rounded-xl bg-slate-900/95 border border-emerald-500/50 backdrop-blur-md shadow-2xl flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate">New photo ready! Save changes?</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCancelPreview}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Photo'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccess && (
          <div className="absolute top-3 right-3 z-30 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Photo Saved Successfully!</span>
          </div>
        )}

        {/* Dropzone visual hint on drag */}
        {!hasUnsavedChanges && (
          <div className="absolute inset-0 bg-blue-600/10 border-2 border-dashed border-blue-400/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
            <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-mono-tech text-blue-300 border border-blue-500/30 flex items-center gap-2 shadow-2xl">
              <Camera className="w-4 h-4 text-blue-400" />
              <span>Click or Drop your photo file here</span>
            </div>
          </div>
        )}
      </div>

      {/* Info Card Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1 z-10">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-white tracking-tight">
            {PROFILE.name}
          </h4>
          <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-mono-tech">
            Full-Stack Engineer
          </span>
        </div>
        <p className="text-xs text-slate-300 font-mono-tech flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Computer Science • {PROFILE.location}
        </p>
      </div>
    </div>
  );
};


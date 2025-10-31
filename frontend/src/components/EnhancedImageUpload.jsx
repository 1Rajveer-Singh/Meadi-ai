/**
 * Enhanced Medical Image Upload Component
 * Complete integration with backend MinIO storage and image processing
 */

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, FileImage, Check, Loader, AlertCircle,
  Eye, Download, Trash2, RotateCw, ZoomIn, ZoomOut,
  Maximize, FileText, Calendar, User, Activity, 
  Stethoscope, Microscope, Brain, Heart, Layers,
  Settings, Info, CheckCircle, XCircle, Clock
} from 'lucide-react';
import medicalAIClient from '../services/medicalAIClient';
import toast from 'react-hot-toast';

const SUPPORTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
  'image/tiff': ['.tiff', '.tif'],
  'application/dicom': ['.dcm', '.dicom'],
  'image/x-portable-bitmap': ['.pbm'],
  'image/x-portable-graymap': ['.pgm'],
  'image/x-portable-pixmap': ['.ppm'],
};

const MEDICAL_MODALITIES = {
  'chest_xray': { label: 'Chest X-Ray', icon: Heart, color: '#EF4444' },
  'brain_mri': { label: 'Brain MRI', icon: Brain, color: '#8B5CF6' },
  'ct_chest': { label: 'Chest CT', icon: Activity, color: '#06B6D4' },
  'mammography': { label: 'Mammography', icon: Stethoscope, color: '#EC4899' },
  'ultrasound': { label: 'Ultrasound', icon: Layers, color: '#10B981' },
  'pathology': { label: 'Pathology', icon: Microscope, color: '#F59E0B' },
  'dermatology': { label: 'Dermatology', icon: Eye, color: '#84CC16' },
  'ophthalmology': { label: 'Ophthalmology', icon: Eye, color: '#6366F1' },
  'other': { label: 'Other', icon: FileImage, color: '#6B7280' },
};

const EnhancedImageUpload = ({
  onUploadComplete,
  onUploadProgress,
  onUploadError,
  allowMultiple = true,
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  autoStartAnalysis = false,
  className = '',
  patientId,
  studyId,
}) => {
  // Upload state
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // UI state
  const [selectedModality, setSelectedModality] = useState('other');
  const [metadata, setMetadata] = useState({
    description: '',
    acquisition_date: '',
    body_part: '',
    view_position: '',
    laterality: '',
    urgency: 'routine',
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fileInputRef = useRef(null);
  const abortControllersRef = useRef(new Map());

  // ==================== File Processing ====================

  const validateFile = (file) => {
    const errors = [];
    
    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File size exceeds ${Math.round(maxFileSize / (1024 * 1024))}MB limit`);
    }
    
    // Check file type
    if (!Object.keys(SUPPORTED_FORMATS).includes(file.type) && 
        !file.name.toLowerCase().endsWith('.dcm') && 
        !file.name.toLowerCase().endsWith('.dicom')) {
      errors.push('Unsupported file format');
    }
    
    return errors;
  };

  const generateThumbnail = (file) => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/') && !file.name.toLowerCase().includes('.dcm')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  };

  const processFiles = useCallback(async (files) => {
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const errors = validateFile(file);
        const thumbnail = await generateThumbnail(file);
        
        return {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          thumbnail,
          errors,
          status: errors.length > 0 ? 'error' : 'pending',
          modality: selectedModality,
          metadata: { ...metadata },
        };
      })
    );
    
    setUploadQueue(prev => [...prev, ...processedFiles]);
    
    if (processedFiles.some(f => f.errors.length === 0)) {
      toast.success(`${processedFiles.filter(f => f.errors.length === 0).length} files ready for upload`);
    }
    
    if (processedFiles.some(f => f.errors.length > 0)) {
      toast.error(`${processedFiles.filter(f => f.errors.length > 0).length} files have errors`);
    }
    
    return processedFiles;
  }, [selectedModality, metadata, maxFileSize]);

  // ==================== Upload Management ====================

  const uploadFile = async (fileItem) => {
    const { id, file, modality, metadata: fileMetadata } = fileItem;
    
    try {
      setUploadProgress(prev => ({ ...prev, [id]: 0 }));
      
      const abortController = new AbortController();
      abortControllersRef.current.set(id, abortController);
      
      const uploadMetadata = {
        modality,
        patient_id: patientId,
        study_id: studyId,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        upload_timestamp: new Date().toISOString(),
        ...fileMetadata,
      };
      
      // Simulate upload progress (in real implementation, you'd track actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[id] || 0;
          const newProgress = Math.min(currentProgress + Math.random() * 15, 90);
          return { ...prev, [id]: newProgress };
        });
      }, 200);
      
      const response = await medicalAIClient.uploadMedicalImage(file, uploadMetadata);
      
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [id]: 100 }));
      
      const uploadedImage = {
        id: response.image_id || response.id,
        filename: file.name,
        originalFile: fileItem,
        uploadResponse: response,
        uploadTime: Date.now(),
        modality,
        metadata: uploadMetadata,
        thumbnail: fileItem.thumbnail,
        status: 'uploaded',
      };
      
      setUploadedImages(prev => [...prev, uploadedImage]);
      setUploadQueue(prev => prev.filter(item => item.id !== id));
      
      if (onUploadComplete) {
        onUploadComplete(uploadedImage, response);
      }
      
      if (onUploadProgress) {
        onUploadProgress(id, 100, 'completed');
      }
      
      // Auto-start analysis if enabled
      if (autoStartAnalysis) {
        try {
          await medicalAIClient.analyzeImage(uploadedImage.id, {
            modality,
            priority: fileMetadata.urgency || 'routine',
            explainable_ai: true,
          });
          toast.success(`Analysis started for ${file.name}`);
        } catch (analysisError) {
          console.error('Auto-analysis failed:', analysisError);
          toast.error(`Upload successful, but analysis failed to start for ${file.name}`);
        }
      }
      
      toast.success(`Successfully uploaded ${file.name}`);
      
    } catch (error) {
      console.error('Upload failed:', error);
      
      setUploadProgress(prev => ({ ...prev, [id]: 0 }));
      setUploadQueue(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, status: 'error', error: error.message }
            : item
        )
      );
      
      if (onUploadError) {
        onUploadError(error, fileItem);
      }
      
      toast.error(`Failed to upload ${file.name}: ${error.message}`);
    } finally {
      abortControllersRef.current.delete(id);
    }
  };

  const uploadAllFiles = async () => {
    const validFiles = uploadQueue.filter(item => item.status === 'pending');
    
    if (validFiles.length === 0) {
      toast.error('No valid files to upload');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload files in batches to avoid overwhelming the server
      const batchSize = 3;
      for (let i = 0; i < validFiles.length; i += batchSize) {
        const batch = validFiles.slice(i, i + batchSize);
        await Promise.all(batch.map(uploadFile));
      }
      
      toast.success(`Successfully uploaded ${validFiles.length} files`);
    } catch (error) {
      console.error('Batch upload failed:', error);
      toast.error('Some uploads failed. Please check individual file status.');
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = (fileId) => {
    const abortController = abortControllersRef.current.get(fileId);
    if (abortController) {
      abortController.abort();
    }
    
    setUploadQueue(prev => prev.filter(item => item.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const removeFile = (fileId) => {
    setUploadQueue(prev => prev.filter(item => item.id !== fileId));
  };

  const removeUploadedImage = async (imageId) => {
    try {
      await medicalAIClient.deleteMedicalImage(imageId);
      setUploadedImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete image');
    }
  };

  // ==================== Dropzone Configuration ====================

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: SUPPORTED_FORMATS,
    multiple: allowMultiple,
    maxFiles,
    maxSize: maxFileSize,
    onDrop: processFiles,
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ file, errors }) => {
        const errorMessages = errors.map(error => {
          switch (error.code) {
            case 'file-too-large':
              return `File too large (max ${Math.round(maxFileSize / (1024 * 1024))}MB)`;
            case 'file-invalid-type':
              return 'Unsupported file type';
            case 'too-many-files':
              return `Too many files (max ${maxFiles})`;
            default:
              return error.message;
          }
        }).join(', ');
        
        toast.error(`${file.name}: ${errorMessages}`);
      });
    },
  });

  // ==================== Render Methods ====================

  const renderFileItem = (item) => {
    const { id, name, size, status, errors, thumbnail, modality } = item;
    const progress = uploadProgress[id] || 0;
    const ModalityIcon = MEDICAL_MODALITIES[modality]?.icon || FileImage;
    const modalityColor = MEDICAL_MODALITIES[modality]?.color || '#6B7280';
    
    return (
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
      >
        <div className="flex items-center space-x-4">
          {/* Thumbnail or Icon */}
          <div className="flex-shrink-0">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${modalityColor}20` }}
              >
                <ModalityIcon 
                  className="w-8 h-8" 
                  style={{ color: modalityColor }} 
                />
              </div>
            )}
          </div>
          
          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {name}
              </p>
              <div className="flex items-center space-x-2">
                {status === 'pending' && (
                  <button
                    onClick={() => removeFile(id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {status === 'uploading' && (
                  <button
                    onClick={() => cancelUpload(id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-1">
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                style={{ 
                  backgroundColor: `${modalityColor}20`, 
                  color: modalityColor 
                }}
              >
                <ModalityIcon className="w-3 h-3 mr-1" />
                {MEDICAL_MODALITIES[modality]?.label}
              </span>
              <span className="text-xs text-gray-500">
                {(size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
            
            {/* Status and Progress */}
            {status === 'error' && errors.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-red-600">{errors.join(', ')}</p>
              </div>
            )}
            
            {status === 'uploading' && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {status === 'pending' && (
              <div className="mt-2 flex items-center text-xs text-gray-600">
                <Clock className="w-3 h-3 mr-1" />
                Ready to upload
              </div>
            )}
          </div>
          
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {status === 'pending' && <Clock className="w-5 h-5 text-gray-400" />}
            {status === 'uploading' && <Loader className="w-5 h-5 text-blue-500 animate-spin" />}
            {status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderUploadedImage = (image) => {
    const ModalityIcon = MEDICAL_MODALITIES[image.modality]?.icon || FileImage;
    const modalityColor = MEDICAL_MODALITIES[image.modality]?.color || '#6B7280';
    
    return (
      <motion.div
        key={image.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        {/* Image Thumbnail */}
        <div className="relative">
          {image.thumbnail ? (
            <img
              src={image.thumbnail}
              alt={image.filename}
              className="w-full h-32 object-cover cursor-pointer"
              onClick={() => setSelectedImage(image)}
            />
          ) : (
            <div 
              className="w-full h-32 flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: `${modalityColor}20` }}
              onClick={() => setSelectedImage(image)}
            >
              <ModalityIcon 
                className="w-12 h-12" 
                style={{ color: modalityColor }} 
              />
            </div>
          )}
          
          {/* Overlay Actions */}
          <div className="absolute top-2 right-2 flex space-x-1">
            <button
              onClick={() => setSelectedImage(image)}
              className="bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-70 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeUploadedImage(image.id)}
              className="bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-70 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Uploaded
            </span>
          </div>
        </div>
        
        {/* Image Info */}
        <div className="p-3">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {image.filename}
          </h4>
          <div className="flex items-center justify-between mt-2">
            <span 
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              style={{ 
                backgroundColor: `${modalityColor}20`, 
                color: modalityColor 
              }}
            >
              <ModalityIcon className="w-3 h-3 mr-1" />
              {MEDICAL_MODALITIES[image.modality]?.label}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(image.uploadTime).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Modality Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Modality
            </label>
            <select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(MEDICAL_MODALITIES).map(([key, modality]) => (
                <option key={key} value={key}>
                  {modality.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Urgency Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level
            </label>
            <select
              value={metadata.urgency}
              onChange={(e) => setMetadata(prev => ({ ...prev, urgency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergent">Emergent</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        
        {/* Additional Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Part
            </label>
            <input
              type="text"
              value={metadata.body_part}
              onChange={(e) => setMetadata(prev => ({ ...prev, body_part: e.target.value }))}
              placeholder="e.g., chest, abdomen, head"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Position
            </label>
            <input
              type="text"
              value={metadata.view_position}
              onChange={(e) => setMetadata(prev => ({ ...prev, view_position: e.target.value }))}
              placeholder="e.g., PA, lateral, AP"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Laterality
            </label>
            <select
              value={metadata.laterality}
              onChange={(e) => setMetadata(prev => ({ ...prev, laterality: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="bilateral">Bilateral</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={metadata.description}
            onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Additional notes about this image..."
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100">
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <p className={`text-lg font-medium ${isDragActive ? 'text-blue-600' : 'text-gray-900'}`}>
              {isDragActive ? 'Drop files here' : 'Upload medical images'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Drag & drop files or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supports JPEG, PNG, TIFF, DICOM • Max {Math.round(maxFileSize / (1024 * 1024))}MB per file
            </p>
          </div>
        </div>
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Upload Queue ({uploadQueue.length})
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setUploadQueue([])}
                className="px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={uploadAllFiles}
                disabled={isUploading || uploadQueue.filter(item => item.status === 'pending').length === 0}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin inline" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2 inline" />
                    Upload All
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence>
              {uploadQueue.map(renderFileItem)}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Uploaded Images ({uploadedImages.length})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map(renderUploadedImage)}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium">{selectedImage.filename}</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-4">
                {selectedImage.thumbnail ? (
                  <img
                    src={selectedImage.thumbnail}
                    alt={selectedImage.filename}
                    className="max-w-full max-h-[60vh] mx-auto"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
                    <FileImage className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Modality:</span>{' '}
                    {MEDICAL_MODALITIES[selectedImage.modality]?.label}
                  </div>
                  <div>
                    <span className="font-medium">Upload Time:</span>{' '}
                    {new Date(selectedImage.uploadTime).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">File Size:</span>{' '}
                    {(selectedImage.originalFile.file.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                  <div>
                    <span className="font-medium">Image ID:</span>{' '}
                    {selectedImage.id}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedImageUpload;
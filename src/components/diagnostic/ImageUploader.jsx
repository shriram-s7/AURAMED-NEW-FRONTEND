import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileImage, CheckCircle } from 'lucide-react';
import styles from './ImageUploader.module.css';

const ImageUploader = ({ onImageSelected, label = "Upload Medical Scan" }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      onImageSelected(selectedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      alert("Invalid file type. Please upload an image file.");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = (e) => {
    e.preventDefault();
    setFile(null);
    setPreview(null);
    onImageSelected(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={styles.uploaderContainer}>
      <label className={styles.uploadLabel}>{label}</label>
      
      {!file ? (
        <label 
          htmlFor="dropzone-file" 
          className={`${styles.dropzone} ${dragActive ? styles.active : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className={styles.dropzoneContent}>
            <UploadCloud size={48} className={styles.uploadIcon} />
            <p className={styles.dropzoneText}>
              <span className={styles.highlight}>Click to upload</span> or drag and drop
            </p>
            <p className={styles.dropzoneHint}>PNG, JPG, DICOM (max. 10MB)</p>
          </div>
          <input 
            id="dropzone-file" 
            type="file" 
            className={styles.hiddenInput}
            accept="image/*"
            ref={inputRef}
            onChange={handleChange} 
          />
        </label>
      ) : (
        <div className={styles.previewContainer}>
          <button className={styles.removeBtn} onClick={removeFile}>
            <X size={16} />
          </button>
          
          {preview ? (
            <img src={preview} alt="Upload preview" className={styles.imagePreview} />
          ) : (
            <div className={styles.filePlaceholder}>
              <FileImage size={48} color="var(--color-text-secondary)" />
            </div>
          )}
          
          <div className={styles.fileMeta}>
            <CheckCircle size={16} className={styles.successIcon} />
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileSize}>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

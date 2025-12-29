'use client'

import { useCallback, useState, useRef } from 'react'
import { Card } from '../card'
import { Progress } from '../progress'
import { X, Upload, File as FileIcon, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '../button'
import { cn } from '@js-monorepo/ui/util'

export interface FileUploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export interface FileUploadProps {
  onUpload: (files: File[], onProgress?: (fileIndex: number, progress: number) => void) => Promise<void> | void
  accept?: Record<string, string[]>
  maxSize?: number // in bytes
  multiple?: boolean
  maxFiles?: number
  className?: string
  disabled?: boolean
  showPreview?: boolean
  autoClearOnSuccess?: boolean // Whether to automatically clear files after successful upload
  clearDelay?: number // Delay in ms before clearing files (only if autoClearOnSuccess is true)
}

export function FileUpload({
  onUpload,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  maxFiles = 5,
  className,
  disabled = false,
  showPreview = true,
  autoClearOnSuccess = false,
  clearDelay = 2000,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileUploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateFileId = () => Math.random().toString(36).substring(2, 9)

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const validateFile = (file: File): string | null => {
        if (maxSize && file.size > maxSize) {
          return `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`
        }
        if (accept) {
          const acceptedTypes = Object.values(accept).flat()
          const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
          const fileType = file.type
          const isAccepted =
            acceptedTypes.some((type) => type.includes(fileType)) ||
            acceptedTypes.some((type) => type.includes(fileExtension))
          if (!isAccepted) {
            return 'File type not accepted'
          }
        }
        return null
      }

      const fileArray = Array.from(fileList)
      const validFiles: FileUploadFile[] = []

      fileArray.forEach((file) => {
        const error = validateFile(file)
        if (error) {
          // Could show error notification here
          console.error(`File ${file.name}: ${error}`)
          return
        }

        validFiles.push({
          file,
          id: generateFileId(),
          progress: 0,
          status: 'pending',
        })
      })

      const newFiles = multiple ? [...files, ...validFiles].slice(0, maxFiles) : validFiles.slice(0, 1)

      setFiles(newFiles)
    },
    [files, multiple, maxFiles, maxSize, accept]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragActive(true)
      }
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)

      if (disabled) return

      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles)
      }
    },
    [disabled, handleFiles]
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles)
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (files.length === 0 || uploading) return

    setUploading(true)

    // Update all files to uploading status
    setFiles((prev) => prev.map((f) => ({ ...f, status: 'uploading' as const, progress: 0 })))

    try {
      const filesToUpload = files.map((f) => f.file)

      // Progress callback for individual file progress updates
      // Parent can call this with fileIndex (0-based) and progress (0-100)
      const onProgress = (fileIndex: number, progress: number) => {
        if (fileIndex >= 0 && fileIndex < files.length) {
          setFiles((prev) =>
            prev.map((f, idx) => {
              if (idx === fileIndex) {
                return { ...f, progress: Math.min(Math.max(progress, 0), 100) }
              }
              return f
            })
          )
        }
      }

      await onUpload(filesToUpload, onProgress)

      // Mark all as success
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: 'success' as const,
          progress: 100,
        }))
      )

      // Auto-clear files if enabled
      if (autoClearOnSuccess) {
        setTimeout(() => {
          setFiles([])
          setUploading(false)
        }, clearDelay)
      } else {
        setUploading(false)
      }
    } catch (error) {
      // Mark all as error
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Upload failed',
        }))
      )
      setUploading(false)
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusIcon = (status: FileUploadFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={16} className="text-status-success" />
      case 'error':
        return <AlertCircle size={16} className="text-destructive" />
      default:
        return <FileIcon size={16} className="text-muted-foreground" />
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
          isDragActive && !disabled ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept ? Object.values(accept).flat().join(',') : undefined}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        <div className="text-center">
          <Upload
            size={48}
            className={cn('mx-auto mb-4 transition-colors', isDragActive ? 'text-primary' : 'text-muted-foreground')}
          />
          <p className="text-sm font-medium mb-1">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-xs text-muted-foreground">
            Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB
            {accept && ` • Accepted: ${Object.keys(accept).join(', ')}`}
            {multiple && maxFiles > 1 && ` • Max ${maxFiles} files`}
          </p>
        </div>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileItem) => (
            <Card key={fileItem.id} className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getStatusIcon(fileItem.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{formatFileSize(fileItem.file.size)}</span>
                      {fileItem.status === 'uploading' && (
                        <span className="text-xs text-muted-foreground">• {fileItem.progress}%</span>
                      )}
                      {fileItem.error && <span className="text-xs text-destructive">{fileItem.error}</span>}
                    </div>
                    {fileItem.status === 'uploading' && <Progress value={fileItem.progress} className="mt-2 h-1" />}
                  </div>
                </div>
                {fileItem.status !== 'uploading' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(fileItem.id)
                    }}
                    disabled={uploading}
                    className="h-7 w-7 shrink-0"
                    aria-label="Remove file"
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {files.length > 0 && !uploading && files.every((f) => f.status !== 'uploading') && (
        <Button onClick={handleUpload} className="w-full" disabled={disabled}>
          Upload {files.length} {files.length === 1 ? 'file' : 'files'}
        </Button>
      )}
    </div>
  )
}

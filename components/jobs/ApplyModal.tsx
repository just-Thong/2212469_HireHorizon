'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { X, Upload, FileText, Loader2, CheckCircle2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
  onOpenAuth: () => void;
}

export function ApplyModal({ isOpen, onClose, jobId, jobTitle, companyName, onOpenAuth }: ApplyModalProps) {
  const { user, profile } = useAuthStore();
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Chỉ chấp nhận file PDF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File không được vượt quá 5MB');
      return;
    }
    setCvFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      onClose();
      onOpenAuth();
      return;
    }
    if (profile.role !== 'candidate') {
      toast.error('Chỉ ứng viên mới có thể nộp đơn');
      return;
    }
    if (!cvFile) {
      toast.error('Vui lòng tải lên CV của bạn');
      return;
    }

    setIsLoading(true);
    try {
      // Upload CV to Supabase Storage
      const fileName = `${user.id}/${jobId}/${Date.now()}_${cvFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, cvFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(uploadData.path);

      // Create application record
      const { error: appError } = await supabase.from('applications').insert({
        job_id: jobId,
        candidate_id: user.id,
        cv_url: publicUrl,
        cover_letter: coverLetter || null,
        status: 'pending',
      });

      if (appError) {
        if (appError.code === '23505') {
          toast.error('Bạn đã ứng tuyển vào công việc này rồi!');
          return;
        }
        throw appError;
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Nộp đơn thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCoverLetter('');
    setCvFile(null);
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-lg bg-background rounded-3xl shadow-2xl border z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="flex justify-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Nộp đơn thành công!</h2>
                <p className="text-muted-foreground mb-2">Đơn ứng tuyển của bạn đã được gửi tới</p>
                <p className="font-semibold text-primary mb-8">{companyName}</p>
                <Button className="w-full h-12 rounded-xl font-bold" onClick={handleClose}>
                  Đóng
                </Button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Ứng tuyển ngay</h2>
                    <p className="text-sm text-muted-foreground">{jobTitle} · {companyName}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  {/* CV Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      CV của bạn <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={cn(
                        'relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200',
                        isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30',
                        cvFile && 'border-green-500 bg-green-500/5'
                      )}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      />
                      {cvFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="h-8 w-8 text-green-500" />
                          <div className="text-left">
                            <p className="font-medium text-green-700 dark:text-green-400">{cvFile.name}</p>
                            <p className="text-xs text-muted-foreground">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="font-medium">Kéo thả hoặc click để tải CV</p>
                          <p className="text-xs text-muted-foreground mt-1">PDF · Tối đa 5MB</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Thư giới thiệu <span className="text-muted-foreground font-normal">(Tùy chọn)</span>
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Giới thiệu ngắn gọn về bản thân và lý do bạn phù hợp với vị trí này..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 text-white"
                    disabled={isLoading || !cvFile}
                  >
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" />Đang gửi...</>
                    ) : (
                      'Nộp đơn ứng tuyển'
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';
import { Briefcase, Eye, EyeOff, X, Building2, GraduationCap, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

type AuthMode = 'login' | 'register' | 'select-role';

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  const supabase = createClient();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setCompanyName('');
    setSelectedRole(null);
    setMode(defaultMode);
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error('Supabase chưa được cấu hình. Vui lòng điền .env.local');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Đăng nhập thành công!');
      handleClose();
      window.location.reload();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error('Supabase chưa được cấu hình. Vui lòng điền .env.local');
      return;
    }
    if (!selectedRole) {
      setMode('select-role');
      return;
    }
    if (selectedRole === 'recruiter' && !companyName.trim()) {
      toast.error('Vui lòng nhập tên công ty');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: selectedRole,
            company_name: selectedRole === 'recruiter' ? companyName : null,
          },
        },
      });
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: selectedRole,
          company_name: selectedRole === 'recruiter' ? companyName : null,
        });
        if (profileError && profileError.code !== '23505') {
          console.error('Profile creation error:', profileError);
        }
      }

      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');
      handleClose();
      window.location.reload();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-background rounded-3xl shadow-2xl border overflow-hidden z-10"
          >
            {/* Header gradient */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-8">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Briefcase className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold tracking-tight">HireHorizon</span>
              </div>

              {/* Mode: Select Role */}
              <AnimatePresence mode="wait">
                {mode === 'select-role' && (
                  <motion.div
                    key="select-role"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold mb-2">Bạn là ai?</h2>
                    <p className="text-muted-foreground mb-8">Chọn vai trò để tiếp tục đăng ký</p>

                    <div className="space-y-4 mb-8">
                      {/* Candidate card */}
                      <button
                        onClick={() => setSelectedRole('candidate')}
                        className={cn(
                          'w-full group p-5 rounded-2xl border-2 transition-all duration-200 text-left',
                          selectedRole === 'candidate'
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'h-14 w-14 rounded-xl flex items-center justify-center transition-colors',
                            selectedRole === 'candidate' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          )}>
                            <GraduationCap className="h-7 w-7" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-lg">Ứng viên</p>
                            <p className="text-sm text-muted-foreground">Tìm việc, nộp CV, theo dõi đơn ứng tuyển</p>
                          </div>
                          <ChevronRight className={cn(
                            'h-5 w-5 transition-all',
                            selectedRole === 'candidate' ? 'text-primary translate-x-1' : 'text-muted-foreground'
                          )} />
                        </div>
                      </button>

                      {/* Recruiter card */}
                      <button
                        onClick={() => setSelectedRole('recruiter')}
                        className={cn(
                          'w-full group p-5 rounded-2xl border-2 transition-all duration-200 text-left',
                          selectedRole === 'recruiter'
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'h-14 w-14 rounded-xl flex items-center justify-center transition-colors',
                            selectedRole === 'recruiter' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          )}>
                            <Building2 className="h-7 w-7" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-lg">Nhà tuyển dụng</p>
                            <p className="text-sm text-muted-foreground">Đăng tin, tìm kiếm & quản lý ứng viên</p>
                          </div>
                          <ChevronRight className={cn(
                            'h-5 w-5 transition-all',
                            selectedRole === 'recruiter' ? 'text-primary translate-x-1' : 'text-muted-foreground'
                          )} />
                        </div>
                      </button>
                    </div>

                    {/* Company name - only for recruiter */}
                    {selectedRole === 'recruiter' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-2">
                            Tên công ty <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="VD: FPT Software, Viettel..."
                            className="w-full h-12 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                      </motion.div>
                    )}

                    <div className="flex gap-3 mt-2">
                      <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-xl"
                        onClick={() => setMode('register')}
                      >
                        Quay lại
                      </Button>
                      <Button
                        className="flex-1 h-12 rounded-xl font-bold"
                        disabled={!selectedRole || isLoading}
                        onClick={handleRegister as unknown as React.MouseEventHandler}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hoàn tất đăng ký'}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Mode: Login */}
                {mode === 'login' && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold mb-2">Chào mừng trở lại!</h2>
                    <p className="text-muted-foreground mb-8">Đăng nhập để tiếp tục hành trình của bạn</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          className="w-full h-12 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Mật khẩu</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full h-12 px-4 pr-12 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 mt-2"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Đăng nhập'}
                      </Button>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-muted-foreground text-sm">
                        Chưa có tài khoản?{' '}
                        <button
                          onClick={() => setMode('register')}
                          className="text-primary font-semibold hover:underline"
                        >
                          Đăng ký ngay
                        </button>
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Mode: Register */}
                {mode === 'register' && (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold mb-2">Tạo tài khoản</h2>
                    <p className="text-muted-foreground mb-8">Chỉ mất vài giây để bắt đầu</p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setMode('select-role');
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium mb-2">Họ và tên</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nguyễn Văn A"
                          required
                          className="w-full h-12 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          className="w-full h-12 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Mật khẩu</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ít nhất 6 ký tự"
                            required
                            minLength={6}
                            className="w-full h-12 px-4 pr-12 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 mt-2"
                      >
                        Tiếp theo — Chọn vai trò
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-muted-foreground text-sm">
                        Đã có tài khoản?{' '}
                        <button
                          onClick={() => setMode('login')}
                          className="text-primary font-semibold hover:underline"
                        >
                          Đăng nhập
                        </button>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Warning banner when Supabase not configured */}
            {!isSupabaseConfigured && (
              <div className="bg-yellow-500/10 border-t border-yellow-500/20 px-6 py-3 flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  Supabase chưa được cấu hình —{' '}
                  <span className="font-mono font-bold">.env.local</span>{' '}
                  cần được điền để kích hoạt đăng nhập.
                </span>
              </div>
            )}
          </motion.div>
        </div>
        </>
      )}
    </AnimatePresence>
  );
}

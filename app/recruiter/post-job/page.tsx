'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Briefcase, MapPin, DollarSign, Tag, FileText, Building2, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';


const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
const JOB_CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Sales', 'Product', 'Customer Support', 'Other'];
const POPULAR_TAGS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'C#', '.NET', 'PHP', 'Go',
  'Vue', 'Angular', 'SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'GCP', 'Figma', 'UI/UX', 'Tailwind', 'Next.js', 'Express', 'Redis',
];

export default function PostJobPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    location: '',
    salary: '',
    type: 'Full-time',
    category: 'Engineering',
    description: '',
    requirements: '',
    responsibilities: '',
    tags: [] as string[],
    tagInput: '',
  });

  const supabase = createClient();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    const tag = form.tagInput.trim();
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag], tagInput: '' }));
    }
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || profile.role !== 'recruiter') {
      toast.error('Bạn cần đăng nhập với tư cách Nhà tuyển dụng');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('job_postings').insert({
        recruiter_id: user.id,
        company_name: profile.company_name || profile.full_name,
        title: form.title,
        location: form.location,
        salary: form.salary,
        type: form.type,
        category: form.category,
        description: form.description,
        requirements: form.requirements.split('\n').filter((r) => r.trim()),
        responsibilities: form.responsibilities.split('\n').filter((r) => r.trim()),
        tags: form.tags,
        status: 'active',
      });

      if (error) throw error;

      toast.success('Đăng tin tuyển dụng thành công!');
      router.push('/recruiter/dashboard');
      router.refresh(); // Force refresh to update jobs list and caches
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Đăng tin thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || profile?.role !== 'recruiter') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Chỉ dành cho Nhà tuyển dụng</h1>
            <p className="text-muted-foreground mb-6">Vui lòng đăng nhập với tài khoản Nhà tuyển dụng để đăng tin</p>
            <Button onClick={() => router.push('/')}>Về trang chủ</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Đăng tin tuyển dụng</h1>
                <p className="text-muted-foreground">Tìm ứng viên phù hợp cho công ty của bạn</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-background rounded-2xl border p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Thông tin cơ bản
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên vị trí <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="VD: Senior Frontend Developer"
                  required
                  className="w-full h-12 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Địa điểm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Hà Nội, Việt Nam"
                    required
                    className="w-full h-12 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" /> Mức lương
                  </label>
                  <input
                    type="text"
                    value={form.salary}
                    onChange={(e) => handleChange('salary', e.target.value)}
                    placeholder="15 - 30 triệu/tháng"
                    className="w-full h-12 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hình thức làm việc</label>
                  <select
                    value={form.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lĩnh vực</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  >
                    {JOB_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Job Detail Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-background rounded-2xl border p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Chi tiết công việc
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mô tả công việc <span className="text-red-500">*</span></label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Mô tả tổng quan về vị trí, môi trường làm việc..."
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Trách nhiệm <span className="text-xs text-muted-foreground font-normal">(mỗi dòng một trách nhiệm)</span>
                </label>
                <textarea
                  value={form.responsibilities}
                  onChange={(e) => handleChange('responsibilities', e.target.value)}
                  placeholder="- Phát triển tính năng mới&#10;- Review code cho đồng đội&#10;- Tham gia standup hàng ngày"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Yêu cầu <span className="text-xs text-muted-foreground font-normal">(mỗi dòng một yêu cầu)</span>
                </label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => handleChange('requirements', e.target.value)}
                  placeholder="- 2+ năm kinh nghiệm React&#10;- Thành thạo TypeScript&#10;- Có kinh nghiệm với Supabase"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none text-sm"
                />
              </div>
            </div>
          </motion.div>

          {/* Tags Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-background rounded-2xl border p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Tags kỹ năng
            </h2>
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${form.tags.includes(tag) ? 'bg-primary text-white border-primary' : 'bg-muted hover:bg-primary/10 border-border'}`}
                    onClick={() => {
                      if (form.tags.includes(tag)) {
                        removeTag(tag);
                      } else if (form.tags.length < 10) {
                        setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
                      }
                    }}
                    disabled={form.tags.length >= 10 && !form.tags.includes(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.tagInput}
                  onChange={(e) => handleChange('tagInput', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="VD: React, TypeScript, Node.js..."
                  className="flex-1 h-10 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                />
                <Button type="button" onClick={addTag} size="sm" className="h-10 px-4 rounded-xl">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Chọn tối đa 10 kỹ năng. Nếu không có trong danh sách, hãy nhập và nhấn "+"</p>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1.5 text-sm rounded-lg gap-1.5 flex items-center">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors ml-1" type="button">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="h-5 w-5 animate-spin mr-2" />Đang đăng tin...</>
              ) : (
                'Đăng tin tuyển dụng'
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

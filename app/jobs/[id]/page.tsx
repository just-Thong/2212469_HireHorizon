'use client';

import { useParams, useRouter } from 'next/navigation';
import { JOBS } from '@/data/jobs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, DollarSign, Clock, Heart, ArrowLeft, Share2, Globe, Building2, Briefcase, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useJobStore } from '@/store/useJobStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { ApplyModal } from '@/components/jobs/ApplyModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthStore } from '@/store/useAuthStore';
import { createClient } from '@/lib/supabase/client';
import { Job, JobType, JobCategory } from '@/types/job';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { savedJobIds, saveJob, removeJob } = useJobStore();
  const { user, profile } = useAuthStore();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [job, setJob] = useState<Job | null | undefined>(undefined); // undefined = loading, null = not found

  useEffect(() => {
    async function loadJob() {
      if (!id) { setJob(null); return; }

      // 1. Tìm trong mock data trước (nhanh)
      const mockJob = JOBS.find((j) => j.id === id);
      if (mockJob) { setJob(mockJob); return; }

      // 2. Nếu không có thì tìm trong Supabase
      const supabase = createClient();
      const { data } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setJob({
          id: data.id,
          title: data.title,
          companyName: data.company_name,
          companyLogo: data.company_logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&h=128&fit=crop',
          location: data.location,
          salary: data.salary || 'Thoả thuận',
          type: data.type as JobType,
          category: data.category as JobCategory,
          description: data.description,
          requirements: data.requirements || [],
          responsibilities: data.responsibilities || [],
          postedAt: data.created_at,
          tags: data.tags || [],
          isFeatured: data.is_featured,
        });
      } else {
        setJob(null);
      }
    }
    loadJob();
  }, [id]);

  const handleApplyClick = () => {
    if (!user) { setAuthModalOpen(true); return; }
    if (profile?.role !== 'candidate') {
      toast.error('Chỉ ứng viên mới có thể ứng tuyển công việc');
      return;
    }
    setApplyModalOpen(true);
  };

  // Loading state
  if (job === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not found
  if (job === null) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy công việc</h1>
        <Button onClick={() => router.push('/jobs')}>Quay lại danh sách</Button>
      </div>
    );
  }

  const isSaved = savedJobIds.includes(job.id);

  const toggleSave = () => {
    if (isSaved) {
      removeJob(job.id);
      toast.info('Đã xóa khỏi danh sách lưu');
    } else {
      saveJob(job.id);
      toast.success('Đã lưu công việc thành công!');
    }
  };

  const formattedDate = (() => {
    try { return new Date(job.postedAt).toLocaleDateString('vi-VN'); }
    catch { return job.postedAt; }
  })();

  return (
    <div className="bg-muted/30 min-h-screen pb-20">
      <div className="bg-background border-b py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-6 -ml-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại tìm kiếm
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-muted border-2 border-muted shadow-sm">
                <Image src={job.companyLogo} alt={job.companyName} fill className="object-cover" unoptimized />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    <span>{job.companyName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    <span>Website công ty</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSave}
                className={cn(
                  "rounded-xl h-12 w-12",
                  isSaved && "text-red-500 bg-red-50 border-red-100"
                )}
              >
                <Heart className={cn("h-5 w-5", isSaved && "fill-current")} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl h-12 w-12"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Đã sao chép liên kết!');
                }}
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button size="lg" className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20" onClick={handleApplyClick}>
                Ứng tuyển ngay
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-2xl border-none shadow-sm">
              <CardContent className="p-8">
                <section className="mb-10">
                  <h2 className="text-xl font-bold mb-4">Mô tả công việc</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                    {job.description}
                  </p>
                </section>

                {job.responsibilities.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-xl font-bold mb-4">Trách nhiệm chính</h2>
                    <ul className="space-y-3">
                      {job.responsibilities.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-muted-foreground text-lg">
                          <div className="mt-2.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {job.requirements.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold mb-4">Yêu cầu công việc</h2>
                    <ul className="space-y-3">
                      {job.requirements.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-muted-foreground text-lg">
                          <div className="mt-2.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
              <div className="bg-primary/5 p-6 border-b border-primary/10">
                <h3 className="font-bold text-lg">Tổng quan công việc</h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Mức lương</p>
                    <p className="font-bold text-green-600 dark:text-green-400">{job.salary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Loại hình</p>
                    <p className="font-bold">{job.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Ngày đăng</p>
                    <p className="font-bold">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Danh mục</p>
                    <p className="font-bold">{job.category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {job.tags.length > 0 && (
              <Card className="rounded-2xl border-none shadow-sm p-6">
                <h3 className="font-bold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm rounded-lg">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            <Button className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/10" onClick={handleApplyClick}>
              Ứng tuyển nhanh
            </Button>

            <ApplyModal
              isOpen={applyModalOpen}
              onClose={() => setApplyModalOpen(false)}
              jobId={job.id}
              jobTitle={job.title}
              companyName={job.companyName}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}

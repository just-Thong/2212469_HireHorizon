'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import { FileText, Loader2, Clock, CheckCircle, XCircle, Eye, User2, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MyApplication {
  id: string;
  job_id: string;
  status: string;
  applied_at: string;
  cv_url: string;
  cover_letter?: string;
  job_title?: string;
  company_name?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  reviewing: 'bg-blue-500/10 text-blue-600 border-blue-200',
  accepted: 'bg-green-500/10 text-green-600 border-green-200',
  rejected: 'bg-red-500/10 text-red-600 border-red-200',
};

const statusLabels: Record<string, string> = {
  pending: 'Chờ xem xét',
  reviewing: 'Đang xem xét',
  accepted: 'Đã chấp nhận',
  rejected: 'Không phù hợp',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  reviewing: <Eye className="h-4 w-4" />,
  accepted: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
};

export default function CandidateDashboard() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuthStore();
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (isLoading) return;
    if (!user || profile?.role !== 'candidate') {
      router.replace('/');
    }
  }, [user, profile, isLoading, router]);

  useEffect(() => {
    if (isLoading || !user || profile?.role !== 'candidate') return;

    const fetchApplications = async () => {
      setIsFetching(true);
      try {
        const { data } = await supabase
          .from('applications')
          .select(`
            id,
            job_id,
            status,
            applied_at,
            cv_url,
            cover_letter,
            job_postings(title, company_name)
          `)
          .eq('candidate_id', user.id)
          .order('applied_at', { ascending: false });

        const formatted = (data || []).map((a: unknown) => {
          const app = a as {
            id: string;
            job_id: string;
            status: string;
            applied_at: string;
            cv_url: string;
            cover_letter?: string;
            job_postings: { title: string; company_name: string } | null;
          };
          return {
            id: app.id,
            job_id: app.job_id,
            status: app.status,
            applied_at: app.applied_at,
            cv_url: app.cv_url,
            cover_letter: app.cover_letter,
            job_title: app.job_postings?.title || 'N/A',
            company_name: app.job_postings?.company_name || 'N/A',
          };
        });
        setApplications(formatted);
      } finally {
        setIsFetching(false);
      }
    };

    fetchApplications();
  }, [user, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <User2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hồ sơ ứng viên</h1>
                <p className="text-muted-foreground">
                  Xin chào, <span className="font-medium text-foreground">{profile?.full_name}</span>
                </p>
              </div>
            </div>
            <Link href="/candidate/cv-builder">
              <Button className="gap-2 h-10 rounded-xl shadow-sm">
                <FileText className="h-4 w-4" />
                Tạo CV
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Đã ứng tuyển', value: stats.total, icon: FileText, color: 'text-primary bg-primary/10' },
            { label: 'Đang chờ', value: stats.pending, icon: Clock, color: 'text-yellow-600 bg-yellow-500/10' },
            { label: 'Được chấp nhận', value: stats.accepted, icon: CheckCircle, color: 'text-green-600 bg-green-500/10' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-background rounded-2xl border p-6 shadow-sm"
            >
              <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-3xl font-extrabold mb-1">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-background rounded-2xl border shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Đơn ứng tuyển của tôi
            </h2>
            <Link href="/jobs">
              <button className="text-sm text-primary hover:underline font-medium">Tìm việc mới</button>
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium mb-2">Bạn chưa ứng tuyển công việc nào</p>
              <p className="text-muted-foreground text-sm mb-6">Khám phá hàng trăm cơ hội việc làm phù hợp</p>
              <Link href="/jobs">
                <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
                  Tìm việc ngay
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {applications.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="p-5 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{app.job_title}</p>
                      <p className="text-sm text-muted-foreground">{app.company_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Nộp ngày: {new Date(app.applied_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border ${statusColors[app.status]}`}>
                        {statusIcons[app.status]}
                        {statusLabels[app.status]}
                      </span>
                      <a
                        href={app.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Xem CV
                      </a>
                    </div>
                  </div>
                  {app.cover_letter && (
                    <p className="text-sm text-muted-foreground bg-muted/40 rounded-xl p-3 mt-3 line-clamp-2">
                      {app.cover_letter}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

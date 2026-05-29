'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import { Briefcase, Users, Eye, Loader2, Plus, Building2, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface JobPosting {
  id: string;
  title: string;
  location: string;
  type: string;
  status: string;
  created_at: string;
  application_count?: number;
}

interface ApplicationForRecruiter {
  id: string;
  job_title: string;
  candidate_name: string;
  candidate_email: string;
  status: string;
  applied_at: string;
  cv_url: string;
  cover_letter?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  reviewing: 'bg-blue-500/10 text-blue-600',
  accepted: 'bg-green-500/10 text-green-600',
  rejected: 'bg-red-500/10 text-red-600',
};

const statusLabels: Record<string, string> = {
  pending: 'Chờ duyệt',
  reviewing: 'Đang xem xét',
  accepted: 'Chấp nhận',
  rejected: 'Từ chối',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  reviewing: <Eye className="h-3.5 w-3.5" />,
  accepted: <CheckCircle className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
};

export default function RecruiterDashboard() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuthStore();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<ApplicationForRecruiter[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Only redirect after auth has finished loading
    if (isLoading) return;
    if (!user || profile?.role !== 'recruiter') {
      router.replace('/');
    }
  }, [user, profile, isLoading, router]);

  useEffect(() => {
    // Wait for auth to settle before fetching
    if (isLoading || !user || profile?.role !== 'recruiter') return;

    const fetchData = async () => {
      setIsFetching(true);
      try {
        const { data: jobsData } = await supabase
          .from('job_postings')
          .select('*')
          .eq('recruiter_id', user.id)
          .order('created_at', { ascending: false });

        setJobs(jobsData || []);

        if (jobsData && jobsData.length > 0) {
          const jobIds = jobsData.map((j) => j.id);
          const { data: appsData } = await supabase
            .from('applications')
            .select(`
              id,
              status,
              applied_at,
              cv_url,
              cover_letter,
              job_postings(title),
              profiles(full_name, email)
            `)
            .in('job_id', jobIds)
            .order('applied_at', { ascending: false });

          const formatted = (appsData || []).map((a: unknown) => {
            const app = a as {
              id: string;
              status: string;
              applied_at: string;
              cv_url: string;
              cover_letter?: string;
              job_postings: { title: string } | null;
              profiles: { full_name: string; email: string } | null;
            };
            return {
              id: app.id,
              status: app.status,
              applied_at: app.applied_at,
              cv_url: app.cv_url,
              cover_letter: app.cover_letter,
              job_title: app.job_postings?.title || 'N/A',
              candidate_name: app.profiles?.full_name || 'Ứng viên',
              candidate_email: app.profiles?.email || '',
            };
          });
          setApplications(formatted);
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [user, profile, isLoading, supabase]);

  const updateApplicationStatus = async (appId: string, status: string) => {
    setUpdatingId(appId);
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', appId);
    if (!error) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status } : a))
      );
    }
    setUpdatingId(null);
  };

  // Block render only while auth state is unknown
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Nhà tuyển dụng</h1>
              <p className="text-muted-foreground">
                Xin chào, <span className="font-medium text-foreground">{profile?.company_name || profile?.full_name}</span>
              </p>
            </div>
            <Link href="/recruiter/post-job">
              <Button className="h-11 px-6 rounded-xl font-semibold shadow-lg shadow-primary/20 gap-2">
                <Plus className="h-4 w-4" />
                Đăng tin mới
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Tin tuyển dụng', value: jobs.length, icon: Briefcase, color: 'text-primary bg-primary/10' },
            { label: 'Đơn ứng tuyển', value: applications.length, icon: Users, color: 'text-purple-600 bg-purple-500/10' },
            { label: 'Chờ xem xét', value: applications.filter((a) => a.status === 'pending').length, icon: AlertCircle, color: 'text-yellow-600 bg-yellow-500/10' },
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

        {/* My Job Postings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-background rounded-2xl border shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Tin tuyển dụng của tôi
            </h2>
          </div>
          {jobs.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Bạn chưa đăng tin tuyển dụng nào</p>
              <Link href="/recruiter/post-job">
                <Button className="mt-4 rounded-xl">Đăng tin ngay</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {jobs.map((job) => (
                <div key={job.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-semibold">{job.title}</p>
                    <p className="text-sm text-muted-foreground">{job.location} · {job.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="rounded-lg">
                      {job.status === 'active' ? 'Đang hiển thị' : 'Đã đóng'}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-background rounded-2xl border shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Đơn ứng tuyển ({applications.length})
            </h2>
          </div>
          {applications.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có đơn ứng tuyển nào</p>
            </div>
          ) : (
            <div className="divide-y">
              {applications.map((app) => (
                <div key={app.id} className="p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{app.candidate_name}</p>
                      <p className="text-sm text-muted-foreground">{app.candidate_email}</p>
                      <p className="text-xs text-muted-foreground mt-1">Ứng tuyển: {app.job_title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg ${statusColors[app.status]}`}>
                        {statusIcons[app.status]}
                        {statusLabels[app.status]}
                      </span>
                      <a
                        href={app.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline text-primary hover:opacity-80"
                      >
                        Xem CV
                      </a>
                    </div>
                  </div>
                  {app.cover_letter && (
                    <p className="text-sm text-muted-foreground bg-muted/40 rounded-xl p-3 line-clamp-2">
                      {app.cover_letter}
                    </p>
                  )}
                  <div className="flex gap-2">
                    {['reviewing', 'accepted', 'rejected'].map((s) => (
                      <Button
                        key={s}
                        variant={app.status === s ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 text-xs rounded-lg"
                        disabled={app.status === s || updatingId === app.id}
                        onClick={() => updateApplicationStatus(app.id, s)}
                      >
                        {updatingId === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : statusLabels[s]}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

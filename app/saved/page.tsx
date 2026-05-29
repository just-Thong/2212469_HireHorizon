'use client';

import { JOBS } from '@/data/jobs';
import JobCard from '@/components/jobs/JobCard';
import { useJobStore } from '@/store/useJobStore';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Heart, Briefcase, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Job, JobType, JobCategory } from '@/types/job';

export default function SavedJobsPage() {
  const { savedJobIds } = useJobStore();
  const [mounted, setMounted] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  useEffect(() => {
    async function loadSavedJobs() {
      // Load from static
      const staticSaved = JOBS.filter((job) => savedJobIds.includes(job.id));
      
      // Load from DB
      const supabase = createClient();
      const { data } = await supabase
        .from('job_postings')
        .select('*')
        .in('id', savedJobIds);

      let dbSaved: Job[] = [];
      if (data) {
        dbSaved = data.map(job => ({
          id: job.id,
          title: job.title,
          companyName: job.company_name,
          companyLogo: job.company_logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&h=128&fit=crop',
          location: job.location,
          salary: job.salary || 'Thoả thuận',
          type: job.type as JobType,
          category: job.category as JobCategory,
          description: job.description,
          requirements: job.requirements || [],
          responsibilities: job.responsibilities || [],
          postedAt: job.created_at,
          tags: job.tags || [],
          isFeatured: job.is_featured,
        }));
      }

      setSavedJobs([...staticSaved, ...dbSaved]);
      setMounted(true);
    }
    
    if (savedJobIds.length > 0) {
      loadSavedJobs();
    } else {
      setSavedJobs([]);
      setMounted(true);
    }
  }, [savedJobIds]);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-20 min-h-screen">
        <div className="animate-pulse space-y-8">
          <div className="h-10 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Việc làm đã lưu</h1>
          <p className="text-muted-foreground">
            {savedJobs.length} {savedJobs.length === 1 ? 'việc làm' : 'việc làm'} đã lưu để xem sau
          </p>
        </div>

        {savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border rounded-3xl bg-muted/20">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Chưa có việc làm nào được lưu</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              Nhấp vào biểu tượng trái tim trên bất kỳ thẻ việc làm nào để lưu lại xem sau. Bắt đầu tìm kiếm ngay!
            </p>
            <Link href="/jobs" className={cn(buttonVariants({ size: "lg" }), "rounded-xl px-8 flex items-center gap-2")}>
              Xem tất cả việc làm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

import Hero from '@/components/home/Hero';
import JobCard from '@/components/jobs/JobCard';
import { JOBS } from '@/data/jobs';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle2, Zap, ShieldCheck, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Job, JobType, JobCategory } from '@/types/job';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: dbJobs } = await supabase.from('job_postings').select('*').eq('status', 'active');
  
  let formattedJobs: Job[] = [];
  if (dbJobs) {
    formattedJobs = dbJobs.map(job => ({
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
      isFeatured: true, // Thúc đẩy việc làm thật lên trang chủ
    }));
  }

  const allJobs = [...formattedJobs, ...JOBS];
  const featuredJobs = allJobs.filter(job => job.isFeatured).slice(0, 3);

  return (
    <div className="flex flex-col gap-20 pb-20">
      <Hero />

      {/* Featured Jobs Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Việc làm nổi bật</h2>
            <p className="text-muted-foreground">Những cơ hội nghề nghiệp tốt nhất từ các đối tác hàng đầu.</p>
          </div>
          <Link href="/jobs" className={cn(buttonVariants({ variant: "outline" }), "hidden sm:flex group gap-2")}>
            Xem tất cả việc làm
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        <div className="mt-10 sm:hidden">
          <Link href="/jobs" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
            Xem tất cả việc làm
          </Link>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Tại sao các chuyên gia chọn HireHorizon</h2>
            <p className="text-muted-foreground">
              Chúng tôi cung cấp các công cụ và kết nối bạn cần để thực hiện bước nhảy vọt trong sự nghiệp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: 'Ứng tuyển nhanh',
                desc: 'Ứng tuyển chỉ với một cú nhấp chuột bằng hồ sơ của bạn.'
              },
              {
                icon: ShieldCheck,
                title: 'Tin đăng uy tín',
                desc: 'Mọi bài đăng đều được kiểm duyệt thủ công để đảm bảo an toàn.'
              },
              {
                icon: CheckCircle2,
                title: 'Thông báo thời gian thực',
                desc: 'Nhận thông báo ngay khi có việc làm mới phù hợp với hồ sơ.'
              },
              {
                icon: Trophy,
                title: 'Công ty hàng đầu',
                desc: 'Tiếp cận trực tiếp với các nhà tuyển dụng tại các tập đoàn lớn.'
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-card rounded-2xl border hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-16 md:px-12 md:py-20 text-primary-foreground text-center">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-white/10 blur-[100px] rounded-full" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Sẵn sàng cho thử thách mới?</h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10">
              Tham gia cùng hàng ngàn chuyên gia đã tìm thấy công việc mơ ước của họ thông qua HireHorizon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "font-bold px-8 h-14 rounded-xl")}>
                Bắt đầu ngay
              </Link>
              <Button size="lg" variant="outline" className="bg-transparent border-white/20 hover:bg-white/10 text-white font-bold px-8 h-14 rounded-xl">
                Đăng tin tuyển dụng
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

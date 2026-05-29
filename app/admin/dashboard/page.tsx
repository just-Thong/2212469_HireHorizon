import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Users, Briefcase, FileText, Activity, LayoutDashboard, Settings, UserCheck, BarChart3, AlertCircle, Wrench, Search, Plus, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { JOBS } from '@/data/jobs';
import { DeleteJobButton } from '@/components/admin/DeleteJobButton';

export const metadata = {
  title: 'Admin Dashboard | HireHorizon',
  description: 'Quản trị hệ thống HireHorizon',
};

// Dữ liệu mẫu bổ sung để giao diện trông sinh động hơn
const MOCK_USERS = [
  { id: 'm1', full_name: 'Nguyễn Văn An', email: 'nguyenvan.an@example.com', role: 'candidate', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'm2', full_name: 'Trần Thị Bích', email: 'bich.tran@example.com', role: 'recruiter', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'm3', full_name: 'Lê Hoàng Cường', email: 'cuong.le@example.com', role: 'candidate', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 'm4', full_name: 'Phạm Đức Duy', email: 'duy.pham@example.com', role: 'candidate', created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: 'm5', full_name: 'Công ty TechCorp', email: 'hr@techcorp.vn', role: 'recruiter', created_at: new Date(Date.now() - 345600000).toISOString() },
  { id: 'm6', full_name: 'Hoàng Minh', email: 'minh.hoang@example.com', role: 'candidate', created_at: new Date(Date.now() - 400000000).toISOString() },
];

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  const resolvedParams = await searchParams;
  const tab = (resolvedParams.tab as string) || 'overview';

  // Fetch real data
  const [
    { count: dbUserCount }, 
    { count: dbJobCount }, 
    { count: dbApplicationCount },
    { data: recentDbUsers },
    { data: dbJobs }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('job_postings').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('job_postings').select('*').order('created_at', { ascending: false })
  ]);

  const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('vi-VN'); }
    catch { return iso; }
  };

  // Kết hợp dữ liệu thật và dữ liệu giả (Mock Data)
  const totalUserCount = (dbUserCount || 0) + MOCK_USERS.length;
  const totalJobCount = (dbJobCount || 0) + JOBS.length;
  const totalApplicationCount = (dbApplicationCount || 0) + 156; // Mock 156 CVs applied to the mock jobs
  
  const combinedUsers = [...(recentDbUsers || []), ...MOCK_USERS].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  const overviewUsers = combinedUsers.slice(0, 5);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-muted/30">
      {/* Admin Sidebar */}
      <aside className="w-64 hidden lg:block border-r bg-card min-h-[calc(100vh-4rem)] sticky top-16">
        <div className="p-6">
          <h2 className="text-lg font-bold tracking-tight mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Admin Panel
          </h2>
          <nav className="space-y-1">
            <Link href="/admin/dashboard?tab=overview" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors", tab === 'overview' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <LayoutDashboard className="h-4 w-4" />
              Tổng quan
            </Link>
            <Link href="/admin/dashboard?tab=users" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors", tab === 'users' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <Users className="h-4 w-4" />
              Người dùng
            </Link>
            <Link href="/admin/dashboard?tab=jobs" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors", tab === 'jobs' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <Briefcase className="h-4 w-4" />
              Tin tuyển dụng
            </Link>
            <Link href="/admin/dashboard?tab=reports" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors", tab === 'reports' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <BarChart3 className="h-4 w-4" />
              Báo cáo
            </Link>
            <Link href="/admin/dashboard?tab=settings" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors", tab === 'settings' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <Settings className="h-4 w-4" />
              Cài đặt
            </Link>
          </nav>
        </div>
        <div className="absolute bottom-4 px-6 w-full">
          <div className="p-4 bg-muted rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold">Hệ thống ổn định</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Phiên bản 1.0.0-beta</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {tab === 'overview' && (
          <>
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Bảng điều khiển</h1>
                <p className="text-muted-foreground mt-1 text-sm">Quản lý và giám sát toàn bộ hoạt động của HireHorizon.</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                Tải báo cáo <BarChart3 className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tổng người dùng</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalUserCount}</div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    Tài khoản đã đăng ký
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tin tuyển dụng</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalJobCount}</div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    Việc làm đang hoạt động
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Lượt ứng tuyển</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalApplicationCount}</div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    Hồ sơ đã nộp thành công
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-primary">Cảnh báo hệ thống</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">0</div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    Mọi dịch vụ hoạt động tốt
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              {/* Recent Users Table */}
              <Card className="lg:col-span-4 border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Người dùng mới nhất</CardTitle>
                    <CardDescription>Danh sách tài khoản vừa đăng ký trên hệ thống.</CardDescription>
                  </div>
                  <Link href="/admin/dashboard?tab=users" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-primary")}>
                    Xem tất cả
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {overviewUsers.length > 0 ? overviewUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground uppercase">
                            {u.full_name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{u.full_name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap",
                            u.role === 'admin' ? "bg-purple-500/10 text-purple-600" :
                            u.role === 'recruiter' ? "bg-blue-500/10 text-blue-600" : "bg-green-500/10 text-green-600"
                          )}>
                            {u.role === 'admin' ? 'Quản trị viên' : u.role === 'recruiter' ? 'Nhà tuyển dụng' : 'Ứng viên'}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Chưa có người dùng nào trên hệ thống.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Actions */}
              <Card className="lg:col-span-3 border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Thao tác nhanh</CardTitle>
                  <CardDescription>Các công cụ quản trị thường dùng.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/admin/dashboard?tab=users" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start h-12")}>
                    <UserCheck className="mr-2 h-4 w-4" /> Duyệt hồ sơ nhà tuyển dụng
                  </Link>
                  <Link href="/admin/dashboard?tab=jobs" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start h-12")}>
                    <Briefcase className="mr-2 h-4 w-4" /> Kiểm duyệt tin tuyển dụng
                  </Link>
                  <Link href="/admin/dashboard?tab=settings" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start h-12")}>
                    <Settings className="mr-2 h-4 w-4" /> Cấu hình email template
                  </Link>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {tab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Quản lý người dùng</h1>
                <p className="text-muted-foreground mt-1 text-sm">Xem và quản lý tất cả tài khoản ứng viên, nhà tuyển dụng.</p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
              </Button>
            </div>

            <Card className="border-border/50 shadow-sm">
              <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm theo tên, email..." 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                  />
                </div>
                <div className="text-sm text-muted-foreground">Tổng cộng {combinedUsers.length} tài khoản</div>
              </div>
              <div className="divide-y">
                {combinedUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground uppercase">
                        {u.full_name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.full_name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden md:block text-xs text-muted-foreground w-24">
                        {new Date(u.created_at).toLocaleDateString('vi-VN')}
                      </div>
                      <span className={cn(
                        "text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap w-24 text-center",
                        u.role === 'admin' ? "bg-purple-500/10 text-purple-600" :
                        u.role === 'recruiter' ? "bg-blue-500/10 text-blue-600" : "bg-green-500/10 text-green-600"
                      )}>
                        {u.role === 'admin' ? 'Quản trị viên' : u.role === 'recruiter' ? 'Nhà tuyển dụng' : 'Ứng viên'}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === 'jobs' && (() => {
          // Combine real DB jobs + mock jobs
          const dbJobList = (dbJobs || []).map((job: { id: string; title: string; company_name: string; location: string; salary: string; type: string; status: string; created_at: string; is_featured: boolean }) => ({
            id: job.id,
            title: job.title,
            company: job.company_name,
            logo: null as string | null,
            location: job.location,
            salary: job.salary || 'Thoả thuận',
            type: job.type,
            status: job.status,
            postedAt: fmtDate(job.created_at),
            isReal: true,
          }));
          const mockJobList = JOBS.map(job => ({
            id: job.id,
            title: job.title,
            company: job.companyName,
            logo: job.companyLogo,
            location: job.location,
            salary: job.salary,
            type: job.type,
            status: 'active',
            postedAt: (() => { try { return new Date(job.postedAt).toLocaleDateString('vi-VN'); } catch { return job.postedAt; } })(),
            isReal: false,
          }));
          const allJobList = [...dbJobList, ...mockJobList];
          return (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Quản lý Tin tuyển dụng</h1>
                  <p className="text-muted-foreground mt-1 text-sm">Kiểm duyệt và quản lý các cơ hội việc làm trên nền tảng.</p>
                </div>
              </div>

              <Card className="border-border/50 shadow-sm">
                <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo công ty, vị trí..."
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">Tổng cộng {allJobList.length} tin đăng</div>
                </div>
                <div className="divide-y">
                  {allJobList.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg border flex items-center justify-center p-2 bg-white overflow-hidden">
                          {job.logo ? (
                            <img src={job.logo} alt={job.company} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-primary">{job.title}</p>
                            {job.isReal && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-medium">Mới</span>}
                          </div>
                          <p className="text-xs text-muted-foreground font-medium">{job.company}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{job.location} • {job.salary} • {job.postedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap border",
                          job.status === 'active' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-gray-500/10 text-gray-600 border-gray-500/20"
                        )}>
                          {job.status === 'active' ? 'Đang hoạt động' : 'Đã đóng'}
                        </span>
                        <div className="flex gap-2">
                          <Link href={`/jobs/${job.id}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-8 text-xs')}>Xem chi tiết</Link>
                          <DeleteJobButton jobId={job.id} isReal={job.isReal} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          );
        })()}

        {['reports', 'settings'].includes(tab) && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 mt-20">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Wrench className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Tính năng đang phát triển</h2>
            <p className="text-muted-foreground max-w-md">
              Chuyên mục <strong>{tab === 'reports' ? 'Báo cáo' : 'Cài đặt hệ thống'}</strong> hiện đang được xây dựng và sẽ sớm ra mắt trong phiên bản tiếp theo.
            </p>
            <Link href="/admin/dashboard?tab=overview" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
              Quay lại Tổng quan
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

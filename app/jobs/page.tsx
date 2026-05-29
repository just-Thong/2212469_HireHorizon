'use client';

import { JOBS } from '@/data/jobs';
import JobCard from '@/components/jobs/JobCard';
import FilterSidebar from '@/components/jobs/FilterSidebar';
import { Input } from '@/components/ui/input';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { useJobStore } from '@/store/useJobStore';
import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Job, JobType, JobCategory } from '@/types/job';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const JOBS_PER_PAGE = 4;

export default function JobsPage() {
  const { filters, setFilters } = useJobStore();
  const [localQuery, setLocalQuery] = useState(filters.query);
  const [localLocation, setLocalLocation] = useState(filters.location);
  const [currentPage, setCurrentPage] = useState(1);
  const [dbJobs, setDbJobs] = useState<Job[]>([]);

  useEffect(() => {
    async function loadJobs() {
      const supabase = createClient();
      const { data } = await supabase.from('job_postings').select('*').eq('status', 'active');
      
      if (data) {
        const formattedJobs: Job[] = data.map(job => ({
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
        setDbJobs(formattedJobs);
      }
    }
    loadJobs();
  }, []);

  const combinedJobs = useMemo(() => {
    const parseDate = (d: string) => {
      if (d === 'Vừa xong') return Date.now();
      if (d.includes('ngày trước')) {
        const days = parseInt(d.split(' ')[0]);
        return Date.now() - (isNaN(days) ? 0 : days * 86400000);
      }
      const time = new Date(d).getTime();
      return isNaN(time) ? 0 : time;
    };
    return [...dbJobs, ...JOBS].sort((a, b) => parseDate(b.postedAt) - parseDate(a.postedAt));
  }, [dbJobs]);

  const filteredJobs = useMemo(() => {
    return combinedJobs.filter((job) => {
      const matchesQuery =
        job.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        job.companyName.toLowerCase().includes(filters.query.toLowerCase());
      const matchesLocation = job.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesCategory = filters.category.length === 0 || filters.category.includes(job.category);
      const matchesType = filters.type.length === 0 || filters.type.includes(job.type);

      return matchesQuery && matchesLocation && matchesCategory && matchesType;
    });
  }, [combinedJobs, filters]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  const handleSearch = () => {
    setFilters({ query: localQuery, location: localLocation });
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col gap-8">
        {/* Search Header */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Tìm kiếm việc làm</h1>
            <p className="text-muted-foreground">
              {filteredJobs.length} việc làm được tìm thấy phù hợp với tiêu chí của bạn
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tên công việc hoặc công ty..."
                className="pl-10"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Địa điểm..."
                className="pl-10"
                value={localLocation}
                onChange={(e) => setLocalLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="md:w-32">
              Tìm kiếm
            </Button>
            
            {/* Mobile Filter Trigger */}
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="icon" className="md:hidden"><SlidersHorizontal className="h-4 w-4" /></Button>} />
              <SheetContent side="left" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Bộ lọc</SheetTitle>
                </SheetHeader>
                <div className="py-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 p-6 border rounded-2xl bg-card">
              <FilterSidebar />
            </div>
          </aside>

          {/* Job List */}
          <div className="lg:col-span-3">
            {filteredJobs.length > 0 ? (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); if(currentPage > 1) setCurrentPage(currentPage - 1); }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); if(currentPage < totalPages) setCurrentPage(currentPage + 1); }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-muted/20">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Không tìm thấy việc làm</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Chúng tôi không tìm thấy bất kỳ việc làm nào phù hợp với bộ lọc hiện tại của bạn. Hãy thử điều chỉnh tìm kiếm hoặc đặt lại bộ lọc.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => {
                  setLocalQuery('');
                  setLocalLocation('');
                  setFilters({ query: '', location: '', category: [], type: [] });
                }}>
                  Đặt lại tất cả bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

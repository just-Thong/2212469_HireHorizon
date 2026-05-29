'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase, TrendingUp, Users, Globe } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJobStore } from '@/store/useJobStore';
import { motion } from 'framer-motion';

export default function Hero() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();
  const setFilters = useJobStore((state) => state.setFilters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ query, location });
    router.push('/jobs');
  };

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-background">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <TrendingUp className="h-4 w-4" />
            <span>Hơn 10,000+ việc làm mới được đăng tuần này</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-muted-foreground">
            Tìm Kiếm Sự Nghiệp Mơ Ước <br className="hidden md:block" /> Tại HireHorizon
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Nền tảng tìm việc hiện đại nhất thế giới. Kết nối với các công ty hàng đầu như Google, Meta và Netflix.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row items-center gap-3 p-3 bg-card border rounded-2xl shadow-xl md:shadow-2xl"
          >
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Tên công việc, từ khóa..."
                className="pl-12 h-14 border-none bg-transparent focus-visible:ring-0 text-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-border" />
            <div className="relative flex-1 w-full">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Địa điểm (vd: Từ xa)"
                className="pl-12 h-14 border-none bg-transparent focus-visible:ring-0 text-lg"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-14 px-8 w-full md:w-auto rounded-xl text-lg font-bold">
              Tìm việc ngay
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>2M+ Người dùng tích cực</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>150+ Quốc gia</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>50k+ Công ty</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

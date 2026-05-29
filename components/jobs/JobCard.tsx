'use client';

import { Job } from '@/types/job';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Clock, Heart, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useJobStore } from '@/store/useJobStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const { savedJobIds, saveJob, removeJob } = useJobStore();
  const isSaved = savedJobIds.includes(job.id);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) {
      removeJob(job.id);
      toast.info('Đã xóa khỏi danh sách lưu');
    } else {
      saveJob(job.id);
      toast.success('Đã lưu công việc thành công!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/jobs/${job.id}`}>
        <Card className="overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted border">
                  <Image
                    src={job.companyLogo}
                    alt={job.companyName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                    {job.title}
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium">{job.companyName}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSave}
                className={cn(
                  "rounded-full transition-colors",
                  isSaved ? "text-red-500 hover:text-red-600 bg-red-50" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                )}
              >
                <Heart className={cn("h-5 w-5", isSaved && "fill-current")} />
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                <DollarSign className="h-4 w-4" />
                <span>{job.salary}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>
                  {(() => {
                    if (job.postedAt.includes('T')) {
                      try {
                        return new Date(job.postedAt).toLocaleDateString('vi-VN');
                      } catch {
                        return job.postedAt;
                      }
                    }
                    return job.postedAt;
                  })()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="secondary" className="font-medium text-xs">
                {job.type}
              </Badge>
              <Badge variant="outline" className="font-medium text-xs">
                {job.category}
              </Badge>
              {job.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="ghost" className="font-normal text-xs bg-muted/50">
                  {tag}
                </Badge>
              ))}
              {job.tags.length > 3 && (
                <Badge variant="ghost" className="font-normal text-xs bg-muted/50">
                  +{job.tags.length - 3} more
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="px-6 py-4 border-t bg-muted/30 group-hover:bg-primary/5 transition-colors">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Chi tiết công việc
              </span>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}

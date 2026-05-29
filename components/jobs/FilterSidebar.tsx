'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { JobCategory, JobType } from '@/types/job';
import { useJobStore } from '@/store/useJobStore';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const categories: JobCategory[] = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Product',
  'Customer Support',
  'Other'
];

const categoryLabels: Record<JobCategory, string> = {
  'Engineering': 'Kỹ thuật',
  'Design': 'Thiết kế',
  'Marketing': 'Marketing',
  'Sales': 'Sales',
  'Product': 'Sản phẩm',
  'Customer Support': 'Hỗ trợ khách hàng',
  'Other': 'Khác'
};

const jobTypes: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

const jobTypeLabels: Record<JobType, string> = {
  'Full-time': 'Toàn thời gian',
  'Part-time': 'Bán thời gian',
  'Contract': 'Hợp đồng',
  'Remote': 'Từ xa',
  'Internship': 'Thực tập'
};

export default function FilterSidebar() {
  const { filters, setFilters, resetFilters } = useJobStore();

  const handleCategoryChange = (category: JobCategory) => {
    const current = filters.category;
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    setFilters({ category: updated });
  };

  const handleTypeChange = (type: JobType) => {
    const current = filters.type;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setFilters({ type: updated });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Bộ lọc</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-8 px-2 text-muted-foreground hover:text-primary"
        >
          <RotateCcw className="mr-2 h-3 w-3" />
          Đặt lại
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Lĩnh vực
        </h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category}`}
                checked={filters.category.includes(category)}
                onCheckedChange={() => handleCategoryChange(category)}
              />
              <Label
                htmlFor={`cat-${category}`}
                className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {categoryLabels[category]}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Loại hình công việc
        </h3>
        <div className="space-y-3">
          {jobTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={filters.type.includes(type)}
                onCheckedChange={() => handleTypeChange(type)}
              />
              <Label
                htmlFor={`type-${type}`}
                className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {jobTypeLabels[type]}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

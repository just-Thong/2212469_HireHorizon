'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export function DeleteJobButton({ jobId, isReal }: { jobId: string, isReal: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!isReal) {
      toast.error('Không thể xóa dữ liệu mẫu (mock data)');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này? Hành động này không thể hoàn tác.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Đầu tiên xóa applications của job này nếu có (nếu DB chưa set cascade)
      await supabase.from('applications').delete().eq('job_id', jobId);
      
      // Xóa job
      const { data, error } = await supabase.from('job_postings').delete().eq('id', jobId).select();
      
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Bạn không có quyền xóa tin này hoặc tin không tồn tại (Lỗi phân quyền RLS)');
      }
      
      toast.success('Đã xóa tin tuyển dụng thành công!');
      window.location.reload();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Xóa thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-muted-foreground hover:text-red-500"
      onClick={handleDelete}
      disabled={isDeleting || !isReal}
      title={isReal ? "Xóa tin này" : "Dữ liệu mẫu không thể xóa"}
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}

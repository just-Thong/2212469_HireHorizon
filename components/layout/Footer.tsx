import { Briefcase, Globe, Send, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="md:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">HireHorizon</span>
            </Link>
            <p className="text-muted-foreground max-w-xs mb-6">
              Kết nối với các công ty hàng đầu và tìm thấy sự nghiệp mơ ước của bạn. Nền tảng tìm việc hiện đại nhất thế giới.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Send className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <LinkIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Cho Ứng Viên</h3>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="text-sm text-muted-foreground hover:text-primary transition-colors">Tìm việc làm</Link></li>
              <li><Link href="/saved" className="text-sm text-muted-foreground hover:text-primary transition-colors">Việc làm đã lưu</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Thông báo việc làm</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Lời khuyên nghề nghiệp</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Cho Nhà Tuyển Dụng</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Đăng tin tuyển dụng</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Bảng giá</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Giải pháp nhân tài</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog tuyển dụng</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Công ty</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">Giới thiệu</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Liên hệ</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Điều khoản dịch vụ</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} HireHorizon. Bản quyền đã được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

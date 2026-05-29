'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Briefcase, Heart, Info, Home, Search, Menu, Moon, Sun, User2, LogOut, Building2, LayoutDashboard, Plus } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthModal } from '@/components/auth/AuthModal';
import { toast } from 'sonner';

const navItems = [
  { name: 'Trang chủ', href: '/', icon: Home },
  { name: 'Việc làm', href: '/jobs', icon: Search },
  { name: 'Đã lưu', href: '/saved', icon: Heart },
  { name: 'Giới thiệu', href: '/about', icon: Info },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { user, profile, signOut } = useAuthStore();

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Đã đăng xuất thành công');
    window.location.href = '/';
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Briefcase className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight hidden sm:inline-block">
                  HireHorizon
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    pathname === item.href
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full"
              >
                {mounted && (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Auth Buttons - Desktop */}
              <div className="hidden sm:flex gap-2">
                {user && profile ? (
                  <>
                    {profile.role === 'recruiter' && (
                      <Link href="/recruiter/post-job">
                        <Button size="sm" variant="outline" className="gap-1.5 rounded-lg">
                          <Plus className="h-3.5 w-3.5" />
                          Đăng tin
                        </Button>
                      </Link>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 rounded-lg")}>
                        <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                          {profile.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="max-w-[100px] truncate">{profile.full_name}</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium">{profile.full_name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                              <span className={cn(
                                'text-xs font-medium w-fit px-2 py-0.5 rounded-full mt-1',
                                profile.role === 'admin'
                                  ? 'bg-purple-500/10 text-purple-600'
                                  : profile.role === 'recruiter'
                                  ? 'bg-blue-500/10 text-blue-600'
                                  : 'bg-green-500/10 text-green-600'
                              )}>
                                {profile.role === 'admin' ? '🛡️ Quản trị viên' : profile.role === 'recruiter' ? '🏢 Nhà tuyển dụng' : '🎓 Ứng viên'}
                              </span>
                            </div>
                          </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem render={<Link href={profile.role === 'admin' ? '/admin/dashboard' : profile.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'} className="gap-2" />}>
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </DropdownMenuItem>
                        {profile.role === 'recruiter' && (
                          <DropdownMenuItem render={<Link href="/recruiter/post-job" className="gap-2" />}>
                            <Building2 className="h-4 w-4" />
                            Đăng tin tuyển dụng
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 text-red-500 focus:text-red-500 cursor-pointer"
                          onClick={handleSignOut}
                        >
                          <LogOut className="h-4 w-4" />
                          Đăng xuất
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => openAuthModal('login')}>Đăng nhập</Button>
                    <Button size="sm" onClick={() => openAuthModal('register')}>Đăng ký</Button>
                  </>
                )}
              </div>

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger 
                  className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}
                >
                  <Menu className="h-6 w-6" />
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle className="text-left flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      HireHorizon
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 py-8">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 text-lg font-medium transition-colors hover:text-primary p-2 rounded-md',
                          pathname === item.href
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                    <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                      {user && profile ? (
                        <>
                          <div className="flex items-center gap-3 p-2">
                            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                              {profile.full_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{profile.full_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {profile.role === 'admin' ? 'Quản trị viên' : profile.role === 'recruiter' ? 'Nhà tuyển dụng' : 'Ứng viên'}
                              </p>
                            </div>
                          </div>
                          <Link href={profile.role === 'admin' ? '/admin/dashboard' : profile.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'} onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full justify-start gap-2">
                              <LayoutDashboard className="h-4 w-4" />
                              Dashboard
                            </Button>
                          </Link>
                          {profile.role === 'recruiter' && (
                            <Link href="/recruiter/post-job" onClick={() => setIsMobileMenuOpen(false)}>
                              <Button variant="outline" className="w-full justify-start gap-2">
                                <Building2 className="h-4 w-4" />
                                Đăng tin tuyển dụng
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 text-red-500 hover:text-red-500"
                            onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                          >
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" className="w-full justify-start" onClick={() => { openAuthModal('login'); setIsMobileMenuOpen(false); }}>
                            <User2 className="h-4 w-4 mr-2" />
                            Đăng nhập
                          </Button>
                          <Button className="w-full justify-start" onClick={() => { openAuthModal('register'); setIsMobileMenuOpen(false); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Đăng ký
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authModalMode} />
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import {
  User, Mail, Phone, MapPin, Globe, Link as LinkIcon, Code,
  Briefcase, GraduationCap, Award, Plus, Trash2,
  Download, Eye, ChevronDown, ChevronUp, FileText, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface WorkExp {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface CVData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
  avatar?: string;
  workExps: WorkExp[];
  educations: Education[];
  skills: string[];
  certifications: string[];
}

const defaultCV: CVData = {
  fullName: '',
  jobTitle: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  linkedin: '',
  github: '',
  summary: '',
  avatar: '',
  workExps: [{
    id: '1', company: '', position: '', startDate: '', endDate: '', current: false, description: ''
  }],
  educations: [{
    id: '1', school: '', degree: '', field: '', startDate: '', endDate: '', gpa: ''
  }],
  skills: [''],
  certifications: [''],
};

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>, title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-primary/20">
      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
    </div>
  );
}

// ---- CV PREVIEW ----
function CVPreview({ data }: { data: CVData }) {
  return (
    <div id="cv-preview" className="bg-white text-gray-900 rounded-xl shadow-lg p-8 min-h-[1000px] text-sm font-sans">
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-6 mb-6 flex gap-6 items-center">
        {data.avatar && (
          <img src={data.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-blue-600 shrink-0" />
        )}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{data.fullName || 'Họ và Tên'}</h1>
          <p className="text-blue-600 font-semibold text-lg mt-1">{data.jobTitle || 'Vị trí ứng tuyển'}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-gray-600 text-xs">
            {data.email && <span>✉ {data.email}</span>}
            {data.phone && <span>📞 {data.phone}</span>}
            {data.location && <span>📍 {data.location}</span>}
            {data.linkedin && <span>🔗 {data.linkedin}</span>}
            {data.github && <span>💻 {data.github}</span>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-2">Giới thiệu bản thân</h2>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {data.workExps.some(e => e.company) && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">Kinh nghiệm làm việc</h2>
          <div className="space-y-4">
            {data.workExps.filter(e => e.company).map((exp) => (
              <div key={exp.id} className="border-l-2 border-blue-200 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{exp.position}</p>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                  </div>
                  <p className="text-gray-500 text-xs whitespace-nowrap">
                    {exp.startDate} – {exp.current ? 'Hiện tại' : exp.endDate}
                  </p>
                </div>
                {exp.description && <p className="text-gray-600 mt-1 text-xs leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.educations.some(e => e.school) && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">Học vấn</h2>
          <div className="space-y-3">
            {data.educations.filter(e => e.school).map((edu) => (
              <div key={edu.id} className="border-l-2 border-blue-200 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{edu.school}</p>
                    <p className="text-gray-600 text-xs">{edu.degree} {edu.field && `· ${edu.field}`} {edu.gpa && `· GPA: ${edu.gpa}`}</p>
                  </div>
                  <p className="text-gray-500 text-xs whitespace-nowrap">{edu.startDate} – {edu.endDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills.filter(Boolean).length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">Kỹ năng</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.filter(Boolean).map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications.filter(Boolean).length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">Chứng chỉ</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {data.certifications.filter(Boolean).map((cert, i) => (
              <li key={i} className="text-xs">{cert}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function CVBuilderPage() {
  const { user, profile, isLoading } = useAuthStore();
  const router = useRouter();
  const [cv, setCV] = useState<CVData>(defaultCV);
  const [showPreview, setShowPreview] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hirehorizon_cv_draft');
    if (saved) {
      try {
        setCV(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading CV from localStorage:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('hirehorizon_cv_draft', JSON.stringify(cv));
    }
  }, [cv, isLoaded]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user || profile?.role !== 'candidate') {
    router.replace('/');
    return null;
  }

  const update = (field: keyof CVData, value: unknown) => setCV(prev => ({ ...prev, [field]: value }));

  const updateWorkExp = (id: string, field: keyof WorkExp, value: unknown) => {
    setCV(prev => ({
      ...prev,
      workExps: prev.workExps.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: unknown) => {
    setCV(prev => ({
      ...prev,
      educations: prev.educations.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        update('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => { window.print(); setIsPrinting(false); }, 300);
  };

  return (
    <div className="min-h-screen bg-muted/20 print:bg-white">
      {/* Header */}
      <div className="bg-background border-b sticky top-16 z-10 print:hidden">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Tạo CV chuyên nghiệp</h1>
              <p className="text-xs text-muted-foreground">Điền thông tin → Xem trước → Tải xuống PDF</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="h-4 w-4 mr-1" />
              {showPreview ? 'Ẩn' : 'Xem trước'}
            </Button>
            <Button size="sm" onClick={handlePrint} disabled={isPrinting}>
              {isPrinting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
              Tải PDF
            </Button>
          </div>
        </div>
      </div>

      <div className={cn("container mx-auto px-4 py-8 print:p-0 print:block", showPreview ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "max-w-2xl")}>
        {/* Form */}
        <div className="space-y-6 print:hidden">
          {/* Header Action: Xóa nháp */}
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 text-xs" onClick={() => {
              if (confirm('Bạn có chắc chắn muốn xóa toàn bộ thông tin đang nhập?')) {
                setCV(defaultCV);
                localStorage.removeItem('hirehorizon_cv_draft');
              }
            }}>
              <Trash2 className="h-3 w-3 mr-1" />
              Làm mới CV
            </Button>
          </div>

          {/* Personal Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-background rounded-2xl border shadow-sm p-6">
            <SectionHeader icon={User} title="Thông tin cá nhân" />
            
            <div className="mb-6 flex items-center gap-4">
              <div className="h-20 w-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30 overflow-hidden relative group shrink-0">
                {cv.avatar ? (
                  <img src={cv.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground/50" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-white text-[10px] font-medium">Tải ảnh</span>
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer" title="Chọn ảnh đại diện" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Ảnh đại diện (Tùy chọn)</h3>
                <p className="text-xs text-muted-foreground mt-1">Nên dùng ảnh vuông, rõ mặt, trang phục lịch sự. Khuyên dùng kích thước dưới 2MB.</p>
                {cv.avatar && <button onClick={() => update('avatar', '')} className="text-xs text-red-500 mt-2 hover:underline">Xóa ảnh</button>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Họ và tên đầy đủ *</label>
                <Input placeholder="Nguyễn Văn A" value={cv.fullName} onChange={e => update('fullName', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Vị trí / Chức danh *</label>
                <Input placeholder="Frontend Developer" value={cv.jobTitle} onChange={e => update('jobTitle', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><Mail className="h-3 w-3" /> Email *</label>
                <Input placeholder="email@example.com" value={cv.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><Phone className="h-3 w-3" /> Điện thoại</label>
                <Input placeholder="0901 234 567" value={cv.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><MapPin className="h-3 w-3" /> Địa chỉ</label>
                <Input placeholder="Hà Nội, Việt Nam" value={cv.location} onChange={e => update('location', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><Globe className="h-3 w-3" /> Website</label>
                <Input placeholder="https://portfolio.com" value={cv.website} onChange={e => update('website', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><LinkIcon className="h-3 w-3" /> LinkedIn</label>
                <Input placeholder="linkedin.com/in/username" value={cv.linkedin} onChange={e => update('linkedin', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><Code className="h-3 w-3" /> GitHub</label>
                <Input placeholder="github.com/username" value={cv.github} onChange={e => update('github', e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Giới thiệu bản thân</label>
              <textarea
                value={cv.summary}
                onChange={e => update('summary', e.target.value)}
                placeholder="Tóm tắt ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none text-sm"
              />
            </div>
          </motion.div>

          {/* Work Experience */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-background rounded-2xl border shadow-sm p-6">
            <SectionHeader icon={Briefcase} title="Kinh nghiệm làm việc" />
            <div className="space-y-6">
              {cv.workExps.map((exp, i) => (
                <div key={exp.id} className="p-4 border rounded-xl space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-muted-foreground">Kinh nghiệm {i + 1}</p>
                    {cv.workExps.length > 1 && (
                      <button onClick={() => setCV(p => ({ ...p, workExps: p.workExps.filter(e => e.id !== exp.id) }))} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">Tên công ty *</label><Input placeholder="Google" value={exp.company} onChange={e => updateWorkExp(exp.id, 'company', e.target.value)} /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">Vị trí *</label><Input placeholder="Software Engineer" value={exp.position} onChange={e => updateWorkExp(exp.id, 'position', e.target.value)} /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">Từ tháng/năm</label><Input placeholder="01/2022" value={exp.startDate} onChange={e => updateWorkExp(exp.id, 'startDate', e.target.value)} /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">Đến tháng/năm</label><Input placeholder="12/2023" disabled={exp.current} value={exp.current ? 'Hiện tại' : exp.endDate} onChange={e => updateWorkExp(exp.id, 'endDate', e.target.value)} /></div>
                  </div>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={exp.current} onChange={e => updateWorkExp(exp.id, 'current', e.target.checked)} />
                    <span className="text-muted-foreground">Đây là công việc hiện tại</span>
                  </label>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Mô tả công việc</label>
                    <textarea value={exp.description} onChange={e => updateWorkExp(exp.id, 'description', e.target.value)} placeholder="Mô tả vai trò, thành tích đạt được..." rows={3} className="w-full px-3 py-2 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none text-sm" />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full" onClick={() => setCV(p => ({ ...p, workExps: [...p.workExps, { id: Date.now().toString(), company: '', position: '', startDate: '', endDate: '', current: false, description: '' }] }))}>
                <Plus className="h-4 w-4 mr-1" /> Thêm kinh nghiệm
              </Button>
            </div>
          </motion.div>

          {/* Education */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-background rounded-2xl border shadow-sm p-6">
            <SectionHeader icon={GraduationCap} title="Học vấn" />
            <div className="space-y-4">
              {cv.educations.map((edu, i) => (
                <div key={edu.id} className="p-4 border rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-muted-foreground">Học vấn {i + 1}</p>
                    {cv.educations.length > 1 && (
                      <button onClick={() => setCV(p => ({ ...p, educations: p.educations.filter(e => e.id !== edu.id) }))} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className="text-xs text-muted-foreground mb-1 block">Tên trường *</label><Input placeholder="Đại học Bách Khoa Hà Nội" value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">Bằng cấp</label><Input placeholder="Cử nhân" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">Ngành học</label><Input placeholder="Khoa học máy tính" value={edu.field} onChange={e => updateEducation(edu.id, 'field', e.target.value)} /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">Năm bắt đầu</label><Input placeholder="2018" value={edu.startDate} onChange={e => updateEducation(edu.id, 'startDate', e.target.value)} /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">Năm tốt nghiệp</label><Input placeholder="2022" value={edu.endDate} onChange={e => updateEducation(edu.id, 'endDate', e.target.value)} /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">GPA</label><Input placeholder="3.6 / 4.0" value={edu.gpa} onChange={e => updateEducation(edu.id, 'gpa', e.target.value)} /></div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full" onClick={() => setCV(p => ({ ...p, educations: [...p.educations, { id: Date.now().toString(), school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }] }))}>
                <Plus className="h-4 w-4 mr-1" /> Thêm học vấn
              </Button>
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-background rounded-2xl border shadow-sm p-6">
            <SectionHeader icon={Code} title="Kỹ năng" />
            <div className="space-y-2">
              {cv.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input placeholder="Ví dụ: React, Python, Figma..." value={skill} onChange={e => { const s = [...cv.skills]; s[i] = e.target.value; update('skills', s); }} />
                  {cv.skills.length > 1 && <button onClick={() => update('skills', cv.skills.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => update('skills', [...cv.skills, ''])}><Plus className="h-4 w-4 mr-1" /> Thêm kỹ năng</Button>
            </div>
          </motion.div>

          {/* Certifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-background rounded-2xl border shadow-sm p-6">
            <SectionHeader icon={Award} title="Chứng chỉ" />
            <div className="space-y-2">
              {cv.certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input placeholder="Ví dụ: AWS Solutions Architect, IELTS 7.0..." value={cert} onChange={e => { const c = [...cv.certifications]; c[i] = e.target.value; update('certifications', c); }} />
                  {cv.certifications.length > 1 && <button onClick={() => update('certifications', cv.certifications.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => update('certifications', [...cv.certifications, ''])}><Plus className="h-4 w-4 mr-1" /> Thêm chứng chỉ</Button>
            </div>
          </motion.div>

          {/* Print button at bottom */}
          <div className="flex gap-3">
            <Button className="flex-1 h-12 rounded-xl font-bold" onClick={handlePrint} disabled={isPrinting}>
              {isPrinting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Tải xuống PDF
            </Button>
            <Link href="/candidate/dashboard" className="flex-1">
              <Button variant="outline" className="w-full h-12 rounded-xl">Quay lại Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Preview - Luôn render để in, nhưng ẩn trên màn hình nếu showPreview = false */}
        <div className={cn(
          "print:block print:static print:max-h-none print:overflow-visible print:w-full",
          showPreview ? "lg:sticky lg:top-32 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto" : "hidden"
        )}>
          <CVPreview data={cv} />
        </div>
      </div>
    </div>
  );
}

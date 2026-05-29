import { Briefcase, Users, Globe, Award, Heart, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Nâng tầm hành trình sự nghiệp của bạn
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            HireHorizon ra đời từ một ý tưởng đơn giản: việc tìm kiếm việc làm nên dễ dàng và thú vị 
            như khi bạn sử dụng mạng xã hội yêu thích của mình.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000" 
              alt="Đội ngũ làm việc" 
              fill 
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">Sứ mệnh của chúng tôi</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Chúng tôi đặt mục tiêu thu hẹp khoảng cách giữa các chuyên gia tài năng và các công ty có tầm nhìn 
              bằng cách cung cấp trải nghiệm tuyển dụng liền mạch, minh bạch và dựa trên công nghệ.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Trong một nền kinh tế toàn cầu đang phát triển nhanh chóng, chúng tôi tin rằng việc tiếp cận đúng 
              cơ hội là chìa khóa cho sự hoàn thiện cá nhân và nghề nghiệp. HireHorizon là một nền tảng phát triển sự nghiệp.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Globe className="h-5 w-5" />
                </div>
                <span className="font-bold">Tiếp cận toàn cầu</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="font-bold">Nền tảng tin cậy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Giá trị cốt lõi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'Người dùng là trên hết',
                desc: 'Mọi tính năng chúng tôi xây dựng đều được thiết kế xoay quanh trải nghiệm của ứng viên và nhà tuyển dụng.'
              },
              {
                icon: Users,
                title: 'Đa dạng & Hòa nhập',
                desc: 'Chúng tôi nỗ lực làm cho việc tuyển dụng trở nên công bằng và dễ tiếp cận với mọi người.'
              },
              {
                icon: Award,
                title: 'Sự xuất sắc',
                desc: 'Chúng tôi cam kết duy trì các tiêu chuẩn cao nhất về chất lượng dữ liệu và hiệu suất nền tảng.'
              }
            ].map((value, i) => (
              <div key={i} className="p-8 bg-card rounded-3xl border text-center">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y">
          {[
            { label: 'Thành lập', value: '2022' },
            { label: 'Việc làm hoạt động', value: '50k+' },
            { label: 'Công ty', value: '10k+' },
            { label: 'Đã tuyển dụng', value: '5k+' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-extrabold text-primary mb-2">{stat.value}</p>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

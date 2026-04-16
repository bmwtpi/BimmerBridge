import React from 'react';
import { motion } from 'motion/react';
import { Shield, Activity, Zap, Globe, Cpu, MessageSquare, Download, ChevronRight, Github, Twitter, Mail, X } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  lang: 'zh' | 'en';
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, lang }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  
  const screenshots = [
    "https://picsum.photos/seed/bimmer-ui-1/1920/1080",
    "https://picsum.photos/seed/bimmer-ui-2/1920/1080",
    "https://picsum.photos/seed/bimmer-ui-3/1920/1080",
    "https://picsum.photos/seed/bimmer-ui-4/1920/1080"
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % screenshots.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const t = {
    zh: {
      heroTitle: "BimmerBridge ENET",
      heroSubtitle: "专业级宝马远程编程与诊断桥接方案",
      heroDesc: "突破地理限制，实现毫秒级延迟的远程 DoIP 转发。专为宝马 F/G/I 系列车型设计的远程协作工具。",
      getStarted: "立即下载",
      features: "核心特性",
      updates: "版本更新",
      feature1Title: "极速 DoIP 转发",
      feature1Desc: "基于高性能 WebSocket 隧道，完美支持 E-Sys, ISTA 等专业软件远程连接。",
      feature2Title: "端到端安全",
      feature2Desc: "所有通信经过加密处理，确保车辆 VIN 与配置数据的绝对安全。",
      feature3Title: "实时沟通",
      feature3Desc: "内置专业聊天系统，支持文件传输，让技师与车主沟通零距离。",
      feature4Title: "多端兼容",
      feature4Desc: "无论是 Windows 还是 macOS，只需浏览器即可建立稳定的远程通道。",
      updateTitle: "最新动态",
      v01: "V0.01 初始版本发布",
      v01Desc: "核心桥接功能上线，支持基础聊天与文件传输。",
      footer: "© 2024 BimmerBridge. 保留所有权利。"
    },
    en: {
      heroTitle: "BimmerBridge ENET",
      heroSubtitle: "Professional Remote BMW Programming Bridge",
      heroDesc: "Break geographical limits with millisecond-latency DoIP forwarding. Designed specifically for BMW F/G/I series remote collaboration.",
      getStarted: "Download Now",
      features: "Core Features",
      updates: "Updates",
      feature1Title: "High-Speed DoIP",
      feature1Desc: "High-performance WebSocket tunneling for E-Sys, ISTA, and other professional tools.",
      feature2Title: "End-to-End Security",
      feature2Desc: "Encrypted communication ensures absolute safety for vehicle VIN and config data.",
      feature3Title: "Real-time Chat",
      feature3Desc: "Built-in professional chat with file transfer for seamless tech-to-owner communication.",
      feature4Title: "Cross-Platform",
      feature4Desc: "Compatible with Windows and macOS via any modern web browser.",
      updateTitle: "What's New",
      v01: "V0.01 Initial Release",
      v01Desc: "Core bridge functionality launched with basic chat and file transfer support.",
      footer: "© 2024 BimmerBridge. All rights reserved."
    }
  }[lang];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[var(--accent-primary)]/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(46,134,222,0.4)]">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase">BimmerBridge</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60 uppercase tracking-widest">
            <a href="#features" className="hover:text-[var(--accent-primary)] transition-colors">{t.features}</a>
            <a href="#updates" className="hover:text-[var(--accent-primary)] transition-colors">{t.updates}</a>
            <a 
              href="#"
              className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-[var(--accent-primary)] hover:text-white transition-all transform hover:scale-105"
            >
              {t.getStarted}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[var(--accent-primary)]/10 blur-[120px] rounded-full -z-10"></div>
        
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent italic">
              {t.heroTitle}
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--accent-primary)] mb-8 uppercase tracking-[4px]">
              {t.heroSubtitle}
            </h2>
            <p className="max-w-2xl mx-auto text-white/50 text-lg leading-relaxed mb-12">
              {t.heroDesc}
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a 
                href="#"
                className="w-full md:w-auto bg-[var(--accent-primary)] text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-[var(--accent-primary)]/80 transition-all shadow-[0_0_30px_rgba(46,134,222,0.3)] flex items-center justify-center gap-3 group"
              >
                {t.getStarted}
                <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </a>
            </div>
          </motion.div>

          {/* Visual Element - Carousel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mt-24 relative"
          >
            <div className="relative z-10 bg-gradient-to-b from-white/5 to-transparent p-1 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden aspect-video">
              <div className="relative w-full h-full">
                {screenshots.map((src, index) => (
                  <motion.img 
                    key={src}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: currentSlide === index ? 1 : 0 }}
                    transition={{ duration: 1 }}
                    src={src} 
                    alt={`Software Screenshot ${index + 1}`} 
                    className="absolute inset-0 w-full h-full object-cover rounded-[38px] opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              
              {/* Carousel Indicators */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {screenshots.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-2 h-2 rounded-full transition-all ${currentSlide === i ? "w-8 bg-[var(--accent-primary)]" : "bg-white/20 hover:bg-white/40"}`}
                  />
                ))}
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-24 h-24 bg-[var(--accent-primary)]/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 animate-pulse">
                  <Activity className="w-10 h-10 text-[var(--accent-primary)]" />
                </div>
              </div>
            </div>
            {/* Decorative Grid */}
            <div className="absolute -inset-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h3 className="text-[10px] uppercase tracking-[4px] text-[var(--accent-primary)] font-bold mb-4">{t.features}</h3>
            <h2 className="text-4xl md:text-5xl font-bold italic tracking-tight">{lang === 'zh' ? '为专业而生' : 'Built for Professionals'}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: t.feature1Title, desc: t.feature1Desc },
              { icon: Shield, title: t.feature2Title, desc: t.feature2Desc },
              { icon: MessageSquare, title: t.feature3Title, desc: t.feature3Desc },
              { icon: Globe, title: t.feature4Title, desc: t.feature4Desc },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[var(--accent-primary)]/50 transition-all group"
              >
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[var(--accent-primary)] transition-colors">
                  <feature.icon className="w-7 h-7 text-[var(--accent-primary)] group-hover:text-white" />
                </div>
                <h4 className="text-xl font-bold mb-4">{feature.title}</h4>
                <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Updates Section */}
      <section id="updates" className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-[10px] uppercase tracking-[4px] text-[var(--accent-primary)] font-bold mb-4">{t.updateTitle}</h3>
            <h2 className="text-4xl font-bold italic">{lang === 'zh' ? '持续进化' : 'Continuous Evolution'}</h2>
          </div>

          <div className="space-y-12">
            <div className="relative pl-12 border-l border-white/10">
              <div className="absolute left-[-5px] top-0 w-[10px] h-[10px] bg-[var(--accent-primary)] rounded-full shadow-[0_0_10px_rgba(46,134,222,0.8)]"></div>
              <div className="text-[var(--accent-primary)] font-mono text-sm mb-2">2024.04.16</div>
              <h4 className="text-xl font-bold mb-3">{t.v01}</h4>
              <p className="text-white/40 text-sm">{t.v01Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[var(--accent-primary)] to-[#1e3a8a] rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-48 -mt-48"></div>
          <h2 className="text-4xl md:text-6xl font-black italic mb-8 tracking-tighter">
            {lang === 'zh' ? '准备好开始连接了吗？' : 'Ready to Start Connecting?'}
          </h2>
          <a 
            href="#"
            className="inline-block bg-white text-black px-12 py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all transform hover:scale-105"
          >
            {t.getStarted}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-[var(--accent-primary)]" />
            <span className="text-lg font-bold tracking-tighter uppercase">BimmerBridge</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-white/40 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="text-white/40 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-white/40 hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
          </div>
          <div className="text-white/20 text-[10px] uppercase tracking-widest font-bold">
            {t.footer}
          </div>
        </div>
      </footer>
    </div>
  );
};

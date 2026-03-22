import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { BlocksBackground } from "@/app/components/BlocksBackground";
import { LandingNav } from "@/app/components/LandingNav";

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#ccff00] selection:text-black">
      <BlocksBackground />
      {/* Navigation */}
      <LandingNav isLoggedIn={isLoggedIn} />

      <main className="flex-1 pt-24 pb-32">
        {/* Hero Section */}
        <section className="relative px-6 pt-24 pb-20 text-center max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ccff00]/10 text-[#ccff00] text-xs font-semibold tracking-wide uppercase mb-8 border border-[#ccff00]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></span>
            Planificador Inteligente
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.05] text-balance">
            Planifica tus obras con <br className="hidden md:block"/>
            inteligencia artificial
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Genera cronogramas detallados, optimiza tus recursos y toma el control de tus presupuestos a una velocidad increíble.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href={isLoggedIn ? "/platform" : "/auth/login"}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#ccff00] text-black font-semibold text-lg hover:bg-[#b8e600] transition-transform hover:scale-105"
            >
              Comenzar gratis
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#1a1a1c] text-neutral-300 font-semibold text-lg hover:text-white hover:bg-[#202022] transition-colors border border-white/10"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Ver demo
            </a>
          </div>
        </section>

        {/* Mockup Section */}
        <section className="relative px-6 pb-32 max-w-6xl mx-auto">
          {/* Glowing backdrops purely CSS */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[70%] bg-gradient-to-r from-[#ccff00]/20 via-blue-500/20 to-purple-500/20 blur-[100px] rounded-full -z-10 pointer-events-none" />
          
          <div className="rounded-3xl border border-white/10 bg-[#111113]/90 shadow-2xl xl:shadow-[0_0_80px_rgba(204,255,0,0.1)] overflow-hidden ring-1 ring-white/5 w-full aspect-[4/3] sm:aspect-[16/9] relative flex flex-col">
            <div className="w-full h-12 bg-[#09090b] border-b border-white/5 flex items-center px-6 gap-2 shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <div className="mx-auto text-xs text-neutral-500 font-medium">obrit.com / platform</div>
            </div>
            
            {/* Minimal abstract representation of an interface */}
            <div className="flex-1 p-6 grid grid-cols-12 gap-6 bg-[#111113]">
               {/* Sidebar */}
               <div className="col-span-3 hidden md:flex flex-col gap-4 border-r border-white/5 pr-6">
                 <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl text-white text-sm"><span className="w-5 h-5 rounded bg-[#ccff00] text-black flex items-center justify-center font-bold">P</span> Proyectos</div>
                 <div className="flex items-center gap-3 p-3 text-neutral-400 text-sm"><span className="w-5 h-5 rounded bg-white/10"></span> Tareas</div>
                 <div className="flex items-center gap-3 p-3 text-neutral-400 text-sm"><span className="w-5 h-5 rounded bg-white/10"></span> Presupuestos</div>
               </div>
               
               {/* Content */}
               <div className="col-span-12 md:col-span-9 flex flex-col gap-6">
                 <div className="h-20 border border-white/5 rounded-2xl bg-white/[0.02] flex items-center justify-between px-6">
                    <div>
                      <div className="h-4 w-32 bg-white/10 rounded mb-2"></div>
                      <div className="h-3 w-48 bg-white/5 rounded"></div>
                    </div>
                    <div className="h-8 w-24 bg-[#ccff00] rounded-full"></div>
                 </div>
                 
                 <div className="flex-1 grid sm:grid-cols-2 gap-4">
                   {[1,2,3,4].map(idx => (
                     <div key={idx} className="border border-white/5 rounded-2xl bg-white/[0.01] p-6 relative overflow-hidden flex flex-col justify-between">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ccff00]/50 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                       <div>
                         <div className="h-4 w-1/2 bg-white/10 rounded mb-4"></div>
                         <div className="flex gap-2">
                           <div className="h-2 w-full bg-white/5 rounded"></div>
                           <div className="h-2 w-full bg-white/5 rounded"></div>
                           <div className="h-2 w-full bg-white/5 rounded"></div>
                         </div>
                       </div>
                       <div className="flex items-center justify-between mt-8">
                         <div className="h-6 w-16 bg-white/5 rounded-full"></div>
                         <div className="h-6 w-6 bg-white/10 rounded-full"></div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Alternating Highlights section */}
        <section className="px-6 py-24 max-w-6xl mx-auto space-y-32">
          {/* Feature Highlight 1 */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
               <div className="absolute inset-0 bg-gradient-to-br from-[#ccff00]/20 to-pink-500/20 blur-[60px] -z-10 rounded-full"></div>
               <div className="rounded-3xl border border-white/10 bg-[#161618] aspect-[4/3] overflow-hidden flex flex-col shadow-2xl">
                 <div className="p-4 border-b border-white/5 flex gap-2">
                   <div className="px-3 py-1 bg-white/5 rounded-full text-xs text-neutral-400">Prompt</div>
                   <div className="px-3 py-1 bg-[#ccff00]/10 text-[#ccff00] rounded-full text-xs">AI Agent ⚡</div>
                 </div>
                 <div className="flex-1 p-8 flex flex-col justify-center gap-6">
                   <div className="text-sm md:text-base text-white font-mono bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                     "Crea el cronograma para una torre de 12 pisos. Fundaciones la próxima semana, presupuesto: $2M."
                   </div>
                   <div className="p-5 rounded-2xl bg-[#ccff00] text-black">
                     <span className="font-bold block mb-2">Generado con éxito</span>
                     <div className="h-2 w-full bg-black/10 rounded-full mb-2"><div className="h-full w-full bg-black/40 rounded-full"></div></div>
                     <span className="text-xs font-semibold opacity-70">4 fases · 42 tareas · Recursos asignados</span>
                   </div>
                 </div>
               </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="text-[#ccff00] text-sm font-semibold mb-4 tracking-wider uppercase">Generación Inteligente</div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">Inicia con un prompt <br/>o usa tus planos</h2>
              <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
                Nuestra IA puede generar la estructura de desglose del trabajo (EDT) en segundos basándose en una simple descripción o procesando automáticamente tus documentos de arquitectura.
              </p>
              <Link href="/auth/login" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#ccff00] text-black font-semibold hover:bg-[#b8e600] transition-colors">
                Experimentar ahora
              </Link>
            </div>
          </div>

          {/* Feature Highlight 2 */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-[#ccff00] text-sm font-semibold mb-4 tracking-wider uppercase">Ejecución fluida</div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">Agentes de IA que <br/>cuidan la obra</h2>
              <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
                A diferencia del software tradicional, obrit utiliza agentes autónomos para alertarte sobre desviaciones en el presupuesto o en los plazos, sugiriendo ajustes en tiempo real.
              </p>
              <Link href="/auth/login" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#ccff00] text-black font-semibold hover:bg-[#b8e600] transition-colors">
                 Ver características
              </Link>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/20 to-blue-500/20 blur-[60px] -z-10 rounded-full"></div>
               <div className="rounded-3xl border border-white/10 bg-[#161618] aspect-[4/3] overflow-hidden flex flex-col justify-center p-8 shadow-2xl gap-4">
                 {[1,2,3].map((val, i) => (
                   <div key={i} className={`rounded-2xl border border-white/5 bg-[#202022] p-5 flex items-center justify-between ${i === 1 ? 'border-[#ccff00]/50 shadow-[0_0_20px_rgba(204,255,0,0.1)]' : ''}`}>
                     <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center ${i === 1 ? 'bg-[#ccff00]/20 text-[#ccff00]' : 'bg-white/5 text-neutral-400'}`}>
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                       </div>
                       <div>
                         <div className="text-white font-medium mb-1">Optimización encontrada</div>
                         <div className="text-sm text-neutral-400">Reasignar retroexcavadora a Fase 2</div>
                       </div>
                     </div>
                     {i === 1 && <div className="text-xs font-bold text-[#ccff00] bg-[#ccff00]/10 px-2 py-1 rounded">Aplicar</div>}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </section>

        {/* Bento Board */}
        <section className="px-6 py-32 max-w-6xl mx-auto">
          <div className="mb-16">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-neutral-300 text-xs font-semibold tracking-wide uppercase mb-6 border border-white/10">
               Ecosistema Unificado
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Una plataforma. <br/>Infinito potencial.</h2>
            <p className="text-neutral-400 text-lg max-w-xl">Todos los aspectos del ciclo de vida de la obra controlados bajo una misma herramienta hiper-vitaminada.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]">
            {/* Box 1 (Span 8) */}
            <div className="md:col-span-8 rounded-3xl border border-white/10 bg-[#111113] p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 z-10">Planificación y progreso de proyectos</h3>
              <p className="text-neutral-400 z-10 mb-auto">Genera cronogramas y da seguimiento al avance físico y financiero con total precisión usando IA.</p>
              
              <div className="flex flex-wrap gap-2 z-10">
                 {['Diagrama de Gantt', 'Ruta crítica', 'Curva S', 'Control de tareas'].map(ext => (
                   <span key={ext} className="px-4 py-2 rounded-xl border border-white/10 bg-[#1a1a1c] text-sm font-medium text-neutral-300">
                     {ext}
                   </span>
                 ))}
              </div>
            </div>

            {/* Box 2 (Span 4) */}
            <div className="md:col-span-4 rounded-3xl border border-white/10 bg-gradient-to-br from-[#111113] to-[#1a1a1c] p-8 flex flex-col justify-end relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
               <div className="mb-2">
                 <div className="text-2xl font-bold text-white mb-2 leading-tight">Cotizaciones<br/><span className="text-[#ccff00]">Inteligentes</span></div>
                 <div className="text-sm font-medium text-neutral-400">Analiza catálogos y genera presupuestos ultra-precisos en minutos.</div>
               </div>
            </div>

            {/* Box 3 (Span 4) */}
            <div className="md:col-span-4 rounded-3xl border border-white/10 bg-[#111113] p-8 flex flex-col">
              <h3 className="text-xl font-bold mb-1">Control Financiero</h3>
              <p className="text-xs text-neutral-400 mb-6">Control de presupuesto, elaboración de contratos y seguimiento de cobros.</p>
              <div className="flex-1 flex items-end gap-2 pb-2 mt-auto">
                 {[40, 70, 45, 90, 65, 100].map((h, i) => (
                   <div key={i} className="flex-1 bg-white/5 rounded-t-sm relative group overflow-hidden" style={{height: `${h}%`}}>
                     <div className={`absolute bottom-0 w-full bg-[#ccff00] transition-all duration-500 ease-out`} style={{height: `${i === 5 ? '100%' : '0%'}`}}></div>
                     {i === 4 && <div className={`absolute bottom-0 w-full bg-white/20 h-full`}></div>}
                   </div>
                 ))}
              </div>
            </div>

            {/* Box 4 (Span 8) */}
            <div className="md:col-span-8 rounded-3xl border border-[#ccff00]/20 bg-[#ccff00]/5 p-8 flex flex-col sm:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
              <div className="z-10 text-center sm:text-left">
                <div className="inline-block px-3 py-1 mb-3 rounded-full bg-[#ccff00]/20 text-[#ccff00] text-xs font-bold uppercase tracking-wider">Próximamente</div>
                <h3 className="text-3xl sm:text-4xl font-bold mb-3 text-white">Market Intelligence</h3>
                <p className="text-neutral-400 max-w-sm">Métricas y datos del mercado inmobiliario y construcción en tiempo real para decisiones clave.</p>
              </div>
              <Link href="/auth/login" className="z-10 px-6 py-4 rounded-full border-2 border-[#ccff00] text-[#ccff00] font-bold hover:bg-[#ccff00] hover:text-black transition-all shrink-0">
                Lista de espera
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#09090b] pt-20 pb-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 md:col-span-2">
              <Link href="/">
                <Image src="/obri.png" alt="Obrit" width={100} height={32} className="h-8 w-auto mb-6 opacity-90" />
              </Link>
              <p className="max-w-xs text-neutral-400 mb-8 text-sm leading-relaxed">
                Revolucionando la gestión de la construcción comercial y residencial mediante el poder de los agentes de Inteligencia Artificial.
              </p>
              <div className="flex gap-4">
                {/* Social icons placeholders */}
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-[#ccff00] hover:bg-white/10 transition-colors cursor-pointer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.376.202 2.394.1 2.646.64.699 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Plataforma</h4>
              <ul className="space-y-4 text-sm text-neutral-400">
                <li><Link href="#" className="hover:text-[#ccff00] transition-colors">Cotizaciones inteligentes</Link></li>
                <li><Link href="#" className="hover:text-[#ccff00] transition-colors">Planificación y progreso</Link></li>
                <li><Link href="#" className="hover:text-[#ccff00] transition-colors">Contratos y Finanzas</Link></li>
                <li><Link href="#" className="hover:text-[#ccff00] transition-colors">Market Intelligence</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Empresa</h4>
              <ul className="space-y-4 text-sm text-neutral-400">
                <li><Link href="#" className="hover:text-[#ccff00] transition-colors">Sobre obrit</Link></li>
                <li><Link href="#" className="hover:text-[#ccff00] transition-colors">Clientes</Link></li>
                <li><Link href="#" className="hover:text-[#ccff00] transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-[#ccff00] transition-colors">Contacto</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-neutral-400">
                <li><Link href="#" className="hover:text-[#ccff00] transition-colors">Privacidad</Link></li>
                <li><Link href="#" className="hover:text-[#ccff00] transition-colors">Términos de servicio</Link></li>
                <li><Link href="#" className="hover:text-[#ccff00] transition-colors">Seguridad de datos</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <div>© {new Date().getFullYear()} obrit Inc. Todos los derechos reservados.</div>
            <div className="flex gap-6">
               <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Sistemas Operativos</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

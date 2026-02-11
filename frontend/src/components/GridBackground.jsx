export default function GridBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      
      {/* 1. En Alt Katman: Koyu Zemin */}
      <div className="absolute inset-0 bg-slate-950"></div>

      {/* 2. Grid (Izgara) Deseni 
          - bg-[size:35px_35px]: Karelerin boyutu
          - linear-gradient: İnce çizgiler
      */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:35px_35px]"></div>

      {/* 3. Maskeleme (Vignette Efekti) 
          - Ortası net, kenarlara doğru ızgara kaybolur ve kararır.
          - Bu, dikkati ekranın ortasındaki içeriğe çeker.
      */}
      <div className="absolute inset-0 bg-slate-950 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,transparent_20%,#020617_100%)]"></div>

      {/* 4. Dekoratif Işıklar (Orb / Glow) 
          - Sayfanın arkasında hafif mor ve mavi ışıltılar
      */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"></div>
      
    </div>
  );
}
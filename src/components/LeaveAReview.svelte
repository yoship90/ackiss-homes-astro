<script lang="ts">
  const GOOGLE_REVIEW_URL = "https://maps.app.goo.gl/FFWGgPPpNy8crVKD9";
</script>

<!-- Radial glow -->
<div class="fixed inset-0 pointer-events-none" aria-hidden="true"
  style="background: radial-gradient(ellipse 80% 60% at 50% 35%, rgba(201,149,46,0.08) 0%, transparent 70%)"></div>
<!-- Grain -->
<div class="fixed inset-0 hero-grain opacity-[0.04] pointer-events-none" aria-hidden="true"></div>
<!-- Faint A watermark -->
<div class="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden="true">
  <img src="/logo-a-v2-optimized.svg" alt="" width="500" height="454"
    class="w-[85vw] md:w-[38rem] h-auto opacity-[0.03]" />
</div>

<div class="min-h-screen bg-black flex flex-col animate-page-reveal">
  <main class="relative z-10 flex-1 flex items-center justify-center px-6 py-20">
    <div class="w-full max-w-sm md:max-w-2xl mx-auto text-center">

      <!-- Logo -->
      <a href="/" class="inline-flex flex-col items-center gap-3 mb-10 focus-visible:outline-none focus-visible:opacity-70">
        <img src="/logo-a-v2-optimized.svg" alt="Ackiss Homes" width="56" height="51" class="h-14 md:h-16 w-auto opacity-90" />
        <span class="font-brand text-[1.35rem] font-semibold tracking-[0.08em] bg-clip-text text-transparent"
          style="background-image: linear-gradient(135deg,#a06719 0%,#e1a144 20%,#f0be68 40%,#9b681a 55%,#e0a853 78%,#a06719 100%)">
          Ackiss Homes
        </span>
      </a>

      <!-- Top ornament -->
      <div class="flex items-center justify-center mb-8" aria-hidden="true">
        <svg width="120" height="14" viewBox="0 0 120 14" fill="none">
          <line x1="0" y1="7" x2="50" y2="7" stroke="#c9952e" stroke-opacity="0.3" stroke-width="0.75"/>
          <path d="M60 2 L65 7 L60 12 L55 7 Z" fill="#c9952e" fill-opacity="0.6"/>
          <line x1="70" y1="7" x2="120" y2="7" stroke="#c9952e" stroke-opacity="0.3" stroke-width="0.75"/>
        </svg>
      </div>

      <!-- Headline -->
      <h1 class="font-heading font-bold text-6xl md:text-8xl leading-[1.0] tracking-tight text-white mb-7 md:mb-9">
        Thank You!
      </h1>

      <!-- Body -->
      <p class="text-gray-400 leading-relaxed text-sm md:text-base mb-3">
        It's been a privilege to be part of your journey. If we delivered on that promise, a quick review makes a world of difference — it helps the next family find us when they need it most.
      </p>
      <p class="text-[10px] text-gray-600 uppercase tracking-[0.25em] mb-10 md:mb-12">
        Takes less than 2 minutes
      </p>

      <!-- Google Review CTA -->
      <a
        href={GOOGLE_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        class="btn-shimmer btn-shimmer-filled flex items-center justify-center gap-3 w-full py-4 md:py-5 rounded-sm text-dark-900 font-semibold text-sm uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black hover:scale-[1.015] active:scale-[0.97] transition-transform duration-300 mb-10 md:mb-12"
      >
        <span class="relative z-[2] flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z" fill="#1a1a1a"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#1a1a1a"/>
            <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#1a1a1a"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#1a1a1a"/>
          </svg>
          Leave a Google Review
        </span>
      </a>

      <!-- Bottom ornament -->
      <div class="flex items-center justify-center mb-5" aria-hidden="true">
        <svg width="80" height="10" viewBox="0 0 80 10" fill="none">
          <line x1="0" y1="5" x2="32" y2="5" stroke="#c9952e" stroke-opacity="0.2" stroke-width="0.75"/>
          <path d="M40 1.5 L43.5 5 L40 8.5 L36.5 5 Z" fill="#c9952e" fill-opacity="0.3"/>
          <line x1="48" y1="5" x2="80" y2="5" stroke="#c9952e" stroke-opacity="0.2" stroke-width="0.75"/>
        </svg>
      </div>

      <!-- Sign-off -->
      <p class="text-sm text-gray-500 leading-relaxed italic">
        Thank you for trusting Ackiss Homes with one of life's biggest moments.
      </p>

    </div>
  </main>
</div>

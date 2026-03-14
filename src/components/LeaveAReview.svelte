<script lang="ts">
  const GOOGLE_REVIEW_URL = "https://maps.app.goo.gl/FFWGgPPpNy8crVKD9";
</script>

<!-- Ambient glow + grain -->
<div class="fixed inset-0 pointer-events-none" aria-hidden="true"
  style="background: radial-gradient(ellipse 80% 60% at 50% 35%, rgba(201,149,46,0.08) 0%, transparent 70%)"></div>
<div class="fixed inset-0 hero-grain opacity-[0.04] pointer-events-none" aria-hidden="true"></div>

<!-- ── Review Page ────────────────────────────────────────────────── -->
<div class="min-h-screen bg-black flex flex-col animate-page-reveal">

  <main class="relative z-10 flex-1 flex items-center justify-center px-6 pt-16 pb-16">
    <div class="w-full max-w-md md:max-w-lg">

      <!-- Logo -->
      <a href="/" class="flex flex-col items-center gap-2 mb-10 focus-visible:outline-none focus-visible:opacity-70">
        <img src="/logo-a-v2-optimized.svg" alt="Ackiss Homes" width="36" height="33" class="opacity-80 h-9 w-auto" />
        <span class="text-[9px] uppercase tracking-[0.35em] text-gold-500/60">Ackiss Homes</span>
      </a>

      <!-- Handshake icon -->
      <div class="flex justify-center mb-8 md:mb-10" aria-hidden="true">
        <div class="relative">
          <div class="absolute inset-0 blur-2xl opacity-50"
            style="background: radial-gradient(circle, rgba(201,149,46,0.5) 0%, transparent 70%)"></div>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none"
            class="relative md:w-16 md:h-16 drop-shadow-[0_0_12px_rgba(201,149,46,0.4)]">
            <!-- Left forearm -->
            <line x1="5" y1="47" x2="19" y2="33" stroke="#c9952e" stroke-width="3" stroke-linecap="round"/>
            <!-- Right forearm -->
            <line x1="47" y1="5" x2="33" y2="19" stroke="#c9952e" stroke-width="3" stroke-linecap="round"/>
            <!-- Left hand -->
            <path d="M19 33 L23 29 L29 27 L31 29 L29 33 L23 35 Z"
              stroke="#c9952e" stroke-width="2" stroke-linejoin="round" fill="rgba(201,149,46,0.15)"/>
            <!-- Right hand -->
            <path d="M33 19 L29 23 L23 25 L21 23 L23 19 L29 17 Z"
              stroke="#c9952e" stroke-width="2" stroke-linejoin="round" fill="rgba(201,149,46,0.15)"/>
          </svg>
        </div>
      </div>

      <!-- Headline -->
      <h1 class="font-heading font-bold text-5xl md:text-7xl text-center leading-[1.05] tracking-tight text-white mb-5 md:mb-7">
        Thank You!
      </h1>

      <!-- Body -->
      <p class="text-gray-400 text-center leading-relaxed text-sm md:text-base max-w-sm md:max-w-md mx-auto mb-2">
        It's been a privilege to be part of your journey. If we delivered on that promise, a quick review makes a world of difference – it helps the next family find us when they need it most.
      </p>
      <p class="text-center text-[11px] text-gray-600 uppercase tracking-[0.2em] mb-8 md:mb-10">
        Takes less than 2 minutes
      </p>

      <!-- Google Review CTA -->
      <a
        href={GOOGLE_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        class="btn-shimmer btn-shimmer-filled flex items-center justify-center gap-3 w-full py-4 md:py-5 rounded-sm text-dark-900 font-semibold text-sm md:text-base uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black hover:scale-[1.015] active:scale-[0.97] transition-transform duration-300"
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

      <!-- Sign-off -->
      <p class="text-center text-sm text-gray-500 mt-8 md:mt-10 leading-relaxed">
        Thank you for trusting Ackiss Homes with one of life's biggest moments.
      </p>

    </div>
  </main>
</div>

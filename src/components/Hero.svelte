<script lang="ts">
  import { onMount } from "svelte";

  const stats = [
    { target: 200, suffix: "+", label: "Homes Sold" },
    { target: 10, suffix: "+", label: "Years Experience" },
    { target: 50, suffix: "+", label: "5-Star Reviews" },
  ];

  let revealed = $state(false);
  let logoEl: HTMLDivElement | null = null;
  let prefersReducedMotion = $state(false);

  // SSR: initialize to target values so crawlers/no-JS see final numbers
  let counts = $state(stats.map(s => s.target));

  onMount(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion = mq.matches;
    const handler = (e: MediaQueryListEvent) => { prefersReducedMotion = e.matches; };
    mq.addEventListener("change", handler);

    const t = setTimeout(() => { revealed = true; }, prefersReducedMotion ? 0 : 80);

    // Count-up animation — starts after stats fade in (~510ms after mount)
    let countTimer: ReturnType<typeof setTimeout> | undefined;
    if (!prefersReducedMotion) {
      counts = stats.map(() => 0);
      countTimer = setTimeout(() => {
        const duration = 1200;
        const fps = 60;
        const steps = (duration / 1000) * fps;
        let step = 0;
        const interval = setInterval(() => {
          step++;
          const progress = step / steps;
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          counts = stats.map(s => Math.round(s.target * eased));
          if (step >= steps) {
            counts = stats.map(s => s.target);
            clearInterval(interval);
          }
        }, 1000 / fps);
      }, 510);
    }

    // Parallax on logo — desktop only
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    function handleScroll() {
      if (logoEl && isDesktop && !prefersReducedMotion) {
        logoEl.style.transform = `translateY(${window.scrollY * 0.2}px)`;
      }
    }
    if (!prefersReducedMotion && isDesktop) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      clearTimeout(t);
      clearTimeout(countTimer);
      window.removeEventListener("scroll", handleScroll);
      mq.removeEventListener("change", handler);
    };
  });

  function r(delay: number, lift = 12) {
    return {
      style: `opacity: ${revealed ? 1 : 0}; transform: translateY(${revealed ? 0 : lift}px); transition-delay: ${delay}ms;`,
      class: "transition-[transform,opacity] duration-700 ease-out",
    };
  }

  // Transform-only variant — keeps element visible for LCP while still animating
  function rt(delay: number, lift = 20) {
    return {
      style: `transform: translateY(${revealed ? 0 : lift}px); transition-delay: ${delay}ms;`,
      class: "transition-transform duration-700 ease-out",
    };
  }
</script>

<section
  id="hero"
  class="relative min-h-screen md:min-h-0 flex items-start justify-center overflow-hidden bg-black"
>
  <!-- Faint radial glow -->
  <div
    class="absolute inset-0 pointer-events-none"
    style="background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,149,46,0.05) 0%, transparent 70%)"
  ></div>

  <!-- Logo watermark — temporarily removed for LCP testing -->

  <!-- Grain texture -->
  <div class="absolute inset-0 hero-grain opacity-[0.04] pointer-events-none" aria-hidden="true"></div>

  <!-- Hero content -->
  <div class="flex items-start justify-center px-6 pt-24 pb-24 md:pb-6">
    <div class="relative text-center max-w-5xl mx-auto">

      <!-- Eyebrow -->
      <div style={r(0).style} class="{r(0).class} flex items-center justify-center gap-4 mb-8">
        <div class="h-px w-12 bg-gold-500/60"></div>
        <p class="text-gold-400 uppercase tracking-[0.4em] text-xs">Virginia Beach &amp; All of Hampton Roads</p>
        <div class="h-px w-12 bg-gold-500/60"></div>
      </div>

      <!-- Headline -->
      <h1 class="text-6xl md:text-8xl font-heading font-bold leading-[1.05] mb-8 tracking-tight">
        <span style={rt(60).style} class="{rt(60).class} block">Where</span>
        <span style={rt(150).style} class="{rt(150).class} block text-gold-400">Home Begins</span>
      </h1>

      <!-- Brand copy -->
      <p style={r(250).style} class="{r(250).class} text-base md:text-lg text-gray-400 max-w-xl mx-auto mb-5 leading-relaxed">
        At Ackiss Homes, we believe that finding the right property is about more than square footage and price – it's about finding a place where life happens. We bring a personalized, client-first approach to every transaction.
      </p>
      <p style={r(340).style} class="{r(340).class} text-base md:text-lg text-gray-400 max-w-xl mx-auto mb-6 leading-relaxed">
        With deep local market knowledge and a commitment to integrity, we guide buyers, sellers, and investors through every step of the real estate journey. Our reputation is built on results, relationships, and trust.
      </p>

      <!-- Stats -->
      <div style={r(430).style} class="{r(430).class} flex justify-center gap-10 md:gap-16 mb-5">
        {#each stats as stat, i}
          <div class="text-center">
            <p class="text-3xl md:text-4xl font-heading font-bold text-gold-400">
              {counts[i]}{stat.suffix}
            </p>
            <p class="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1.5">{stat.label}</p>
          </div>
        {/each}
      </div>

      <!-- Zillow review links -->
      <div style={r(520).style} class="{r(520).class} flex flex-wrap items-center justify-center gap-3">
        <span class="text-[11px] uppercase tracking-[0.25em] text-gray-400">Verified reviews on</span>
        <div class="h-px w-4 bg-gold-500/30"></div>
        <a
          href="https://www.zillow.com/profile/amanda5867"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gray-500 hover:text-gold-400 focus-visible:outline-none focus-visible:text-gold-400 active:opacity-70 transition-colors duration-300"
        >
          <svg class="w-3.5 h-3.5 text-gold-500/70" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
          Zillow — Amanda
        </a>
        <span class="text-gray-700">·</span>
        <a
          href="https://www.zillow.com/profile/jeremy2621"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gray-500 hover:text-gold-400 focus-visible:outline-none focus-visible:text-gold-400 active:opacity-70 transition-colors duration-300"
        >
          <svg class="w-3.5 h-3.5 text-gold-500/70" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
          Zillow — Jeremy
        </a>
      </div>

      <!-- Scroll indicator -->
      <div style={r(620).style} class="{r(620).class} flex justify-center mt-8" aria-hidden="true">
        <div class="flex flex-col items-center gap-1.5 text-gold-400/40">
          <span class="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <svg class="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

    </div>
  </div>
</section>

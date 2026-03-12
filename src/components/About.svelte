<script lang="ts">
  import { onMount } from "svelte";

  const stats = [
    { target: 200, suffix: "+", label: "Homes Sold" },
    { target: 10, suffix: "+", label: "Years Experience" },
    { target: 50, suffix: "+", label: "5-Star Reviews" },
  ];

  let counts = $state(stats.map(() => 0));

  onMount(() => {
    const els: HTMLElement[] = [];

    stats.forEach((stat, i) => {
      const el = document.getElementById(`stat-${i}`);
      if (!el) return;
      els.push(el);

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(el);
          const duration = 1500;
          const steps = 40;
          const increment = stat.target / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            counts[i] = Math.min(Math.round(increment * step), stat.target);
            if (step >= steps) clearInterval(timer);
          }, duration / steps);
        },
        { threshold: 0.5 }
      );
      observer.observe(el);
    });
  });
</script>

<section id="about" class="py-24 px-6 relative">
  <div class="max-w-6xl mx-auto">

    <!-- Heading -->
    <div class="grid md:grid-cols-[1fr_2fr] gap-8 mb-20">
      <div class="sr sr-left">
        <div class="flex items-center gap-3 mb-4">
          <p class="text-gold-400 uppercase tracking-[0.3em] text-sm">Who We Are</p>
          <div class="h-px w-8 bg-gold-500/40 flex-shrink-0"></div>
        </div>
        <h2 class="text-4xl md:text-5xl font-heading font-bold">About Ackiss Homes</h2>
      </div>
      <div class="sr sr-right md:pt-8">
        <p class="text-gray-400 leading-relaxed text-lg mb-6">
          At Ackiss Homes, we believe that finding the right property is about more than square footage and price – it's about finding a place where life happens. We bring a personalized, client-first approach to every transaction.
        </p>
        <p class="text-gray-400 leading-relaxed text-lg">
          With deep local market knowledge and a commitment to integrity, we guide buyers, sellers, and investors through every step of the real estate journey. Our reputation is built on results, relationships, and trust.
        </p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-5 md:pl-12">
      {#each stats as stat, i}
        <div
          id="stat-{i}"
          class="sr sr-up relative overflow-hidden bg-dark-700 border border-dark-600/50 rounded-sm p-8 text-center hover:-translate-y-2 hover:shadow-lg hover:shadow-gold-500/15 hover:border-gold-500/50 transition-[transform,box-shadow,border-color] duration-300 group"
          style="transition-delay: {i * 100}ms"
        >
          <div class="absolute top-0 left-0 h-[2px] w-0 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 group-hover:w-full transition-[width] duration-500 ease-out" aria-hidden="true"></div>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
            <span class="text-[6rem] font-heading font-bold text-gold-400/[0.06] leading-none">{stat.target}{stat.suffix}</span>
          </div>
          <p class="text-3xl md:text-4xl font-heading font-bold text-gold-400 mb-1 relative z-10">
            {counts[i]}{stat.suffix}
          </p>
          <p class="text-sm text-gray-400 uppercase tracking-wider relative z-10">{stat.label}</p>
        </div>
      {/each}
    </div>

    <!-- Review links -->
    <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
      <span class="text-[11px] uppercase tracking-[0.25em] text-gray-600">Verified reviews on</span>
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

    <div class="mt-8 flex items-center gap-4">
      <div class="h-px flex-1 bg-gradient-to-r from-transparent via-gold-500/20 to-transparent"></div>
    </div>

  </div>
</section>

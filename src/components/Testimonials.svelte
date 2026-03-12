<script lang="ts">
  import { onMount } from "svelte";

  const testimonials = [
    {
      name: "Kathy B.",
      role: "Buyer · Virginia Beach, VA",
      quote: "Amanda was the perfect realtor for us. She was patient and worked with us for over four months, negotiating the best deal for our dream home. If you need a personal recommendation, please reach out. I'd be happy to tell you more about how Amanda rocked our deal!",
    },
    {
      name: "TheAndrewJones",
      role: "Buyer & Seller · Norfolk, VA",
      quote: "Amazing Overall! We worked with Amanda 2 years ago to purchase our first property and used her to sell recently. Extremely friendly and open with each step in the process. Provides plenty of updates as they come. Stress free experience each time. She's quick to respond to questions and has great knowledge with real estate. Would highly recommend her to anyone looking to buy or sell!",
    },
    {
      name: "jholli1985",
      role: "Buyer · Norfolk, VA",
      quote: "Amanda was absolutely amazing. She was knowledgeable and helpful in every way of my home buying experience. She made everything easy. She was always available and responded instantly to all communication. I would 100% recommend her and will be using her in the future as well.",
    },
    {
      name: "JacksonHinkle88",
      role: "First-Time Buyer · Chesapeake, VA",
      quote: "First time buying and he had every answer to my questions. Made the whole process stress less and easy. Would always let me know what the next step was and what to be prepared for. Could not of asked for a better realtor.",
    },
    {
      name: "justin doering757",
      role: "Buyer & Seller · Suffolk, VA",
      quote: "Very knowledgeable about the area and surroundings. Positive experience all around. Would recommend. Good contact and communication as well. We bought and sold our house with him. Seamless timing.",
    },
  ];

  let current = $state(0);
  let isAnimating = $state(false);
  let isPaused = $state(false);
  let prefersReducedMotion = $state(false);
  let touchStartX = 0;
  let touchEndX = 0;

  function goTo(index: number) {
    if (isAnimating) return;
    isAnimating = true;
    current = index;
    setTimeout(() => { isAnimating = false; }, 500);
  }

  function next() { goTo((current + 1) % testimonials.length); }
  function prev() { goTo((current - 1 + testimonials.length) % testimonials.length); }

  onMount(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion = mq.matches;
    const handler = (e: MediaQueryListEvent) => { prefersReducedMotion = e.matches; };
    mq.addEventListener("change", handler);

    const interval = setInterval(() => {
      if (!prefersReducedMotion && !isPaused) next();
    }, 5000);

    return () => {
      clearInterval(interval);
      mq.removeEventListener("change", handler);
    };
  });
</script>

<section id="testimonials" class="py-20 px-6 bg-dark-800 section-texture">
  <div class="max-w-4xl mx-auto">
    <div class="sr sr-up text-center mb-16">
      <div class="flex items-center justify-center gap-3 mb-4">
        <div class="h-px w-8 bg-gold-500/40 flex-shrink-0"></div>
        <p class="text-gold-400 uppercase tracking-[0.3em] text-sm">Testimonials</p>
        <div class="h-px w-8 bg-gold-500/40 flex-shrink-0"></div>
      </div>
      <h2 class="text-4xl md:text-5xl font-heading font-bold">What Our Clients Say</h2>
    </div>

    <div
      class="sr sr-up relative"
      style="transition-delay: 100ms"
      onmouseenter={() => isPaused = true}
      onmouseleave={() => isPaused = false}
      onfocus={() => isPaused = true}
      onblur={() => isPaused = false}
      role="region"
      aria-label="Testimonials carousel"
    >
      <!-- Card -->
      <div
        class="relative overflow-hidden bg-dark-700 border border-dark-600/50 rounded-sm p-10 md:p-14 text-center min-h-[280px] flex flex-col justify-center touch-pan-y"
        ontouchstart={(e: TouchEvent) => { touchStartX = e.touches[0].clientX; }}
        ontouchmove={(e: TouchEvent) => { touchEndX = e.touches[0].clientX; }}
        ontouchend={() => {
          const diff = touchStartX - touchEndX;
          if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
        }}
      >
        <!-- Decorative quote marks -->
        <div class="absolute -top-8 left-4 text-[200px] leading-none font-heading text-gold-400 select-none pointer-events-none" aria-hidden="true">&ldquo;</div>
        <div class="absolute -bottom-8 right-0 text-[200px] leading-none font-heading text-gold-400 select-none pointer-events-none" aria-hidden="true">&rdquo;</div>

        <div class="animate-fade-in relative z-10 pt-8 md:pt-0" aria-live="polite">
          <p class="text-gray-300 leading-relaxed text-lg md:text-xl italic mb-8 max-w-2xl mx-auto">
            {testimonials[current].quote}
          </p>
          <div>
            <p class="font-semibold text-white text-lg">{testimonials[current].name}</p>
            <p class="text-sm text-gray-500">{testimonials[current].role}</p>
          </div>
        </div>
      </div>

      <!-- Prev arrow -->
      <button
        onclick={prev}
        class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-10 h-10 bg-dark-800 border border-dark-600/50 rounded-full flex items-center justify-center text-gray-400 hover:text-gold-400 hover:border-gold-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-90 transition-[color,border-color,transform] duration-300"
        aria-label="Previous testimonial"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Next arrow -->
      <button
        onclick={next}
        class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-10 h-10 bg-dark-800 border border-dark-600/50 rounded-full flex items-center justify-center text-gray-400 hover:text-gold-400 hover:border-gold-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-90 transition-[color,border-color,transform] duration-300"
        aria-label="Next testimonial"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Dots -->
    <div class="flex justify-center gap-2 mt-8">
      {#each testimonials as _, i}
        <button
          onclick={() => goTo(i)}
          class="h-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-90 transition-[width,background-color,transform] duration-300 {i === current ? 'bg-gold-400 w-8' : 'w-2.5 bg-dark-500 hover:bg-warm-400/40'}"
          aria-label="Go to testimonial {i + 1}"
        ></button>
      {/each}
    </div>

  </div>
</section>

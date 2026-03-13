<script lang="ts">
  function formatPhone(value: string): string {
    const d = value.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }

  let submitted = $state(false);
  let loading = $state(false);
  let error = $state("");
  let phone = $state("");
  let confirmEl = $state<HTMLElement | null>(null);

  $effect(() => {
    if (submitted && confirmEl) {
      confirmEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const firstName = (data.get("firstName") as string)?.trim();
    const email = (data.get("email") as string)?.trim();
    const phone = (data.get("phone") as string)?.trim();
    const message = (data.get("message") as string)?.trim();
    if (!firstName || !email || !phone || !message) {
      error = "Please fill in all required fields.";
      return;
    }
    loading = true;
    error = "";

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "contact",
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
          website: data.get("website"),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      submitted = true;
      if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { event_category: "contact" });
    } catch (err) {
      error = err instanceof Error ? err.message : "Something went wrong. Please try again or email us at ackisshomes@gmail.com.";
    } finally {
      loading = false;
    }
  }
</script>

<section id="contact" class="pt-20 pb-10 px-6 relative overflow-hidden">
  <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 70% 50%, rgba(201,149,46,0.045) 0%, transparent 60%)" aria-hidden="true"></div>

  <div class="max-w-3xl mx-auto">
    <div class="sr sr-up text-center mb-12">
      <div class="flex items-center justify-center gap-3 mb-4">
        <div class="h-px w-8 bg-gold-500/40 flex-shrink-0"></div>
        <p class="text-gold-400 uppercase tracking-[0.3em] text-sm">Contact Us</p>
        <div class="h-px w-8 bg-gold-500/40 flex-shrink-0"></div>
      </div>
      <h2 class="text-4xl md:text-5xl font-heading font-bold">Let's Connect!</h2>
    </div>

    <div class="sr sr-up bg-dark-700 border border-dark-600/50 rounded-sm p-8 md:p-10" style="transition-delay: 100ms">
      {#if submitted}
        <div bind:this={confirmEl} class="text-center py-8">
          <p class="text-gold-400 text-lg font-heading font-semibold mb-2">Thank you!</p>
          <p class="text-gray-400">We've received your message and will get back to you shortly.</p>
        </div>
      {:else}
        <form onsubmit={handleSubmit} method="post" class="space-y-5" aria-label="Contact us">
          <!-- Honeypot -->
          <div aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden">
            <label for="contact-website">Website</label>
            <input type="text" id="contact-website" name="website" tabindex="-1" autocomplete="off" />
          </div>

          <div class="grid sm:grid-cols-2 gap-5">
            <div>
              <label for="contact-first-name" class="block text-sm text-gray-400 mb-1.5 uppercase tracking-wider">First Name</label>
              <input type="text" id="contact-first-name" name="firstName" required autocomplete="given-name" class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
            <div>
              <label for="contact-last-name" class="block text-sm text-gray-400 mb-1.5 uppercase tracking-wider">
                Last Name <span class="normal-case tracking-normal text-gray-600 text-xs">(Optional)</span>
              </label>
              <input type="text" id="contact-last-name" name="lastName" autocomplete="family-name" class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-5">
            <div>
              <label for="contact-email" class="block text-sm text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input type="email" id="contact-email" name="email" required autocomplete="email" class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
            <div>
              <label for="contact-phone" class="block text-sm text-gray-400 mb-1.5 uppercase tracking-wider">Phone</label>
              <input type="tel" id="contact-phone" name="phone" required autocomplete="tel"
                value={phone}
                oninput={(e) => { const el = e.currentTarget as HTMLInputElement; phone = formatPhone(el.value); el.value = phone; }}
                placeholder="(      )"
                class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
          </div>

          <div>
            <label for="contact-message" class="block text-sm text-gray-400 mb-1.5 uppercase tracking-wider">Message</label>
            <textarea id="contact-message" name="message" rows="4" required class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors resize-none" placeholder="Tell us how we can help..."></textarea>
          </div>

          {#if error}
            <p class="text-red-400/80 text-sm">{error}</p>
          {/if}

          <p class="text-center text-[11px] text-gray-600">Don't worry, we don't sell your info. We sell homes.</p>

          <button type="submit" disabled={loading} class="btn-shimmer btn-shimmer-filled w-full text-dark-900 font-semibold px-8 py-4 rounded-sm text-sm uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-700 hover:scale-[1.015] active:scale-[0.97] transition-transform duration-300 cursor-pointer">
            <span class="relative z-[2]">{loading ? "Sending…" : "Send Message"}</span>
          </button>
        </form>
      {/if}
    </div>
  </div>
</section>

<script lang="ts">
  function formatPhone(value: string): string {
    const d = value.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }

  const bedOptions = ["Any", "1+", "2+", "3+", "4+", "5+"];
  const bathOptions = ["Any", "1+", "2+", "3+", "4+"];
  const propertyTypes = ["Any", "Single Family", "Townhouse", "Condo", "Multi-Family"];
  const timelines = ["ASAP", "1–3 Months", "3–6 Months", "Just Exploring"];

  const perks = [
    "Live MLS data, so you're never falling in love with homes that are already gone",
    "Personalized matches based on your criteria",
    "Price history, days on market & neighborhood comps",
    "Local expertise from agents who know Hampton Roads",
  ];

  let submitted = $state(false);
  let loading = $state(false);
  let error = $state("");
  let confirmEl = $state<HTMLElement | null>(null);

  $effect(() => {
    if (submitted && confirmEl) {
      confirmEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
  let phone = $state("");
  let beds = $state("Any");
  let baths = $state("Any");
  let propertyType = $state<string[]>(["Any"]);
  let timeline = $state("ASAP");
  let priceMin = $state("");
  let priceMax = $state("");

  function togglePropertyType(opt: string) {
    if (opt === "Any") {
      propertyType = ["Any"];
    } else {
      const without = propertyType.filter(v => v !== "Any");
      if (without.includes(opt)) {
        const next = without.filter(v => v !== opt);
        propertyType = next.length ? next : ["Any"];
      } else {
        propertyType = [...without, opt];
      }
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const firstName = (data.get("firstName") as string)?.trim();
    const email = (data.get("email") as string)?.trim();
    const phone = (data.get("phone") as string)?.trim();
    if (!firstName || !email || !phone) {
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
          formType: "inquiry",
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          email: data.get("email"),
          phone: data.get("phone"),
          beds,
          baths,
          priceMin,
          priceMax,
          propertyTypes: propertyType,
          timeline,
          preApproval: data.get("preApproval") || "",
          notes: data.get("notes") || "",
          website: data.get("website"),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      submitted = true;
    } catch (err) {
      error = err instanceof Error ? err.message : "Something went wrong. Please try again.";
    } finally {
      loading = false;
    }
  }

  const btnBase = "px-3 py-1.5 rounded-sm text-sm border transition-[background-color,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95";
  const btnActive = "btn-option-selected";
  const btnInactive = "bg-dark-800 border-gray-600 text-gray-400 hover:border-gold-500/50 hover:text-gray-200";
</script>

<section id="property-inquiry" class="py-20 px-6 relative overflow-hidden scroll-mt-28 md:scroll-mt-16">
  <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 30% 50%, rgba(201,149,46,0.06) 0%, transparent 60%)" aria-hidden="true"></div>

  <div class="max-w-6xl mx-auto">
    <div class="grid md:grid-cols-2 gap-12 items-start">

      <!-- Left — value prop -->
      <div class="sr sr-left md:sticky md:top-28">
        <div class="flex items-center gap-3 mb-4">
          <p class="text-gold-400 uppercase tracking-[0.3em] text-sm">Customized Home Search</p>
          <div class="h-px w-8 bg-gold-500/40 flex-shrink-0"></div>
        </div>
        <h2 class="text-4xl md:text-5xl font-heading font-bold mb-6">Find Your Perfect Home</h2>
        <p class="text-gray-400 leading-relaxed text-lg mb-8">Tell us what you're looking for and we'll do the work for you.</p>
        <ul class="space-y-3">
          {#each perks as perk}
            <li class="flex items-start gap-3 text-gray-300">
              <svg class="w-4 h-4 text-gold-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {perk}
            </li>
          {/each}
        </ul>
      </div>

      <!-- Right — form -->
      <div class="sr sr-right bg-dark-700 border border-dark-600/50 rounded-sm p-8">
        {#if submitted}
          <div bind:this={confirmEl} class="text-center py-8">
            <p class="text-gold-400 text-lg font-heading font-semibold mb-2">We're on it!</p>
            <p class="text-gray-400">We'll search the MLS for homes that match and reach out to you shortly.</p>
          </div>
        {:else}
          <form onsubmit={handleSubmit} method="post" class="space-y-6" aria-label="Home search preferences">
            <!-- Honeypot -->
            <div aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden">
              <label for="inquiry-website">Website</label>
              <input type="text" id="inquiry-website" name="website" tabindex="-1" autocomplete="off" />
            </div>

            <!-- Beds -->
            <div>
              <p class="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Bedrooms</p>
              <div class="flex flex-wrap gap-2">
                {#each bedOptions as opt}
                  <button type="button" onclick={() => beds = opt} class="{btnBase} {beds === opt ? btnActive : btnInactive}">{opt}</button>
                {/each}
              </div>
            </div>

            <!-- Baths -->
            <div>
              <p class="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Bathrooms</p>
              <div class="flex flex-wrap gap-2">
                {#each bathOptions as opt}
                  <button type="button" onclick={() => baths = opt} class="{btnBase} {baths === opt ? btnActive : btnInactive}">{opt}</button>
                {/each}
              </div>
            </div>

            <!-- Price range -->
            <div>
              <p class="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Price Range</p>
              <div class="flex items-center gap-3">
                <input type="text" inputmode="decimal" bind:value={priceMin} class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors text-sm" placeholder="Min (e.g. $200k)" />
                <span class="text-gray-600 flex-shrink-0">–</span>
                <input type="text" inputmode="decimal" bind:value={priceMax} class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors text-sm" placeholder="Max (e.g. $500k)" />
              </div>
            </div>

            <!-- Property type -->
            <div>
              <p class="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Property Type(s)</p>
              <div class="flex flex-wrap gap-2">
                {#each propertyTypes as opt}
                  <button type="button" onclick={() => togglePropertyType(opt)} class="{btnBase} {propertyType.includes(opt) ? btnActive : btnInactive}">{opt}</button>
                {/each}
              </div>
            </div>

            <!-- Timeline -->
            <div>
              <p class="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Timeline</p>
              <div class="flex flex-wrap gap-2">
                {#each timelines as opt}
                  <button type="button" onclick={() => timeline = opt} class="{btnBase} {timeline === opt ? btnActive : btnInactive}">{opt}</button>
                {/each}
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label for="inquiry-notes" class="block text-sm text-gray-400 mb-2 uppercase tracking-wider">
                Anything Else? <span class="normal-case tracking-normal text-gray-600 text-xs">(Optional)</span>
              </label>
              <textarea id="inquiry-notes" name="notes" rows="3" class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors resize-none text-sm" placeholder="Garage, yard, school district, specific neighborhoods..."></textarea>
            </div>

            <!-- Contact info -->
            <div class="border-t border-dark-600/50 pt-6 space-y-4">
              <p class="text-xs text-gray-600 text-center">Don't worry, we don't sell your info. We sell homes.</p>
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label for="inquiry-first-name" class="block text-sm text-gray-400 mb-1.5 uppercase tracking-wider">First Name</label>
                  <input type="text" id="inquiry-first-name" name="firstName" required autocomplete="given-name" class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
                <div>
                  <label for="inquiry-last-name" class="block text-sm text-gray-400 mb-1.5 uppercase tracking-wider">Last Name</label>
                  <input type="text" id="inquiry-last-name" name="lastName" required autocomplete="family-name" class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
              </div>
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label for="inquiry-email" class="block text-sm text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                  <input type="email" id="inquiry-email" name="email" required autocomplete="email" class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
                <div>
                  <label for="inquiry-phone" class="block text-sm text-gray-400 mb-1.5 uppercase tracking-wider">Phone</label>
                  <input type="tel" id="inquiry-phone" name="phone" required autocomplete="tel"
                    value={phone}
                    oninput={(e) => { const el = e.currentTarget as HTMLInputElement; phone = formatPhone(el.value); el.value = phone; }}
                    placeholder="(      )"
                    class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
              </div>
            </div>

            {#if error}
              <p class="text-red-400/80 text-sm">{error}</p>
            {/if}

            <button type="submit" disabled={loading} class="btn-shimmer btn-shimmer-filled w-full text-dark-900 font-semibold px-8 py-4 rounded-sm text-sm uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-700 hover:scale-[1.015] active:scale-[0.97] transition-transform duration-300 cursor-pointer">
              <span class="relative z-[2]">{loading ? "Submitting…" : "Find My Home →"}</span>
            </button>
          </form>
        {/if}
      </div>

    </div>
  </div>
</section>

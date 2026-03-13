<script lang="ts">
  import { onMount } from "svelte";

  const AUTH_KEY = "ackiss_auth";
  const PASSWORD = "Squad123";

  type Stage = "form" | "submitting" | "done" | "error";

  let authed = $state(false);
  let value = $state("");
  let authError = $state(false);
  let shake = $state(false);
  let stage = $state<Stage>("form");

  onMount(() => {
    if (localStorage.getItem(AUTH_KEY) === "1") authed = true;
  });

  function handleAuthSubmit(e: Event) {
    e.preventDefault();
    if (value === PASSWORD) {
      localStorage.setItem(AUTH_KEY, "1");
      authed = true;
    } else {
      authError = true;
      shake = true;
      value = "";
      setTimeout(() => { shake = false; }, 500);
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);

    // Honeypot check
    if (data.get("website")) return;

    stage = "submitting";

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "referral",
          firstName: (data.get("refFirstName") as string || "").trim(),
          lastName: (data.get("refLastName") as string || "").trim(),
          email: data.get("email"),
          phone: data.get("phone"),
          referrerName: (data.get("referrerName") as string || "").trim(),
          intent: data.get("intent"),
          notes: data.get("notes"),
          website: data.get("website"),
        }),
      });
      if (!res.ok) throw new Error();
      stage = "done";
    } catch {
      stage = "error";
    }
  }
</script>

<!-- Ambient glow + grain (shared by both states) -->
<div class="fixed inset-0 pointer-events-none" aria-hidden="true"
  style="background: radial-gradient(ellipse 80% 60% at 50% 35%, rgba(201,149,46,0.08) 0%, transparent 70%)"></div>
<div class="fixed inset-0 hero-grain opacity-[0.04] pointer-events-none" aria-hidden="true"></div>

{#if !authed}
  <!-- ── Password Gate ─────────────────────────────────────────────── -->
  <div class="min-h-screen bg-black flex items-center justify-center px-6">
    <div class="relative w-full max-w-sm text-center">

      <a href="/" class="inline-flex flex-col items-center gap-2 mb-10 focus-visible:outline-none focus-visible:opacity-70">
        <img src="/logo-a-v2.svg" alt="Ackiss Homes" width="40" height="37" class="opacity-80 h-10 w-auto" />
        <span class="text-[9px] uppercase tracking-[0.35em] text-gold-500/70">Internal Access</span>
      </a>

      <h1 class="font-heading font-bold text-3xl text-white mb-2">Team Portal</h1>
      <p class="text-gray-600 text-sm mb-8">Enter the password to continue.</p>

      <form onsubmit={handleAuthSubmit} class={shake ? "shake" : ""}>
        <input
          type="password"
          bind:value
          oninput={() => { authError = false; }}
          placeholder="Password"
          class="w-full bg-dark-800 border rounded-sm px-4 py-3 text-white placeholder-gray-600 text-sm text-center tracking-widest focus:outline-none transition-[border-color] duration-200 mb-3 {authError ? 'border-red-500/60' : 'border-dark-600 focus:border-gold-500'}"
        />
        {#if authError}
          <p class="text-red-400 text-xs mb-3">Incorrect password – try again.</p>
        {/if}
        <button
          type="submit"
          class="btn-shimmer btn-shimmer-filled w-full py-3 rounded-sm text-dark-900 font-semibold text-sm uppercase tracking-widest hover:scale-[1.015] active:scale-[0.98] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <span class="relative z-[2]">Enter</span>
        </button>
      </form>
    </div>
  </div>

{:else}
  <!-- ── Referral Page ───────────────────────────────────────────────── -->
  <div class="min-h-screen bg-black flex flex-col animate-page-reveal">

    <main class="relative z-10 flex-1 flex items-center justify-center px-6 pt-20 pb-16">
      <div class="w-full max-w-md">

        {#if stage === "done"}
          <!-- Success state -->
          <div class="text-center">
            <div class="flex justify-center mb-8 mt-0" aria-hidden="true">
              <div class="relative">
                <div class="absolute inset-0 blur-2xl opacity-50"
                  style="background: radial-gradient(circle, rgba(201,149,46,0.5) 0%, transparent 70%)"></div>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none"
                  class="relative drop-shadow-[0_0_12px_rgba(201,149,46,0.4)]">
                  <circle cx="26" cy="26" r="22" stroke="#c9952e" stroke-width="2" fill="rgba(201,149,46,0.08)" />
                  <path d="M16 26l7 7 13-13" stroke="#c9952e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
            <div class="flex items-center justify-center gap-4 mb-5">
              <div class="h-px w-8 bg-gold-500/40"></div>
              <p class="text-gold-400 uppercase tracking-[0.35em] text-[10px]">Thank You</p>
              <div class="h-px w-8 bg-gold-500/40"></div>
            </div>
            <h1 class="font-heading font-bold text-5xl text-center leading-[1.05] tracking-tight text-white mb-5">
              We'll Take<br />Good Care.
            </h1>
            <p class="text-gray-400 text-center leading-relaxed text-sm max-w-sm mx-auto">
              Your referral has been sent to our team. We'll reach out personally and make sure they're in great hands — just like you were.
            </p>
          </div>

        {:else}
          <!-- Form state -->

          <!-- Icon -->
          <div class="flex justify-center mb-8 mt-0" aria-hidden="true">
            <div class="relative">
              <div class="absolute inset-0 blur-2xl opacity-50"
                style="background: radial-gradient(circle, rgba(201,149,46,0.5) 0%, transparent 70%)"></div>
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none"
                class="relative drop-shadow-[0_0_12px_rgba(201,149,46,0.4)]">
                <circle cx="18" cy="18" r="9" stroke="#c9952e" stroke-width="2.5" fill="rgba(201,149,46,0.1)" />
                <circle cx="34" cy="18" r="9" stroke="#c9952e" stroke-width="2.5" fill="rgba(201,149,46,0.1)" />
                <path d="M27 18h-2" stroke="#c9952e" stroke-width="2" stroke-linecap="round" />
                <circle cx="18" cy="15" r="3" fill="rgba(201,149,46,0.5)" />
                <circle cx="34" cy="15" r="3" fill="rgba(201,149,46,0.5)" />
                <path d="M10 36c2-4 8-6 16-6s14 2 16 6" stroke="#c9952e" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
          </div>

          <!-- Eyebrow -->
          <div class="flex items-center justify-center gap-4 mb-5">
            <div class="h-px w-8 bg-gold-500/40"></div>
            <p class="text-gold-400 uppercase tracking-[0.35em] text-[10px]">Send a Referral</p>
            <div class="h-px w-8 bg-gold-500/40"></div>
          </div>

          <!-- Headline -->
          <h1 class="font-heading font-bold text-5xl md:text-6xl text-center leading-[1.05] tracking-tight text-white mb-5">
            Know Someone<br />Ready to Move?
          </h1>

          <!-- Body -->
          <p class="text-gray-400 text-center leading-relaxed text-sm max-w-sm mx-auto mb-2">
            Referrals from trusted clients are the greatest compliment we receive. Fill in your friend's info and we'll reach out personally — no pressure, just a conversation.
          </p>
          <p class="text-center text-[11px] text-gray-600 uppercase tracking-[0.2em] mb-10">
            Takes less than 2 minutes
          </p>

          <!-- Divider -->
          <div class="h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent mb-10"></div>

          <!-- Form -->
          <form onsubmit={handleSubmit} class="space-y-4" novalidate>

            <!-- Honeypot -->
            <div aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden">
              <label for="referral-website">Website</label>
              <input type="text" id="referral-website" name="website" tabindex="-1" autocomplete="off" />
            </div>

            <!-- Your name -->
            <div>
              <label for="referrerName" class="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
                Your Name
              </label>
              <input
                id="referrerName"
                name="referrerName"
                type="text"
                required
                placeholder="Your full name"
                class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold-500 transition-[border-color] duration-200"
              />
            </div>

            <!-- Divider -->
            <div class="h-px bg-gradient-to-r from-transparent via-dark-600 to-transparent my-2"></div>
            <p class="text-[10px] uppercase tracking-[0.25em] text-gray-600 text-center">Their info</p>

            <!-- Referred person name -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="refFirstName" class="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
                  First Name
                </label>
                <input
                  id="refFirstName"
                  name="refFirstName"
                  type="text"
                  required
                  placeholder="First"
                  class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold-500 transition-[border-color] duration-200"
                />
              </div>
              <div>
                <label for="refLastName" class="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
                  Last Name
                </label>
                <input
                  id="refLastName"
                  name="refLastName"
                  type="text"
                  placeholder="Last"
                  class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold-500 transition-[border-color] duration-200"
                />
              </div>
            </div>

            <!-- Email -->
            <div>
              <label for="refEmail" class="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
                Their Email
              </label>
              <input
                id="refEmail"
                name="email"
                type="email"
                placeholder="their@email.com"
                class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold-500 transition-[border-color] duration-200"
              />
            </div>

            <!-- Phone -->
            <div>
              <label for="refPhone" class="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
                Their Phone
              </label>
              <input
                id="refPhone"
                name="phone"
                type="tel"
                placeholder="(757) 000-0000"
                class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold-500 transition-[border-color] duration-200"
              />
            </div>

            <!-- Intent -->
            <div>
              <label for="intent" class="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
                Are They Looking to…
              </label>
              <select
                id="intent"
                name="intent"
                class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-[border-color] duration-200 appearance-none text-gray-300"
              >
                <option value="" disabled selected class="text-gray-600">Select one</option>
                <option value="Buy">Buy a home</option>
                <option value="Sell">Sell a home</option>
                <option value="Buy and Sell">Buy &amp; sell</option>
                <option value="Not sure">Not sure yet</option>
              </select>
            </div>

            <!-- Notes -->
            <div>
              <label for="refNotes" class="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
                Anything Else We Should Know? <span class="normal-case tracking-normal text-gray-700 text-xs">(optional)</span>
              </label>
              <textarea
                id="refNotes"
                name="notes"
                rows="3"
                placeholder="Timeline, budget, neighborhood, anything helpful…"
                class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold-500 transition-[border-color] duration-200 resize-none"
              ></textarea>
            </div>

            {#if stage === "error"}
              <p class="text-red-400 text-xs text-center">
                Something went wrong. Please try again or email us at ackisshomes@gmail.com.
              </p>
            {/if}

            <button
              type="submit"
              disabled={stage === "submitting"}
              class="btn-shimmer btn-shimmer-filled flex items-center justify-center gap-2 w-full py-4 rounded-sm text-dark-900 font-semibold text-sm uppercase tracking-widest disabled:opacity-60 hover:scale-[1.015] active:scale-[0.98] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span class="relative z-[2]">{stage === "submitting" ? "Sending…" : "Send Referral →"}</span>
            </button>
          </form>

          <!-- Sign-off -->
          <p class="text-center text-[11px] text-gray-700 mt-10 leading-relaxed">
            We'll reach out to your friend with care. Your name will be mentioned — they'll know a trusted client sent them our way.
          </p>
        {/if}

      </div>
    </main>
  </div>
{/if}

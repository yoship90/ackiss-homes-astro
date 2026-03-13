<script lang="ts">
  import { onMount } from "svelte";

  const AUTH_KEY = "ackiss_auth";
  const PASSWORD = "Squad123";

  let authed = $state(false);
  let value = $state("");
  let authError = $state(false);
  let shake = $state(false);

  const sections = [
    { id: "big-picture",  label: "The Big Picture" },
    { id: "meta-pixel",   label: "The Meta Pixel" },
    { id: "retargeting",  label: "Retargeting" },
    { id: "lookalike",    label: "Lookalike Audiences" },
    { id: "instagram",    label: "Instagram Ads" },
    { id: "tiktok",       label: "TikTok" },
    { id: "priority",     label: "What to Do First" },
    { id: "setup",        label: "Your Action Items" },
  ];

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
</script>

<!-- Ambient glow + grain -->
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
  <!-- ── Ads Guide ───────────────────────────────────────────────────── -->
  <div class="min-h-screen bg-black animate-page-reveal">

    <div class="max-w-5xl mx-auto px-6 pt-20 pb-14 flex gap-12">

      <!-- Sidebar nav — desktop only -->
      <aside class="hidden lg:block w-48 shrink-0">
        <div class="sticky top-24 space-y-1">
          <p class="text-[9px] uppercase tracking-[0.3em] text-gray-600 mb-4">On this page</p>
          {#each sections as s}
            <a
              href="#{s.id}"
              class="block text-xs text-gray-500 hover:text-gold-400 transition-colors py-1 leading-snug"
            >{s.label}</a>
          {/each}
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 min-w-0 space-y-16">

        <!-- Hero -->
        <div>
          <div class="flex items-center gap-3 mb-4">
            <p class="text-gold-400 uppercase tracking-[0.3em] text-xs">Internal Reference</p>
            <div class="h-px w-8 bg-gold-500/40"></div>
          </div>
          <h1 class="text-4xl md:text-5xl font-heading font-bold mb-4">
            Facebook &amp; Instagram <span class="text-gold-400">Ads Guide</span>
          </h1>
          <p class="text-gray-400 max-w-xl leading-relaxed">
            Everything you need to know about Meta advertising, the Pixel, retargeting, and what to do next — written specifically for Ackiss Homes.
          </p>
        </div>

        <!-- ── 1. The Big Picture ──────────────────────────────────────── -->
        <section>
          <div id="big-picture" class="mb-6 pt-2">
            <p class="text-gold-400 uppercase tracking-[0.3em] text-[10px] mb-2">Overview</p>
            <h2 class="text-2xl md:text-3xl font-heading font-bold text-white">The Big Picture</h2>
          </div>
          <div class="space-y-4 text-gray-400 leading-relaxed">
            <p>
              Facebook and Instagram ads are run from a single platform — <strong class="text-white">Meta Ads Manager</strong>. One account, one budget, one set of targeting tools covers both platforms simultaneously. You choose which platforms to show your ads on, or let Meta decide automatically where they perform best.
            </p>
            <p>
              The reason Meta ads are so powerful for real estate is that Meta has <strong class="text-white">extraordinarily detailed data</strong> on its users — age, location, income signals, homeownership status, life events (recently engaged, new job, recently moved), and browsing behavior. You can put your ads in front of exactly the right people.
            </p>
          </div>
          <div class="mt-6 overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-dark-600/50">
                  <th class="text-left text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-3 pr-6 font-normal">Platform</th>
                  <th class="text-left text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-3 pr-6 font-normal">Best for</th>
                  <th class="text-left text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-3 pr-6 font-normal">Core demographic</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-dark-600/20">
                  <td class="py-3 pr-6 text-gray-400 align-top">Facebook</td>
                  <td class="py-3 pr-6 text-gray-400 align-top">Older buyers, sellers, referral network</td>
                  <td class="py-3 pr-6 text-gray-400 align-top">35–65+</td>
                </tr>
                <tr class="border-b border-dark-600/20">
                  <td class="py-3 pr-6 text-gray-400 align-top">Instagram</td>
                  <td class="py-3 pr-6 text-gray-400 align-top">First-time buyers, move-up buyers, visual listings</td>
                  <td class="py-3 pr-6 text-gray-400 align-top">25–44</td>
                </tr>
                <tr class="border-b-0">
                  <td class="py-3 pr-6 text-gray-400 align-top">Both together</td>
                  <td class="py-3 pr-6 text-gray-400 align-top">Full-funnel coverage</td>
                  <td class="py-3 pr-6 text-gray-400 align-top">All age groups</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-6 border border-gold-500/20 bg-gold-500/5 text-gold-300 rounded-sm px-5 py-4 text-sm leading-relaxed">
            <strong>Key insight:</strong> Instagram is arguably more valuable for real estate than Facebook right now. Real estate is visual — a great listing photo or 30-second property walkthrough Reel performs extremely well there, and the 25–44 demographic is exactly your buyer market.
          </div>
        </section>

        <!-- ── 2. The Meta Pixel ───────────────────────────────────────── -->
        <section>
          <div id="meta-pixel" class="mb-6 pt-2">
            <p class="text-gold-400 uppercase tracking-[0.3em] text-[10px] mb-2">The Foundation</p>
            <h2 class="text-2xl md:text-3xl font-heading font-bold text-white">The Meta Pixel</h2>
          </div>
          <div class="space-y-4 text-gray-400 leading-relaxed">
            <p>
              The Meta Pixel is a small piece of JavaScript code installed on ackisshomes.com. Once in place, it runs invisibly in the background on every page. When someone visits the site, the Pixel fires and sends that visit data to Meta — matched back to their Facebook or Instagram account if they're logged in.
            </p>
            <p>
              Think of it as a silent list-builder. Every person who visits your website automatically gets added to an audience pool that you can later advertise to.
            </p>
          </div>
          <div class="mt-6 grid md:grid-cols-2 gap-4">
            <div class="bg-dark-700 border border-dark-600/50 rounded-sm p-6">
              <p class="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">What it tracks</p>
              <ul class="space-y-2 text-sm text-gray-400">
                {#each ["Who visited the site", "Which pages they viewed", "Whether they submitted a form", "How long they spent on the site", "Whether they came back later"] as item}
                  <li class="flex items-start gap-2">
                    <span class="text-gold-500 mt-0.5">→</span>
                    {item}
                  </li>
                {/each}
              </ul>
            </div>
            <div class="bg-dark-700 border border-dark-600/50 rounded-sm p-6">
              <p class="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">What it enables</p>
              <ul class="space-y-2 text-sm text-gray-400">
                {#each ["Show ads to past site visitors", "Find new people similar to your visitors", "Measure exactly which ads drive leads", "Optimize ad spend automatically", "Track cost per lead precisely"] as item}
                  <li class="flex items-start gap-2">
                    <span class="text-gold-500 mt-0.5">→</span>
                    {item}
                  </li>
                {/each}
              </ul>
            </div>
          </div>
          <div class="mt-4 border border-blue-500/20 bg-blue-500/5 text-blue-300 rounded-sm px-5 py-4 text-sm leading-relaxed">
            <strong>Important:</strong> The Pixel data is cumulative and can't be collected retroactively. Every day without it installed is visitor data permanently lost. Even at low traffic, installing it now means the audience pool is already building by the time you're ready to run ads.
          </div>
        </section>

        <!-- ── 3. Retargeting ──────────────────────────────────────────── -->
        <section>
          <div id="retargeting" class="mb-6 pt-2">
            <p class="text-gold-400 uppercase tracking-[0.3em] text-[10px] mb-2">Audience Type 1</p>
            <h2 class="text-2xl md:text-3xl font-heading font-bold text-white">Retargeting</h2>
          </div>
          <div class="space-y-4 text-gray-400 leading-relaxed">
            <p>
              Retargeting means showing ads specifically to people who have <strong class="text-white">already visited your website</strong>. These are your warmest possible prospects — they already know who Ackiss Homes is.
            </p>
          </div>
          <div class="mt-6 bg-dark-700 border border-dark-600/50 rounded-sm p-6">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4">How it plays out</p>
            <div class="space-y-3">
              {#each [
                { step: "1", text: "Someone searches 'Virginia Beach real estate agent' and finds ackisshomes.com" },
                { step: "2", text: "They browse around, use the mortgage calculator, but don't contact you" },
                { step: "3", text: "They go back to scrolling Instagram that evening" },
                { step: "4", text: "Your ad appears in their feed: 'Still thinking about buying in Virginia Beach?'" },
                { step: "5", text: "They click, come back, and submit the contact form" },
              ] as item}
                <div class="flex items-start gap-3 text-sm text-gray-400">
                  <span class="shrink-0 w-5 h-5 rounded-full bg-dark-600 text-gray-500 flex items-center justify-center text-[10px] mt-0.5">{item.step}</span>
                  {item.text}
                </div>
              {/each}
            </div>
          </div>
          <div class="mt-6">
            <p class="text-sm text-gray-500 mb-4">Why retargeting outperforms cold ads:</p>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-dark-600/50">
                    <th class="text-left text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-3 pr-6 font-normal">Audience</th>
                    <th class="text-left text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-3 pr-6 font-normal">Cost per 1k impressions</th>
                    <th class="text-left text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-3 pr-6 font-normal">Conversion rate</th>
                    <th class="text-left text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-3 pr-6 font-normal">Cost per lead</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-dark-600/20">
                    <td class="py-3 pr-6 text-gray-400 align-top">Broad / untargeted</td>
                    <td class="py-3 pr-6 text-gray-400 align-top">Lower</td>
                    <td class="py-3 pr-6 text-gray-400 align-top">~0.5%</td>
                    <td class="py-3 pr-6 text-gray-400 align-top">~$40+</td>
                  </tr>
                  <tr>
                    <td class="py-3 pr-6 text-gold-400 font-medium align-top">Retargeting (past visitors)</td>
                    <td class="py-3 pr-6 text-gray-400 align-top">Similar</td>
                    <td class="py-3 pr-6 text-gray-400 align-top">~5–15%</td>
                    <td class="py-3 pr-6 text-gold-400 font-medium align-top">~$5–10</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="text-xs text-gray-600 mt-2">Numbers are illustrative. Actual results vary by market, creative, and budget.</p>
          </div>
        </section>

        <!-- ── 4. Lookalike Audiences ──────────────────────────────────── -->
        <section>
          <div id="lookalike" class="mb-6 pt-2">
            <p class="text-gold-400 uppercase tracking-[0.3em] text-[10px] mb-2">Audience Type 2</p>
            <h2 class="text-2xl md:text-3xl font-heading font-bold text-white">Lookalike Audiences</h2>
          </div>
          <div class="space-y-4 text-gray-400 leading-relaxed">
            <p>
              Once the Pixel has collected enough visitors (typically 1,000+), Meta can analyze what those people have in common and find <strong class="text-white">thousands of new people who match that profile</strong> — even if they've never heard of Ackiss Homes.
            </p>
            <p>
              This is how you reach brand new prospects without guessing at who to target manually. Meta's data is deep enough to identify people who look like your typical buyer or seller based on dozens of signals — not just age and zip code.
            </p>
          </div>
          <div class="mt-6 grid md:grid-cols-3 gap-4">
            {#each [
              { label: "Life events", examples: "Recently engaged, new job, recently moved, expecting a baby" },
              { label: "Financial signals", examples: "Income bracket, homeownership status, credit card behavior" },
              { label: "Behavior", examples: "Browsing real estate content, Zillow activity, mortgage research" },
            ] as item}
              <div class="bg-dark-700 border border-dark-600/50 rounded-sm p-6">
                <p class="text-xs font-semibold text-white mb-2">{item.label}</p>
                <p class="text-xs text-gray-500 leading-relaxed">{item.examples}</p>
              </div>
            {/each}
          </div>
          <div class="mt-6 border border-gold-500/20 bg-gold-500/5 text-gold-300 rounded-sm px-5 py-4 text-sm leading-relaxed">
            <strong>No extra setup needed.</strong> Lookalike Audiences are built automatically from your Pixel data inside Meta Ads Manager. Once you have 1,000+ visitors collected, the option simply appears as a button when creating a campaign. Installing the Pixel is the only prerequisite.
          </div>
        </section>

        <!-- ── 5. Instagram Ads ────────────────────────────────────────── -->
        <section>
          <div id="instagram" class="mb-6 pt-2">
            <p class="text-gold-400 uppercase tracking-[0.3em] text-[10px] mb-2">Platform</p>
            <h2 class="text-2xl md:text-3xl font-heading font-bold text-white">Instagram Ads</h2>
          </div>
          <div class="space-y-4 text-gray-400 leading-relaxed">
            <p>
              Instagram is part of the same Meta platform — the same Pixel, the same Ads Manager, the same targeting. You don't set up anything separately for Instagram. When creating a campaign you simply check which placements you want, and Instagram is one of them.
            </p>
          </div>
          <div class="mt-6">
            <p class="text-sm text-gray-500 mb-4">Ad formats that work well for real estate on Instagram:</p>
            <div class="space-y-3">
              {#each [
                { format: "Single image", desc: "A great listing photo with a clear headline and CTA. Simple, effective, especially for retargeting." },
                { format: "Carousel", desc: "Swipe through multiple images — perfect for showing multiple rooms of a listing or several properties at once." },
                { format: "Reels / Video", desc: "15–30 second property walkthrough, neighborhood tour, or market update. Highest engagement format right now. Also gets organic reach to non-followers." },
                { format: "Stories", desc: "Full-screen vertical ads between Stories. High visibility, feels native. Quick swipe-up to your site." },
              ] as item}
                <div class="flex gap-4 p-4 bg-dark-700/50 border border-dark-600/30 rounded-sm">
                  <span class="shrink-0 text-xs font-semibold text-gold-400 w-24">{item.format}</span>
                  <span class="text-sm text-gray-400">{item.desc}</span>
                </div>
              {/each}
            </div>
          </div>
          <div class="mt-6 border border-amber-500/20 bg-amber-500/5 text-amber-300 rounded-sm px-5 py-4 text-sm leading-relaxed">
            <strong>Organic vs. Paid are different strategies.</strong> Posting regularly to your Instagram account (free) builds your brand and following over time. Paid ads reach people who don't follow you. Both are valuable — organic builds trust, paid drives specific campaigns. They work best together.
          </div>
        </section>

        <!-- ── 6. TikTok ───────────────────────────────────────────────── -->
        <section>
          <div id="tiktok" class="mb-6 pt-2">
            <p class="text-gold-400 uppercase tracking-[0.3em] text-[10px] mb-2">Platform</p>
            <h2 class="text-2xl md:text-3xl font-heading font-bold text-white">TikTok — Worth It?</h2>
          </div>
          <div class="space-y-4 text-gray-400 leading-relaxed">
            <p>
              TikTok is worth understanding, but the answer for Ackiss Homes is: <strong class="text-white">don't run TikTok ads yet, but do consider it for organic content.</strong>
            </p>
          </div>
          <div class="mt-6 grid md:grid-cols-2 gap-4">
            <div class="bg-dark-700 border border-dark-600/50 rounded-sm p-6">
              <p class="text-[10px] uppercase tracking-[0.2em] text-emerald-400/70 mb-3">The case for it</p>
              <ul class="space-y-3 text-sm text-gray-400">
                {#each [
                  { title: "Audience older than you think", desc: "25–34 is now one of TikTok's largest segments — that's first-time homebuyer territory." },
                  { title: "Organic reach is exceptional", desc: "A property walkthrough that might reach 500 people on Instagram could reach 50,000 on TikTok for free. The algorithm pushes content to non-followers aggressively." },
                  { title: "Ads are currently cheaper", desc: "The ad platform is less saturated than Meta right now. Cost per click and cost per lead tend to be lower — though that gap will close." },
                ] as item}
                  <li class="flex items-start gap-2">
                    <span class="text-emerald-400 mt-0.5 shrink-0">→</span>
                    <span><strong class="text-white">{item.title}.</strong> {item.desc}</span>
                  </li>
                {/each}
              </ul>
            </div>
            <div class="bg-dark-700 border border-dark-600/50 rounded-sm p-6">
              <p class="text-[10px] uppercase tracking-[0.2em] text-red-400/70 mb-3">The case against it</p>
              <ul class="space-y-3 text-sm text-gray-400">
                {#each [
                  { title: "Video only", desc: "TikTok is video-only. No image ads or carousels. Someone needs to be comfortable on camera filming walkthroughs, market updates, neighborhood content." },
                  { title: "Weaker local targeting", desc: "Meta's zip code and radius targeting is more precise. For a hyperlocal Virginia Beach business, Meta is simply better for paid ads." },
                  { title: "Platform uncertainty", desc: "TikTok has faced ongoing US ban threats for over a year. Investing heavily in a platform that could be restricted is a real risk. Meta isn't going anywhere." },
                  { title: "Less refined ad tools", desc: "The TikTok Pixel exists but isn't as mature as Meta's. Retargeting and lookalike audiences work, but the sophistication isn't there yet." },
                ] as item}
                  <li class="flex items-start gap-2">
                    <span class="text-red-400 mt-0.5 shrink-0">→</span>
                    <span><strong class="text-white">{item.title}.</strong> {item.desc}</span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>
          <div class="mt-6 overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-dark-600/50">
                  <th class="text-left text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-3 pr-6 font-normal"></th>
                  <th class="text-left text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-3 pr-6 font-normal">Meta (Facebook/Instagram)</th>
                  <th class="text-left text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-3 pr-6 font-normal">TikTok</th>
                </tr>
              </thead>
              <tbody>
                {#each [
                  ["Ad platform maturity",    "Very mature",                       "Less mature"],
                  ["Local targeting",          "Excellent",                         "Good but weaker"],
                  ["Pixel / retargeting",      "Industry-leading",                  "Exists, less refined"],
                  ["Ad cost right now",        "Moderate",                          "Currently lower"],
                  ["Organic reach",            "Weak on FB, decent on Reels",       "Exceptional"],
                  ["Content requirement",      "Images or video",                   "Video only"],
                  ["Platform stability",       "Very stable",                       "Uncertain (ban risk)"],
                  ["Best use for real estate", "Paid ads + retargeting",            "Organic video content"],
                ] as row}
                  <tr class="border-b border-dark-600/20 last:border-0">
                    <td class="py-3 pr-6 text-gray-500 text-xs align-top">{row[0]}</td>
                    <td class="py-3 pr-6 text-gray-400 align-top">{row[1]}</td>
                    <td class="py-3 pr-6 text-gray-400 align-top">{row[2]}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <div class="mt-6 border border-gold-500/20 bg-gold-500/5 text-gold-300 rounded-sm px-5 py-4 text-sm leading-relaxed">
            <strong>The organic opportunity is real.</strong> Some of the most successful real estate agents on TikTok aren't running a single paid ad — they post consistently (property tours, "what $400k buys you in Virginia Beach," neighborhood guides, market updates) and let the algorithm drive free reach to a local audience. If either of you is comfortable on camera, this is worth exploring alongside Meta — just don't pay for TikTok ads until Meta is dialed in first.
          </div>
        </section>

        <!-- ── 7. Priority Order ───────────────────────────────────────── -->
        <section>
          <div id="priority" class="mb-6 pt-2">
            <p class="text-gold-400 uppercase tracking-[0.3em] text-[10px] mb-2">Strategy</p>
            <h2 class="text-2xl md:text-3xl font-heading font-bold text-white">What to Do First</h2>
          </div>
          <div class="space-y-4 text-gray-400 leading-relaxed mb-6">
            <p>
              The site currently has low traffic. Running paid ads before building an organic foundation is putting the cart before the horse. Here's the recommended order:
            </p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-dark-600/50">
                  <th class="text-left text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-3 pr-6 font-normal">Priority</th>
                  <th class="text-left text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-3 pr-6 font-normal">Action</th>
                  <th class="text-left text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-3 pr-6 font-normal">Cost</th>
                  <th class="text-left text-[10px] uppercase tracking-[0.2em] text-gray-500 pb-3 pr-6 font-normal">Why</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-dark-600/20">
                  <td class="py-3 pr-6 text-gold-400 font-bold align-top">1</td>
                  <td class="py-3 pr-6 text-white font-medium align-top">Google Business Profile</td>
                  <td class="py-3 pr-6 text-gray-400 align-top">Free</td>
                  <td class="py-3 pr-6 text-gray-400 align-top">Highest-impact local SEO action. Gets Ackiss Homes into Google Maps results for 'Virginia Beach real estate agent' searches. People searching Google are further along in their buying decision than anyone scrolling Instagram.</td>
                </tr>
                {#each [
                  ["2", "Install Meta Pixel", "Free", "Starts collecting visitor data silently in the background. Every visitor GBP sends to the site gets added to your future ad audience automatically."],
                  ["3", "Post organically on Instagram", "Free", "Listing photos, neighborhood content, market updates. Builds brand and sends followers to the site — pixel collects them too."],
                  ["4", "TikTok organic content", "Free", "If comfortable on camera — property tours, neighborhood guides, market updates. TikTok's algorithm gives exceptional organic reach to non-followers. No ad spend needed."],
                  ["5", "Run first Meta paid campaign", "$5–10/day", "Once the pixel has a meaningful audience pool (1,000+ visitors), retargeting and lookalike audiences are ready. First campaign can start very small."],
                  ["6", "TikTok paid ads", "$", "Not a priority until Meta is dialed in. Consider only after Meta campaigns are running and performing well."],
                ] as row}
                  <tr class="border-b border-dark-600/20 last:border-0">
                    <td class="py-3 pr-6 text-gray-400 align-top">{row[0]}</td>
                    <td class="py-3 pr-6 text-gray-400 align-top">{row[1]}</td>
                    <td class="py-3 pr-6 text-gray-400 align-top">{row[2]}</td>
                    <td class="py-3 pr-6 text-gray-400 align-top">{row[3]}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <div class="mt-6 border border-gold-500/20 bg-gold-500/5 text-gold-300 rounded-sm px-5 py-4 text-sm leading-relaxed">
            Steps 1–3 build on each other. GBP drives traffic → Pixel collects that traffic → organic posts drive more traffic → Pixel collects those too. By the time you run paid ads (step 5), the audience data is already there and campaigns are more effective from day one.
          </div>
        </section>

        <!-- ── 8. Action Items ─────────────────────────────────────────── -->
        <section>
          <div id="setup" class="mb-6 pt-2">
            <p class="text-gold-400 uppercase tracking-[0.3em] text-[10px] mb-2">Next Steps</p>
            <h2 class="text-2xl md:text-3xl font-heading font-bold text-white">Your Action Items</h2>
          </div>
          <p class="text-gray-400 mb-8 leading-relaxed">
            Here's exactly what needs to happen and who does what.
          </p>

          <div class="space-y-4">
            <!-- Step 1 -->
            <div class="flex gap-5 p-5 rounded-sm border border-gold-500/30 bg-gold-500/5">
              <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gold-500 text-dark-900">1</div>
              <div>
                <p class="font-semibold mb-1 text-gold-400">Jeremy: Set up Meta Business Manager</p>
                <div class="text-gray-400 text-sm leading-relaxed">
                  <p>Go to <strong class="text-white">business.facebook.com</strong> and create a Business Manager account (or log in if you already have one from running previous ads). This is the professional dashboard for running ads — separate from your personal Facebook profile.</p>
                  <p class="mt-2">If you ran Facebook ads before, you may already have one. Check first.</p>
                </div>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="flex gap-5 p-5 rounded-sm border border-gold-500/30 bg-gold-500/5">
              <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gold-500 text-dark-900">2</div>
              <div>
                <p class="font-semibold mb-1 text-gold-400">Jeremy: Create a Meta Pixel</p>
                <div class="text-gray-400 text-sm leading-relaxed">
                  <p>Inside Business Manager, go to <strong class="text-white">Events Manager → Connect Data Sources → Web → Meta Pixel</strong>. Create a new Pixel named "Ackiss Homes."</p>
                  <p class="mt-2">Meta will give you a <strong class="text-white">Pixel ID</strong> — a number like <code class="text-gold-400 text-xs bg-dark-800 px-1.5 py-0.5 rounded">1234567890123456</code>. Share that number with Nate.</p>
                </div>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="flex gap-5 p-5 rounded-sm border border-dark-600/40 bg-dark-700/50">
              <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-dark-600 text-gray-400">3</div>
              <div>
                <p class="font-semibold mb-1 text-white">Nate: Install Pixel on the site</p>
                <div class="text-gray-400 text-sm leading-relaxed">
                  <p>Once the Pixel ID is shared, it gets added to the site's root layout — covers every page automatically. Takes about 5 minutes. The Privacy Policy page will also be updated with a one-paragraph disclosure.</p>
                </div>
              </div>
            </div>

            <!-- Step 4 -->
            <div class="flex gap-5 p-5 rounded-sm border border-dark-600/40 bg-dark-700/50">
              <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-dark-600 text-gray-400">4</div>
              <div>
                <p class="font-semibold mb-1 text-white">Wait and let it collect data</p>
                <div class="text-gray-400 text-sm leading-relaxed">
                  <p>No action needed. The Pixel runs silently in the background and builds your audience pool over time. Check back in Meta Ads Manager after 30–60 days to see the audience size growing.</p>
                </div>
              </div>
            </div>

            <!-- Step 5 -->
            <div class="flex gap-5 p-5 rounded-sm border border-dark-600/40 bg-dark-700/50">
              <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-dark-600 text-gray-400">5</div>
              <div>
                <p class="font-semibold mb-1 text-white">Jeremy: Run first campaign when ready</p>
                <div class="text-gray-400 text-sm leading-relaxed">
                  <p>When the audience pool has grown (and ideally after GBP is set up driving organic traffic), start a small retargeting campaign. $5–10/day is enough to test. Target site visitors from the last 60 days with a simple awareness or lead-generation ad.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 p-6 border border-dark-600/40 rounded-sm">
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">Privacy &amp; Legal</p>
            <p class="text-sm text-gray-400 leading-relaxed">
              No cookie consent popup is required for a US-based local business not targeting EU visitors. The Privacy Policy on the site will be updated with a paragraph disclosing Meta Pixel usage once it's installed. That's sufficient for legal compliance at your scale and audience.
            </p>
          </div>
        </section>

      </main>
    </div>

    <!-- Footer -->
    <footer class="border-t border-dark-600/40 px-6 py-6 text-center mt-8">
      <p class="text-xs text-gray-600 uppercase tracking-widest">
        Ackiss Homes &mdash; Internal Use Only
      </p>
    </footer>

  </div>
{/if}

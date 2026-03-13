<script lang="ts">
  import { onMount } from "svelte";
  import TodoEntryCard from "./TodoEntryCard.svelte";

  const AUTH_KEY = "ackiss_auth";
  const PASSWORD = "Squad123";

  type Reaction = "up" | "down" | "sideways";
  type ItemStatus =
    | "pending-nate" | "pending-amanda" | "pending-jeremy"
    | "in-review" | "blocked" | "on-hold" | "completed" | "not-doing";
  type Status = "in-progress" | "todo";

  interface FeedbackData {
    itemStatus: ItemStatus;
    reactions: { amanda: Reaction | null; jeremy: Reaction | null };
    reactionNotes: { amanda: string; jeremy: string };
    notes: { nate: string; amanda: string; jeremy: string };
  }

  interface Entry {
    id: string;
    title: string;
    description: string;
    date: string;
    status: Status;
    priority?: "high";
    link?: string;
    previewImage?: string;
  }

  const DEFAULT_FEEDBACK: FeedbackData = {
    itemStatus: "pending-nate",
    reactions: { amanda: null, jeremy: null },
    reactionNotes: { amanda: "", jeremy: "" },
    notes: { nate: "", amanda: "", jeremy: "" },
  };

  const STATUS_CONFIG: Record<Status, { dot: string }> = {
    "in-progress": { dot: "bg-amber-400" },
    "todo":        { dot: "bg-gray-400" },
  };

  const SECTIONS: { status: Status; heading: string }[] = [
    { status: "todo",        heading: "To Do" },
    { status: "in-progress", heading: "In Progress" },
  ];

  const BASE_ENTRIES: Entry[] = [
    { id: "hero-redesign",        title: "Hero Section Redesign",                   description: "Complete dark luxury redesign of the homepage hero. Desktop uses a typewriter animation. Mobile shows the A logo at full brightness first, then fades it back as the text slides in.", date: "Feb 2026", status: "todo" },
    { id: "mortgage-calculator",  title: "Mortgage Calculator",                     description: "Full-featured calculator with amortization schedule, extra payment modeling, homeowner expenses, a donut chart breakdown of lifetime costs, and a live mortgage rate chart.", date: "Feb 2026", status: "todo" },
    { id: "social-feed",          title: "Instagram Social Feed",                   description: "Social feed section with two embedded Instagram reels. Add new reel URLs directly in the code as content is posted.", date: "Feb 2026", status: "todo" },
    { id: "fub-lead-type",        title: "FUB Lead Type Custom Field",              description: "Created a 'Lead Type' dropdown custom field in FUB (Buyer / Seller / Both) to track lead intent going forward. Should be filled in on every new lead.", date: "Feb 2026", status: "todo" },
    { id: "deal-progress",        title: "Deal Progress Page (/deal/[token])",      description: "A private, unguessable-URL page Amanda or Jeremy texts to clients after going under contract. Shows a live timeline of all closing milestones — inspection, PICRA, mortgage paperwork, appraisal, title, clear to close, and more. Currently a hardcoded demo — data would eventually feed from Airtable. Try the demo link to see the concept.", date: "Feb 2026", status: "todo", link: "/deal/demo-ah7k2m9p4x" },
    { id: "review-funnel",        title: "Post-Closing Review Funnel (/leave-a-review)", description: "A private page to send clients after closing — single tap to leave a Google review. Noindex, currently password-gated. To go live: (1) set up GBP and get the Place ID from the GBP dashboard or the Places API Place ID Finder, (2) update GOOGLE_REVIEW_URL in LeaveAReview.svelte with the real URL (format: https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID), (3) remove the PasswordGate check, (4) test on mobile. Keep noindex.", date: "Feb 2026", status: "todo", link: "/leave-a-review" },
    { id: "referral-page",        title: "Referral Page (/referrals)",              description: "A private page to send past clients. They enter their name and their friend's contact info — we get a warm referral lead pushed straight into FUB, tagged 'website-referral'. Noindex — not listed on the main site.", date: "Feb 2026", status: "todo", link: "/referrals" },
    { id: "email-campaign-1",     title: "Email Campaign #1 — Market Shift",        description: "First reactivation email to ~900 cold leads in FUB. Neutral market update framing that works for both buyers and sellers. Draft ready — needs your approval before sending via FUB bulk email.", date: "Feb 2026", status: "todo" },
    { id: "email-campaigns-234",  title: "Email Campaigns #2, #3, #4 (Drip Sequence)", description: "Follow-up drip emails for non-responders: #2 'Are you starting to browse online?' (buyer angle), #3 'What's your home worth?' (seller angle), #4 simple personal check-in. Drafts pending.", date: "Feb 2026", status: "todo" },
    { id: "services-perks-copy",  title: "Finalize Services Card Value Items — Amanda & Jeremy", description: "The Buying and Selling service cards now show a list of included value items (e.g. professional photography, staging consultation, open houses for Selling; neighborhood expertise, negotiation, off-market listings for Buying). Review and confirm the exact items to list — add, remove, or reword anything. Once finalized, Nate will update the site.", date: "Mar 2026", status: "todo", previewImage: "/previews/services-perks.png" },
    { id: "stpatricks-postcards", title: "St. Patrick's Day Postcards",             description: "Design and send St. Patrick's Day postcards to the mailing list. Drafts are ready — needs final approval and mailing.", date: "Feb 2026", status: "todo", priority: "high" },
    { id: "google-business-profile", title: "Google Business Profile — Jeremy to Set Up", description: "Highest-impact local SEO action remaining. A verified GBP listing makes Ackiss Homes eligible for the Google Maps pack (the 3 results shown above organic search), dramatically increases visibility for 'Virginia Beach real estate agent' searches, and is required before we can add a real Google review link to the post-closing review page. Go to business.google.com, create the listing, and verify via postcard or phone. Add both Amanda and Jeremy as managers once set up.", date: "Feb 2026", status: "todo", priority: "high" },
    { id: "seo-crawling",         title: "SEO: Enable Search Engine Crawling",      description: "The site currently blocks search engine indexing. Need to update robots.txt to allow crawling, generate a sitemap.xml, and add JSON-LD structured data for local business. Without this, the site won't appear in Google search results.", date: "Feb 2026", status: "todo" },
    { id: "search-console-ga4",   title: "Link Google Search Console to GA4",       description: "Once GBP is set up and organic traffic starts flowing, connect Google Search Console to GA4. This unlocks keyword-level data in Analytics — you'll see exactly which search terms people used to find the site. Do this after GBP is verified and the site is getting some organic traffic. Setup is in GA4 under Admin → Property Settings → Search Console Links.", date: "Mar 2026", status: "todo" },
    { id: "og-image",             title: "Improve Social Share (OG) Image",         description: "When the site is shared on social media or iMessage, the preview image is a low-res screenshot (251×69px). Needs to be rebuilt as a proper high-res image for a professional appearance.", date: "Feb 2026", status: "todo" },
    { id: "custom-domain",        title: "Custom Domain (ackisshomes.com)",          description: "ackisshomes.com is connected and live via Vercel.", date: "Feb 2026", status: "todo" },
    { id: "calendly",             title: "Calendly Booking Integration",             description: "Add a 'Schedule a Free Consultation' button using Calendly. Could live in the hero, contact section, or as a sticky floating button. Free plan available at calendly.com — just needs availability configured.", date: "Feb 2026", status: "todo" },
    { id: "fub-listings",         title: "FUB API for Featured Listings",            description: "Wire up the featured listings section to automatically pull active listings from FUB custom fields. Currently the listings section is hidden when empty.", date: "Feb 2026", status: "todo" },
    { id: "instagram-behold",     title: "Connect Live Instagram Feed via Behold",  description: "Replace the current static Instagram embeds with a Behold widget that automatically updates when new posts are made to the Instagram account.", date: "Feb 2026", status: "todo" },
    { id: "triumph-permission",   title: "Confirm Triumph Realty MLS iframe Permission", description: "The MLS search iframe from Triumph Realty works technically but needs their formal sign-off before going live permanently. Need to follow up with Triumph.", date: "Feb 2026", status: "todo" },
    { id: "ackiss-email",         title: "@ackisshomes.com Email Addresses",         description: "Set up professional email addresses (e.g. amanda@ackisshomes.com, jeremy@ackisshomes.com) through your domain registrar (GoDaddy). Most registrars include basic email hosting or forwarding with domain registration — check your GoDaddy account first. Alternatively, Google Workspace starts at ~$6/month per user and includes Gmail with your custom domain.", date: "Feb 2026", status: "todo" },
    { id: "social-scheduling-tools", title: "Social Scheduling Tools — Amanda",    description: "Check out Meta Business Suite (business.facebook.com — free) and Later (later.com — free tier available) for simultaneously posting videos to your personal Instagram and the Ackiss Homes Instagram. Note: Jeremy may already have a Meta Business Suite login from running Facebook ads — check with him before creating a new account, as you can be added as a user to the existing one.", date: "Mar 2026", status: "todo" },
    { id: "meta-business-manager", title: "Meta Business Manager + Pixel ID — Jeremy", description: "Go to business.facebook.com, log in or create a Business Manager account, then go to Events Manager → Connect Data Sources → Web → Meta Pixel. Create a Pixel named 'Ackiss Homes' and share the Pixel ID with Nate so it can be installed on the site. See the Ads Guide for full context.", date: "Mar 2026", status: "todo", priority: "high", link: "/ads" },
    { id: "meta-pixel-install",   title: "Install Meta Pixel on Site — Waiting on Jeremy", description: "Once Jeremy shares the Pixel ID from Meta Business Manager, add the Pixel snippet to layout.tsx (covers all pages) and update the Privacy Policy with a disclosure paragraph. Takes about 5 minutes once the ID is in hand.", date: "Mar 2026", status: "todo", link: "/ads" },
    { id: "cloudflare",           title: "Cloudflare Bot Protection",               description: "Add Cloudflare as a proxy in front of the site for DDoS protection, bot filtering, and firewall rules — all free on Cloudflare's free tier. Setup involves pointing the domain's nameservers from GoDaddy/Vercel to Cloudflare, which takes 24–48hrs to propagate. No urgency — current honeypot spam protection is adequate for now. Do this on a calm afternoon when you can monitor the site for a few hours afterward. Vercel + Cloudflare are fully compatible.", date: "Mar 2026", status: "todo" },
    { id: "google-voice",         title: "Google Voice Business Number",            description: "Set up one shared Google Voice number as the official Ackiss Homes business number — list it on the website, GBP, and business cards. Free plan forwards calls to both Amanda and Jeremy's phones simultaneously so whoever is available picks up. Texts are shared between both phones, so you'd need a quick system to avoid both replying to the same client. Recommendation: one shared number for brand consistency rather than individual numbers per agent.", date: "Feb 2026", status: "todo" },
    { id: "market-report",        title: "Hampton Roads Market Report Page",        description: "A quarterly-updated page showing local market stats — median price, days on market, active inventory, year-over-year change — sourced from Virginia REALTORS or HRRA data. Positions Jeremy & Amanda as the local market authority.", date: "Feb 2026", status: "todo" },
    { id: "neighborhoods",        title: "Featured Neighborhoods Section",          description: "Re-add the Neighborhoods component to the homepage (already built, just needs to be enabled). Showcases key Virginia Beach and Hampton Roads neighborhoods with descriptions and photos.", date: "Feb 2026", status: "todo" },
    { id: "zillow-landing-pages", title: "SEO Landing Pages — 'Alternatives to Zillow'", description: "Create targeted landing pages for low-competition, high-intent searches like 'alternatives to Zillow Virginia Beach' and 'is Zillow accurate Virginia Beach'. Strong SEO opportunity with minimal competition.", date: "Feb 2026", status: "todo" },
  ];

  // ── State ───────────────────────────────────────────────────────────
  let authed = $state(false);
  let authError = $state(false);
  let authShake = $state(false);
  let authValue = $state("");
  let filter = $state<"todo" | "completed" | "scrapped">("todo");
  let allFeedback = $state<Record<string, FeedbackData>>({});
  let customOrder = $state<string[]>([]);
  let customEntries = $state<Entry[]>([]);
  let showAddForm = $state(false);
  let entryOverrides = $state<Record<string, { title: string; description: string }>>({});
  let completedOpen = $state(false);
  let scrapedOpen = $state(false);
  let dragId = $state<string | null>(null);
  let dragOverId = $state<string | null>(null);
  let dataLoaded = $state(false);
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    if (localStorage.getItem(AUTH_KEY) === "1") authed = true;
    fetch("/api/todo-feedback")
      .then(r => r.json())
      .then(data => {
        if (data.feedback) allFeedback = data.feedback;
        if (data.order?.length) customOrder = data.order;
        if (data.customEntries?.length) customEntries = data.customEntries;
        if (data.entryOverrides) entryOverrides = data.entryOverrides;
      })
      .catch(() => {})
      .finally(() => { dataLoaded = true; });
  });

  function handleAuthSubmit(e: Event) {
    e.preventDefault();
    if (authValue === PASSWORD) {
      localStorage.setItem(AUTH_KEY, "1");
      authed = true;
    } else {
      authError = true;
      authShake = true;
      authValue = "";
      setTimeout(() => { authShake = false; }, 500);
    }
  }

  function debounceSave(
    feedback: Record<string, FeedbackData>,
    order: string[],
    custom: Entry[],
    overrides: Record<string, { title: string; description: string }>,
  ) {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      fetch("/api/todo-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, order, customEntries: custom, entryOverrides: overrides }),
      }).catch(() => {});
    }, 600);
  }

  function handleFeedbackSave(entryId: string, data: FeedbackData) {
    const updated = { ...allFeedback, [entryId]: data };
    allFeedback = updated;
    debounceSave(updated, customOrder, customEntries, entryOverrides);
  }

  function handleReorder(fromId: string, toId: string) {
    if (!fromId || fromId === toId) return;
    const allIds = [...BASE_ENTRIES, ...customEntries].map(e => e.id);
    const base = [
      ...customOrder.filter(id => allIds.includes(id)),
      ...allIds.filter(id => !customOrder.includes(id)),
    ];
    const fi = base.indexOf(fromId), ti = base.indexOf(toId);
    if (fi === -1 || ti === -1) return;
    const next = [...base];
    next.splice(fi, 1);
    next.splice(ti, 0, fromId);
    customOrder = next;
    debounceSave(allFeedback, next, customEntries, entryOverrides);
  }

  function handleAddItem(e: Event) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const title = (fd.get("title") as string ?? "").trim();
    const description = (fd.get("description") as string ?? "").trim();
    const highPriority = fd.get("highPriority") === "on";
    if (!title) return;
    const newEntry: Entry = {
      id: `custom-${Date.now()}`,
      title, description,
      date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      status: "todo",
      ...(highPriority ? { priority: "high" as const } : {}),
    };
    const updated = [...customEntries, newEntry];
    customEntries = updated;
    showAddForm = false;
    debounceSave(allFeedback, customOrder, updated, entryOverrides);
  }

  function handleEntryEdit(entryId: string, updates: { title: string; description: string }) {
    const isCustom = customEntries.some(e => e.id === entryId);
    if (isCustom) {
      const updated = customEntries.map(e => e.id === entryId ? { ...e, ...updates } : e);
      customEntries = updated;
      debounceSave(allFeedback, customOrder, updated, entryOverrides);
    } else {
      const updated = { ...entryOverrides, [entryId]: updates };
      entryOverrides = updated;
      debounceSave(allFeedback, customOrder, customEntries, updated);
    }
  }

  function sortedByOrder(items: Entry[]): Entry[] {
    if (customOrder.length === 0) return items;
    return [...items].sort((a, b) => {
      const ai = customOrder.indexOf(a.id), bi = customOrder.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }

  function resolvedEntry(entry: Entry): Entry {
    const override = entryOverrides[entry.id];
    return override ? { ...entry, ...override } : entry;
  }

  // Derived lists
  let allEntries = $derived([...BASE_ENTRIES, ...customEntries]);
  let completedIds = $derived(new Set(allEntries.filter(e => allFeedback[e.id]?.itemStatus === "completed").map(e => e.id)));
  let scrapedIds = $derived(new Set(allEntries.filter(e => allFeedback[e.id]?.itemStatus === "not-doing").map(e => e.id)));
  let completedEntries = $derived(sortedByOrder(allEntries.filter(e => completedIds.has(e.id))));
  let scrapedEntries = $derived(sortedByOrder(allEntries.filter(e => scrapedIds.has(e.id))));
  function isActive(id: string) { return !completedIds.has(id) && !scrapedIds.has(id); }
  let activeCount = $derived(allEntries.filter(e => isActive(e.id)).length);

  type FilterKey = "todo" | "completed" | "scrapped";
  let filterPills = $derived<{ key: FilterKey; label: string; count: number }[]>([
    { key: "todo",      label: "To Do",     count: activeCount },
    { key: "completed", label: "Completed", count: completedEntries.length },
    { key: "scrapped",  label: "Scrapped",  count: scrapedEntries.length },
  ]);
</script>

{#if !authed}
  <!-- Password Gate -->
  <div class="min-h-screen bg-black flex items-center justify-center px-6">
    <div class="relative w-full max-w-sm text-center">
      <a href="/" class="inline-flex flex-col items-center gap-2 mb-10 focus-visible:outline-none focus-visible:opacity-70">
        <img src="/logo-a-v2-optimized.svg" alt="Ackiss Homes" width="40" height="37" class="opacity-80 h-10 w-auto" />
        <span class="text-[9px] uppercase tracking-[0.35em] text-gold-500/70">Internal Access</span>
      </a>
      <h1 class="font-heading font-bold text-3xl text-white mb-2">Team Portal</h1>
      <p class="text-gray-600 text-sm mb-8">Enter the password to continue.</p>
      <form onsubmit={handleAuthSubmit} class={authShake ? "shake" : ""}>
        <input
          type="password"
          bind:value={authValue}
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
  <!-- Main page -->
  <div class="min-h-screen bg-black flex flex-col">
    <main class="flex-1 px-6 pt-20 pb-14">
      <div class="max-w-5xl mx-auto">

        <!-- Intro -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-4">
            <p class="text-gold-400 uppercase tracking-[0.3em] text-xs">Internal</p>
            <div class="h-px w-8 bg-gold-500/40"></div>
          </div>
          <h1 class="text-4xl md:text-5xl font-heading font-bold mb-4">
            What We&rsquo;re <span class="text-gold-400">Working On</span>
          </h1>
          <p class="text-gray-400 max-w-xl leading-relaxed">
            A running log of everything in progress and on the roadmap. Add items, leave notes, and track what we&rsquo;re working on together.
          </p>
        </div>

        <!-- Filter pills + Add Item -->
        <div class="flex items-center justify-between gap-4 mb-10">
          <div class="flex flex-wrap gap-2">
            {#each filterPills as pill}
              {#if pill.key === "todo" || pill.count > 0}
                <button
                  onclick={() => filter = pill.key}
                  class="px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95
                    {filter === pill.key ? 'bg-white/10 text-white border-white/20' : 'text-gray-500 border-dark-600 hover:border-gray-500 hover:text-gray-300'}"
                >
                  {pill.label}{pill.count > 0 ? ` (${pill.count})` : ""}
                </button>
              {/if}
            {/each}
          </div>
          <button
            onclick={() => { showAddForm = !showAddForm; filter = "todo"; }}
            class="shrink-0 text-xs uppercase tracking-widest text-gold-400 hover:text-gold-300 border border-gold-500/30 hover:border-gold-500/60 px-4 py-1.5 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95"
          >
            + Add To Do
          </button>
        </div>

        <!-- Add Item form -->
        {#if showAddForm && filter === "todo"}
          <div class="mb-8 bg-dark-700 border border-gold-500/25 rounded-sm p-6">
            <form onsubmit={handleAddItem} class="space-y-4">
              <div>
                <label class="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">Title</label>
                <input name="title" type="text" required autofocus placeholder="What needs to be done?"
                  class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold-500 transition-[border-color] duration-200" />
              </div>
              <div>
                <label class="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
                  Description <span class="text-gray-700">(optional)</span>
                </label>
                <textarea name="description" rows={3} placeholder="More details…"
                  class="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gold-500 transition-[border-color] duration-200 resize-none"></textarea>
              </div>
              <label class="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                <input type="checkbox" name="highPriority" class="w-3.5 h-3.5 rounded-sm accent-red-500 cursor-pointer" />
                <span class="text-xs text-gray-400 uppercase tracking-wider">High Priority</span>
              </label>
              <div class="flex gap-3">
                <button type="submit" class="btn-shimmer btn-shimmer-filled px-5 py-2 text-dark-900 font-semibold text-xs uppercase tracking-widest rounded-sm hover:scale-[1.015] active:scale-95 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500">
                  <span class="relative z-[2]">Add To Do</span>
                </button>
                <button type="button" onclick={() => showAddForm = false} class="px-4 py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors focus-visible:outline-none">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        {/if}

        {#if !dataLoaded}
          <div class="flex items-center justify-center py-20">
            <div class="w-5 h-5 border-2 border-gold-500/30 border-t-gold-400 rounded-full animate-spin"></div>
          </div>
        {:else if filter === "todo"}
          {#each SECTIONS as { status, heading }}
            {@const items = sortedByOrder(allEntries.filter(e => e.status === status && isActive(e.id)))}
            {#if items.length > 0}
              <div class="mb-12">
                <h2 class="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4 flex items-center gap-3">
                  <span class="w-2 h-2 rounded-full {STATUS_CONFIG[status].dot}"></span>
                  {heading}
                </h2>
                <div class="grid md:grid-cols-2 gap-4">
                  {#each items as entry (entry.id)}
                    <TodoEntryCard
                      entry={resolvedEntry(entry)}
                      feedbackData={allFeedback[entry.id] ?? DEFAULT_FEEDBACK}
                      onFeedbackSave={(d) => handleFeedbackSave(entry.id, d)}
                      onEdit={(updates) => handleEntryEdit(entry.id, updates)}
                      isDragOver={dragOverId === entry.id}
                      isDragging={dragId === entry.id}
                      onDragStart={() => dragId = entry.id}
                      onDragOver={() => dragOverId = entry.id}
                      onDrop={() => handleReorder(dragId!, entry.id)}
                      onDragEnd={() => { dragId = null; dragOverId = null; }}
                    />
                  {/each}
                </div>
              </div>
            {/if}
          {/each}

          <!-- Completed — collapsed -->
          {#if completedEntries.length > 0}
            <div class="mb-12">
              <button onclick={() => completedOpen = !completedOpen} class="flex items-center gap-3 mb-4 group focus-visible:outline-none">
                <span class="w-2 h-2 rounded-full bg-emerald-500/40 shrink-0"></span>
                <span class="text-xs uppercase tracking-[0.3em] text-gray-600 group-hover:text-gray-400 transition-colors">
                  Completed ({completedEntries.length})
                </span>
                <svg class="w-3 h-3 text-gray-700 transition-transform duration-200 {completedOpen ? 'rotate-0' : '-rotate-90'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {#if completedOpen}
                <div class="grid md:grid-cols-2 gap-4 opacity-50">
                  {#each completedEntries as entry (entry.id)}
                    <TodoEntryCard
                      entry={resolvedEntry(entry)}
                      feedbackData={allFeedback[entry.id] ?? DEFAULT_FEEDBACK}
                      onFeedbackSave={(d) => handleFeedbackSave(entry.id, d)}
                      onEdit={(updates) => handleEntryEdit(entry.id, updates)}
                      isDragOver={dragOverId === entry.id}
                      isDragging={dragId === entry.id}
                      onDragStart={() => dragId = entry.id}
                      onDragOver={() => dragOverId = entry.id}
                      onDrop={() => handleReorder(dragId!, entry.id)}
                      onDragEnd={() => { dragId = null; dragOverId = null; }}
                    />
                  {/each}
                </div>
              {/if}
            </div>
          {/if}

          <!-- Scrapped — collapsed -->
          {#if scrapedEntries.length > 0}
            <div class="mb-12">
              <button onclick={() => scrapedOpen = !scrapedOpen} class="flex items-center gap-3 mb-4 group focus-visible:outline-none">
                <span class="w-2 h-2 rounded-full bg-gray-600/50 shrink-0"></span>
                <span class="text-xs uppercase tracking-[0.3em] text-gray-600 group-hover:text-gray-400 transition-colors">
                  Scrapped ({scrapedEntries.length})
                </span>
                <svg class="w-3 h-3 text-gray-700 transition-transform duration-200 {scrapedOpen ? 'rotate-0' : '-rotate-90'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {#if scrapedOpen}
                <div class="grid md:grid-cols-2 gap-4 opacity-35">
                  {#each scrapedEntries as entry (entry.id)}
                    <TodoEntryCard
                      entry={resolvedEntry(entry)}
                      feedbackData={allFeedback[entry.id] ?? DEFAULT_FEEDBACK}
                      onFeedbackSave={(d) => handleFeedbackSave(entry.id, d)}
                      onEdit={(updates) => handleEntryEdit(entry.id, updates)}
                      isDragOver={dragOverId === entry.id}
                      isDragging={dragId === entry.id}
                      onDragStart={() => dragId = entry.id}
                      onDragOver={() => dragOverId = entry.id}
                      onDrop={() => handleReorder(dragId!, entry.id)}
                      onDragEnd={() => { dragId = null; dragOverId = null; }}
                    />
                  {/each}
                </div>
              {/if}
            </div>
          {/if}

        {:else if filter === "completed"}
          {#if completedEntries.length > 0}
            <div class="grid md:grid-cols-2 gap-4 opacity-60">
              {#each completedEntries as entry (entry.id)}
                <TodoEntryCard
                  entry={resolvedEntry(entry)}
                  feedbackData={allFeedback[entry.id] ?? DEFAULT_FEEDBACK}
                  onFeedbackSave={(d) => handleFeedbackSave(entry.id, d)}
                  onEdit={(updates) => handleEntryEdit(entry.id, updates)}
                  isDragOver={false} isDragging={false}
                  onDragStart={() => {}} onDragOver={() => {}} onDrop={() => {}} onDragEnd={() => {}}
                />
              {/each}
            </div>
          {:else}
            <p class="text-gray-600 text-sm">No completed items yet.</p>
          {/if}

        {:else if filter === "scrapped"}
          {#if scrapedEntries.length > 0}
            <div class="grid md:grid-cols-2 gap-4 opacity-40">
              {#each scrapedEntries as entry (entry.id)}
                <TodoEntryCard
                  entry={resolvedEntry(entry)}
                  feedbackData={allFeedback[entry.id] ?? DEFAULT_FEEDBACK}
                  onFeedbackSave={(d) => handleFeedbackSave(entry.id, d)}
                  onEdit={(updates) => handleEntryEdit(entry.id, updates)}
                  isDragOver={false} isDragging={false}
                  onDragStart={() => {}} onDragOver={() => {}} onDrop={() => {}} onDragEnd={() => {}}
                />
              {/each}
            </div>
          {:else}
            <p class="text-gray-600 text-sm">No scrapped items yet.</p>
          {/if}
        {/if}

      </div>
    </main>

    <footer class="border-t border-dark-600/40 px-6 py-6 text-center">
      <p class="text-xs text-gray-600 uppercase tracking-widest">Ackiss Homes &mdash; Internal Use Only</p>
    </footer>
  </div>
{/if}

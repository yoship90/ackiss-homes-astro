<script lang="ts">
  import { onMount } from "svelte";

  let mobileOpen = $state(false);
  let communitiesOpen = $state(false);
  let mobileCommunitiesOpen = $state(false);
  let closeTimer: ReturnType<typeof setTimeout> | null = null;
  let activeSection = $state<string>("");
  let isHome = $state(true);

  // Prefix hash links with "/" when not on the home page
  function navHref(hash: string) {
    return isHome ? hash : `/${hash}`;
  }

  const leftNav = [{ label: "Services", href: "#services" }];
  const rightNav = [
    { label: "Calculator", href: "#calculator" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Social", href: "#social" },
    { label: "Contact", href: "#contact" },
  ];
  const allNavLinks = [...leftNav, ...rightNav];
  const communities = [
    "Virginia Beach", "Chesapeake", "Suffolk", "Portsmouth",
    "Newport News", "Hampton", "Yorktown", "Williamsburg",
  ];

  function openCommunities() {
    if (closeTimer) clearTimeout(closeTimer);
    communitiesOpen = true;
  }
  function closeCommunities() {
    closeTimer = setTimeout(() => { communitiesOpen = false; }, 150);
  }

  onMount(() => {
    const sectionIds = allNavLinks.map((l) => l.href.slice(1));
    const THRESHOLD = 120; // px from top of viewport (below header)

    function updateActive() {
      let current = "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= THRESHOLD) {
          current = id;
        }
      }
      activeSection = current;
    }

    function handleClickOutside(e: MouseEvent) {
      if (mobileOpen && !(e.target as Element).closest("header")) {
        mobileOpen = false;
      }
    }

    isHome = window.location.pathname === "/";

    window.addEventListener("scroll", updateActive, { passive: true });
    document.addEventListener("click", handleClickOutside);
    updateActive();

    return () => {
      window.removeEventListener("scroll", updateActive);
      document.removeEventListener("click", handleClickOutside);
    };
  });

  const navLinkBase = "text-[0.82rem] uppercase tracking-widest text-gray-300 hover:text-gold-400 focus-visible:text-gold-400 focus-visible:outline-none active:opacity-70 transition-[color,transform] duration-300";
</script>

<header class="fixed top-0 left-0 w-full z-50 bg-dark-900/90 backdrop-blur-md border-b border-dark-600/50">
  <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
    <a href="/" class="flex items-center gap-3 shrink-0"
      onclick={(e) => { e.preventDefault(); if (isHome) { window.scrollTo({ top: 0, behavior: "smooth" }); history.pushState(null, "", "/"); } else { window.location.href = "/"; } }}>
      <img src="/logo-a-v2.svg" alt="Ackiss Homes" width="788" height="716" class="h-14 w-auto" />
      <div class="h-7 w-px bg-gold-500/40 shrink-0" aria-hidden="true"></div>
      <div class="flex flex-col leading-none gap-1 whitespace-nowrap">
        <div class="flex items-baseline gap-2">
          <span class="font-brand text-[1.35rem] font-semibold tracking-[0.06em] bg-clip-text text-transparent"
            style="background-image: linear-gradient(135deg,#a06719 0%,#e1a144 20%,#f0be68 40%,#9b681a 55%,#e0a853 78%,#a06719 100%)">
            Ackiss
          </span>
          <span class="font-body text-[0.65rem] uppercase tracking-[0.3em] text-gold-400">Homes</span>
        </div>
        <p class="text-[0.55rem] text-gray-400 uppercase tracking-[0.2em] flex flex-col md:flex-row md:items-center gap-y-0.5 md:gap-x-1.5">
          <span>Real Estate Services</span>
          <span class="hidden md:inline-block w-px h-2.5 bg-gold-500/50"></span>
          <span>Brokered by Triumph Realty</span>
        </p>
      </div>
    </a>

    <!-- Desktop nav -->
    <nav aria-label="Main navigation" class="hidden md:flex items-center gap-6 ml-8 overflow-visible">
      {#each leftNav as link}
        <a href={navHref(link.href)} class="relative {navLinkBase}"
          class:text-gold-400={activeSection === link.href.slice(1)}>
          {link.label}
          <span class="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-gold-400"
            style="opacity:{activeSection === link.href.slice(1) ? 1 : 0}; transition:opacity 300ms ease"></span>
        </a>
      {/each}

      <!-- Communities dropdown -->
      <div class="relative"
        onmouseenter={openCommunities}
        onmouseleave={closeCommunities}
        role="none"
      >
        <button class="{navLinkBase} text-gray-300 hover:text-gold-400 flex items-center gap-1 cursor-pointer">
          Communities
          <svg class="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {#if communitiesOpen}
          <div class="absolute top-full left-0 mt-2 bg-dark-800 border border-dark-600/50 rounded-sm py-2 min-w-[180px] z-50 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
            {#each communities as city}
              <span class="block px-4 py-2 text-sm text-gray-400 hover:text-gold-400 hover:bg-dark-700 uppercase tracking-wider transition-colors duration-150 cursor-pointer">
                {city}
              </span>
            {/each}
          </div>
        {/if}
      </div>

      {#each rightNav as link}
        <a href={navHref(link.href)} class="relative {navLinkBase}"
          class:text-gold-400={activeSection === link.href.slice(1)}>
          {link.label}
          <span class="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-gold-400"
            style="opacity:{activeSection === link.href.slice(1) ? 1 : 0}; transition:opacity 300ms ease"></span>
        </a>
      {/each}

      <a
        href={navHref("#property-inquiry")}
        class="btn-shimmer ml-2 px-4 py-1.5 text-[0.75rem] uppercase tracking-widest whitespace-nowrap text-gold-400 hover:text-dark-900 border border-gold-500/70 hover:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-1 focus-visible:ring-offset-dark-900 active:scale-95 transition-[color,border-color,transform] duration-[220ms]"
      >
        <span class="relative z-[2]">Find My Home</span>
      </a>
    </nav>

    <!-- Mobile toggle -->
    <button
      class="md:hidden text-gray-300 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-1 focus-visible:ring-offset-dark-900 active:scale-90 transition-[transform,color] duration-150 rounded-sm"
      onclick={() => mobileOpen = !mobileOpen}
      aria-label="Toggle navigation"
      aria-expanded={mobileOpen}
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {#if mobileOpen}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        {/if}
      </svg>
    </button>
  </div>

  <!-- Mobile CTA bar -->
  <div class="md:hidden border-t border-dark-600/30 py-2 flex justify-center">
    <a
      href={navHref("#property-inquiry")}
      class="btn-shimmer px-6 py-1.5 text-[0.72rem] uppercase tracking-widest text-gold-400 hover:text-dark-900 border border-gold-500/70 hover:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 transition-[color,border-color,transform] duration-[220ms]"
    >
      <span class="relative z-[2]">Find My Home</span>
    </a>
  </div>

  <!-- Mobile menu -->
  {#if mobileOpen}
    <nav aria-label="Mobile navigation" class="md:hidden bg-dark-800 border-t border-dark-600/50 px-6 pb-4">
      {#each leftNav as link}
        <a href={navHref(link.href)} onclick={() => mobileOpen = false}
          class="block py-3 text-sm uppercase tracking-widest text-gray-300 hover:text-gold-400 focus-visible:outline-none active:opacity-70 transition-colors"
          class:text-gold-400={activeSection === link.href.slice(1)}
        >{link.label}</a>
      {/each}

      <!-- Communities accordion -->
      <button
        onclick={() => mobileCommunitiesOpen = !mobileCommunitiesOpen}
        class="flex items-center justify-between w-full py-3 text-sm uppercase tracking-widest text-gray-300 hover:text-gold-400 focus-visible:outline-none focus-visible:text-gold-400 active:opacity-70 transition-colors"
      >
        Communities
        <svg class="w-3 h-3 opacity-60 transition-transform duration-200 {mobileCommunitiesOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {#if mobileCommunitiesOpen}
        <div class="pl-4 pb-2 border-l border-dark-600/50 ml-1">
          {#each communities as city}
            <span class="block py-2 text-sm uppercase tracking-widest text-gray-500">{city}</span>
          {/each}
        </div>
      {/if}

      {#each rightNav as link}
        <a href={navHref(link.href)} onclick={() => mobileOpen = false}
          class="block py-3 text-sm uppercase tracking-widest text-gray-300 hover:text-gold-400 focus-visible:outline-none active:opacity-70 transition-colors"
          class:text-gold-400={activeSection === link.href.slice(1)}
        >{link.label}</a>
      {/each}
    </nav>
  {/if}
</header>

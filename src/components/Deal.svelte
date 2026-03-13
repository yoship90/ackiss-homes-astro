<script lang="ts">
  import { onMount } from "svelte";

  /* ------------------------------------------------------------------ */
  /*  Auth                                                                */
  /* ------------------------------------------------------------------ */

  const AUTH_KEY = "ackiss_auth";
  const PASSWORD = "Squad123";

  let authed = $state(false);
  let passwordValue = $state("");
  let error = $state(false);
  let shake = $state(false);

  onMount(() => {
    if (localStorage.getItem(AUTH_KEY) === "1") authed = true;
  });

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (passwordValue === PASSWORD) {
      localStorage.setItem(AUTH_KEY, "1");
      authed = true;
    } else {
      error = true;
      shake = true;
      passwordValue = "";
      setTimeout(() => (shake = false), 500);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Types                                                               */
  /* ------------------------------------------------------------------ */

  type MilestoneStatus = "complete" | "active" | "pending";

  interface Milestone {
    id: string;
    label: string;
    status: MilestoneStatus;
    date?: string;
    note?: string;
  }

  interface Phase {
    id: string;
    label: string;
    milestones: Milestone[];
  }

  /* ------------------------------------------------------------------ */
  /*  Demo deal data                                                      */
  /* ------------------------------------------------------------------ */

  const DEMO_DEAL = {
    address: "2847 Sandpiper Lane",
    cityStateZip: "Virginia Beach, VA 23456",
    buyers: "Michael & Sarah Johnson",
    agent: "Amanda Ackiss",
    agentPhone: "tel:+17570000000",
    offerPrice: "$485,000",
    closingDate: "2026-03-28",
    phases: [
      {
        id: "contract",
        label: "Contract & Earnest Money",
        milestones: [
          { id: "offer-submitted",  label: "Offer submitted",                      status: "complete", date: "Feb 10" },
          { id: "offer-accepted",   label: "Offer accepted — under contract",       status: "complete", date: "Feb 11" },
          { id: "earnest-money",    label: "Earnest money deposited",               status: "complete", date: "Feb 13", note: "$4,850 deposited with Monarch Title Group" },
        ],
      },
      {
        id: "inspection",
        label: "Inspection & PICRA",
        milestones: [
          { id: "inspection-scheduled", label: "Inspection scheduled",              status: "complete", date: "Feb 12" },
          { id: "inspection-complete",  label: "Home inspection complete",          status: "complete", date: "Feb 16" },
          { id: "picra-submitted",      label: "PICRA submitted to seller",         status: "complete", date: "Feb 19", note: "Requested $4,200 credit for HVAC service and roof flashing repair" },
          { id: "picra-resolution",     label: "PICRA negotiated & resolved",       status: "active",   note: "Seller countered with $3,000 credit — Amanda is reviewing with you, response due Feb 27" },
          { id: "repairs-scheduled",    label: "Repair work scheduled",             status: "pending" },
          { id: "repairs-complete",     label: "Repairs complete & verified",       status: "pending" },
        ],
      },
      {
        id: "mortgage",
        label: "Mortgage & Appraisal",
        milestones: [
          { id: "loan-application",   label: "Loan application submitted",          status: "complete", date: "Feb 10" },
          { id: "disclosures-signed", label: "Initial disclosures signed",          status: "complete", date: "Feb 12" },
          { id: "appraisal-ordered",  label: "Appraisal ordered",                  status: "complete", date: "Feb 14" },
          { id: "appraisal-date",     label: "Appraisal scheduled — Feb 28",       status: "active" },
          { id: "appraisal-complete", label: "Appraisal complete",                 status: "pending" },
          { id: "loan-conditional",   label: "Loan conditionally approved",         status: "pending" },
          { id: "mortgage-docs",      label: "Mortgage paperwork finalized",       status: "pending" },
          { id: "loan-final",         label: "Final loan approval",                status: "pending" },
        ],
      },
      {
        id: "title-closing",
        label: "Title & Closing",
        milestones: [
          { id: "title-ordered",      label: "Title search ordered",               status: "complete", date: "Feb 14" },
          { id: "title-clear",        label: "Title cleared",                      status: "pending" },
          { id: "closing-disclosure", label: "Closing disclosure received",        status: "pending", note: "Required at least 3 business days before closing" },
          { id: "clear-to-close",     label: "Clear to close",                     status: "pending" },
          { id: "final-walkthrough",  label: "Final walk-through",                 status: "pending" },
          { id: "closing-day",        label: "Closing day — March 28",             status: "pending" },
        ],
      },
    ] as Phase[],
  };

  /* ------------------------------------------------------------------ */
  /*  Derived                                                             */
  /* ------------------------------------------------------------------ */

  function getPhaseStatus(phase: Phase): "complete" | "active" | "partial" | "pending" {
    const statuses = phase.milestones.map((m) => m.status);
    if (statuses.every((s) => s === "complete")) return "complete";
    if (statuses.some((s) => s === "active")) return "active";
    if (statuses.some((s) => s === "complete")) return "partial";
    return "pending";
  }

  const now = new Date();
  const closing = new Date(DEMO_DEAL.closingDate);
  const daysToClose = Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const allMilestones = DEMO_DEAL.phases.flatMap((p) => p.milestones);
  const completedCount = allMilestones.filter((m) => m.status === "complete").length;
  const progress = Math.round((completedCount / allMilestones.length) * 100);
</script>

{#if !authed}
  <!-- Password gate -->
  <div class="min-h-screen bg-black flex items-center justify-center px-6">
    <div
      class="fixed inset-0 pointer-events-none"
      style="background: radial-gradient(ellipse 70% 50% at 50% 40%, rgba(201,149,46,0.07) 0%, transparent 70%)"
      aria-hidden="true"
    ></div>
    <div class="fixed inset-0 hero-grain opacity-[0.04] pointer-events-none" aria-hidden="true"></div>

    <div class="relative w-full max-w-sm text-center">
      <a href="/" class="inline-flex flex-col items-center gap-2 mb-10 focus-visible:outline-none focus-visible:opacity-70">
        <img src="/logo-a-v2.svg" alt="Ackiss Homes" width="40" height="40" class="opacity-80" />
        <span class="text-[9px] uppercase tracking-[0.35em] text-gold-500/70">Internal Access</span>
      </a>

      <h1 class="font-heading font-bold text-3xl text-white mb-2">Team Portal</h1>
      <p class="text-gray-600 text-sm mb-8">Enter the password to continue.</p>

      <form onsubmit={handleSubmit} class={shake ? "shake" : ""}>
        <input
          type="password"
          bind:value={passwordValue}
          oninput={() => (error = false)}
          placeholder="Password"
          autofocus
          class="w-full bg-dark-800 border rounded-sm px-4 py-3 text-white placeholder-gray-600 text-sm text-center tracking-widest focus:outline-none transition-[border-color] duration-200 mb-3 {error ? 'border-red-500/60' : 'border-dark-600 focus:border-gold-500'}"
        />
        {#if error}
          <p class="text-red-400 text-xs mb-3">Incorrect password — try again.</p>
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
  <!-- Deal tracker -->
  <div class="min-h-screen bg-black flex flex-col">

    <!-- Ambient glow -->
    <div
      class="fixed inset-0 pointer-events-none"
      style="background: radial-gradient(ellipse 90% 40% at 50% 0%, rgba(201,149,46,0.06) 0%, transparent 60%)"
      aria-hidden="true"
    ></div>
    <div class="fixed inset-0 hero-grain opacity-[0.04] pointer-events-none" aria-hidden="true"></div>

    <!-- Header -->
    <header class="relative z-10 border-b border-white/5 px-6 py-4">
      <div class="max-w-2xl mx-auto flex items-center justify-between">
        <a href="/" class="flex items-center gap-3 focus-visible:outline-none focus-visible:opacity-70">
          <img src="/logo-a-v2.svg" alt="Ackiss Homes" width="32" height="32" class="opacity-90" />
          <div>
            <div class="text-white font-heading font-bold text-sm leading-none tracking-wide">Ackiss Homes</div>
            <div class="text-gold-500 text-[8px] uppercase tracking-[0.25em] mt-0.5">Virginia Beach</div>
          </div>
        </a>
        <p class="text-[10px] text-gray-600 uppercase tracking-[0.25em]">Closing Progress</p>
      </div>
    </header>

    <!-- Main -->
    <main class="relative z-10 flex-1 px-6 py-10">
      <div class="max-w-2xl mx-auto">

        <!-- Property hero card -->
        <div class="bg-dark-800 border border-dark-600/50 rounded-sm p-6 mb-6">
          <div class="flex items-start justify-between gap-6 flex-wrap mb-6">
            <div>
              <p class="text-[9px] uppercase tracking-[0.35em] text-gold-500/70 mb-2">Under Contract</p>
              <h1 class="font-heading font-bold text-2xl md:text-3xl text-white leading-snug">
                {DEMO_DEAL.address}
              </h1>
              <p class="text-gray-500 text-sm mt-0.5">{DEMO_DEAL.cityStateZip}</p>
              <p class="text-gray-400 text-sm mt-3">
                {DEMO_DEAL.buyers}
                <span class="text-dark-500 mx-2">·</span>
                <span class="text-gray-600">with {DEMO_DEAL.agent}</span>
              </p>
            </div>

            <div class="flex gap-6 shrink-0">
              <div class="text-right">
                <p class="text-[9px] uppercase tracking-[0.2em] text-gray-600 mb-1">Offer Price</p>
                <p class="text-white font-heading font-bold text-xl">{DEMO_DEAL.offerPrice}</p>
              </div>
              <div class="text-right">
                <p class="text-[9px] uppercase tracking-[0.2em] text-gray-600 mb-1">Days to Close</p>
                <p class="font-heading font-bold text-xl {daysToClose <= 14 ? 'text-amber-400' : 'text-gold-400'}">
                  {daysToClose}
                </p>
              </div>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="border-t border-dark-600/50 pt-5">
            <div class="flex items-center justify-between mb-2">
              <p class="text-[9px] uppercase tracking-[0.3em] text-gray-600">Progress</p>
              <p class="text-[10px] text-gold-500/80">
                {completedCount} of {allMilestones.length} steps complete &mdash; {progress}%
              </p>
            </div>
            <div class="h-px bg-dark-600 relative overflow-visible">
              <div
                class="absolute top-0 left-0 h-px bg-gradient-to-r from-gold-600 to-gold-400 transition-[width] duration-700"
                style="width: {progress}%"
              ></div>
              <div
                class="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gold-400 shadow-[0_0_8px_rgba(201,149,46,0.8)] transition-[left] duration-700"
                style="left: calc({progress}% - 4px)"
              ></div>
            </div>
          </div>
        </div>

        <!-- Phase sections -->
        <div class="space-y-4">
          {#each DEMO_DEAL.phases as phase}
            {@const ps = getPhaseStatus(phase)}
            <div class="rounded-sm border p-6 transition-[border-color,background-color] duration-300 {
              ps === 'complete' ? 'border-dark-600/25 bg-dark-800/30' :
              ps === 'active'   ? 'border-gold-500/20 bg-dark-800' :
              ps === 'partial'  ? 'border-dark-600/35 bg-dark-800/60' :
                                  'border-dark-600/15 bg-dark-800/15'
            }">
              <!-- Phase header -->
              <div class="flex items-center gap-3 mb-5">
                <div class="w-1.5 h-1.5 rounded-full shrink-0 {
                  ps === 'complete' ? 'bg-gold-500/40' :
                  ps === 'active' || ps === 'partial' ? 'bg-gold-500' :
                  'bg-dark-500'
                }"></div>
                <h2 class="text-[10px] uppercase tracking-[0.3em] font-medium {
                  ps === 'complete' ? 'text-gray-600' :
                  ps === 'active' || ps === 'partial' ? 'text-gold-400' :
                  'text-gray-700'
                }">
                  {phase.label}
                </h2>
                {#if ps === "complete"}
                  <span class="ml-auto text-[9px] text-gray-700 uppercase tracking-widest">Complete</span>
                {/if}
              </div>

              <!-- Milestones -->
              <div>
                {#each phase.milestones as milestone, i}
                  <div class="relative flex items-start gap-3 {i < phase.milestones.length - 1 ? 'pb-5' : 'pb-0'}">
                    <!-- Vertical connector -->
                    {#if i < phase.milestones.length - 1}
                      <div class="absolute left-[9px] top-5 bottom-0 w-px bg-dark-500/50"></div>
                    {/if}

                    <!-- Status indicator -->
                    <div class="relative shrink-0 z-10 mt-0.5">
                      {#if milestone.status === "complete"}
                        <div class="w-[18px] h-[18px] rounded-full bg-gold-500/15 border border-gold-500/35 flex items-center justify-center">
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5l2 2L8 1" stroke="#c9952e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                        </div>
                      {:else if milestone.status === "active"}
                        <div class="w-[18px] h-[18px] rounded-full border border-gold-500/50 flex items-center justify-center">
                          <div class="w-[7px] h-[7px] rounded-full bg-gold-500 animate-pulse"></div>
                        </div>
                      {:else}
                        <div class="w-[18px] h-[18px] rounded-full border border-dark-500"></div>
                      {/if}
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-baseline justify-between gap-3 flex-wrap">
                        <p class="text-sm leading-snug {
                          milestone.status === 'complete' ? 'text-gray-500' :
                          milestone.status === 'active'   ? 'text-white font-medium' :
                                                            'text-gray-700'
                        }">
                          {milestone.label}
                        </p>
                        {#if milestone.date}
                          <span class="text-[11px] text-gray-600 shrink-0">{milestone.date}</span>
                        {/if}
                      </div>
                      {#if milestone.note}
                        <p class="text-xs mt-1 leading-relaxed {milestone.status === 'active' ? 'text-gold-400/70' : 'text-gray-600'}">
                          {milestone.note}
                        </p>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <!-- Contact strip -->
        <div class="mt-6 border border-dark-600/30 rounded-sm p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p class="text-[9px] uppercase tracking-[0.3em] text-gray-600 mb-1">Questions about your deal?</p>
            <p class="text-white text-sm font-medium">{DEMO_DEAL.agent}</p>
          </div>
          <a
            href={DEMO_DEAL.agentPhone}
            class="text-[11px] uppercase tracking-widest text-gold-400 hover:text-gold-300 border border-gold-500/25 hover:border-gold-500/50 px-4 py-2 rounded-sm transition-[color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95"
          >
            Call or Text →
          </a>
        </div>

        <!-- Privacy note -->
        <p class="text-center text-[10px] text-gray-700 uppercase tracking-widest mt-10 leading-relaxed">
          This page is private and intended only for {DEMO_DEAL.buyers}.
        </p>

      </div>
    </main>
  </div>
{/if}

<style>
  .shake {
    animation: shake 0.4s ease;
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60%  { transform: translateX(-6px); }
    40%, 80%  { transform: translateX(6px); }
  }
</style>

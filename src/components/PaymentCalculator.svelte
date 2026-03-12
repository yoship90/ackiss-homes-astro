<script lang="ts">
  import { onMount } from "svelte";

  /* ------------------------------------------------------------------ */
  /*  Types                                                               */
  /* ------------------------------------------------------------------ */

  interface ScheduleRow {
    month: number;
    date: string;
    payment: number;
    principal: number;
    interest: number;
    extra: number;
    balance: number;
  }

  interface RatePoint {
    label: string;
    rate: number;
    weekly?: boolean;
  }

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                             */
  /* ------------------------------------------------------------------ */

  function fmt(n: number): string {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function fmtInt(n: number): string {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  function parseNum(v: string): number {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  }

  /* ------------------------------------------------------------------ */
  /*  Rate chart fallback data                                            */
  /* ------------------------------------------------------------------ */

  const FALLBACK_DATA: RatePoint[] = [
    { label: "Q1 '19", rate: 4.37 },
    { label: "Q2 '19", rate: 4.14 },
    { label: "Q3 '19", rate: 3.73 },
    { label: "Q4 '19", rate: 3.70 },
    { label: "Q1 '20", rate: 3.60 },
    { label: "Q2 '20", rate: 3.23 },
    { label: "Q3 '20", rate: 2.96 },
    { label: "Q4 '20", rate: 2.77 },
    { label: "Q1 '21", rate: 2.97 },
    { label: "Q2 '21", rate: 2.98 },
    { label: "Q3 '21", rate: 2.87 },
    { label: "Q4 '21", rate: 3.07 },
    { label: "Q1 '22", rate: 3.87 },
    { label: "Q2 '22", rate: 5.23 },
    { label: "Q3 '22", rate: 5.77 },
    { label: "Q4 '22", rate: 6.79 },
    { label: "Q1 '23", rate: 6.54 },
    { label: "Q2 '23", rate: 6.71 },
    { label: "Q3 '23", rate: 7.09 },
    { label: "Q4 '23", rate: 7.44 },
    { label: "Q1 '24", rate: 6.93 },
    { label: "Q2 '24", rate: 6.99 },
    { label: "Q3 '24", rate: 6.44 },
    { label: "Q4 '24", rate: 6.72 },
    { label: "Q1 '25", rate: 6.83 },
    { label: "Q2 '25", rate: 6.81 },
    { label: "Q3 '25", rate: 6.72 },
    { label: "Q4 '25", rate: 6.85 },
    { label: "Now",    rate: 6.96 },
  ];

  /* ------------------------------------------------------------------ */
  /*  State — Core fields                                                 */
  /* ------------------------------------------------------------------ */

  let purchasePrice = $state("350000");
  let downPayment = $state("");
  let downPaymentIsPercent = $state(true);
  let interestRate = $state("");
  const loanTerm = 30;

  /* ---- Extra payments ---- */
  let extraMonthly = $state("");
  let extraYearly = $state("");
  let extraOneTime = $state("");
  let extraOneTimeMonth = $state("12");

  /* ---- Homeowner expenses ---- */
  let propertyTax = $state("0.99");
  let propertyTaxIsPercent = $state(true);
  let insurance = $state("1800");
  let pmi = $state("1");
  let hoa = $state("");

  /* ---- UI toggles ---- */
  let showExtras = $state(false);
  let showExpenses = $state(false);
  let showSchedule = $state(false);
  let scheduleView = $state<"monthly" | "yearly">("monthly");

  /* ---- Rate chart state ---- */
  let rateData = $state<RatePoint[]>(FALLBACK_DATA);
  let ratesAsOf = $state<string | null>(null);
  let chartCanvas = $state<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let chartInstance: any = null;

  /* ------------------------------------------------------------------ */
  /*  Derived — core loan math                                            */
  /* ------------------------------------------------------------------ */

  const price = $derived(parseNum(purchasePrice));

  const dp = $derived(
    downPaymentIsPercent
      ? (parseNum(downPayment) / 100) * price
      : parseNum(downPayment)
  );

  const loanAmount = $derived(Math.max(price - dp, 0));
  const monthlyRate = $derived(parseNum(interestRate) / 100 / 12);
  const totalMonths = $derived(loanTerm * 12);

  const basePnI = $derived.by((): number => {
    if (loanAmount <= 0 || monthlyRate <= 0 || totalMonths <= 0) return 0;
    const r = monthlyRate;
    const n = totalMonths;
    const factor = Math.pow(1 + r, n);
    return (loanAmount * (r * factor)) / (factor - 1);
  });

  /* ---- Homeowner monthly costs ---- */
  const monthlyTax = $derived(
    propertyTaxIsPercent
      ? (parseNum(propertyTax) / 100) * price / 12
      : parseNum(propertyTax) / 12
  );
  const monthlyInsurance = $derived(parseNum(insurance) / 12);
  const monthlyPmi = $derived((parseNum(pmi) / 100) * loanAmount / 12);
  const monthlyHoa = $derived(parseNum(hoa));

  const hasExpenses = $derived(
    monthlyTax > 0 || monthlyInsurance > 0 || monthlyPmi > 0 || monthlyHoa > 0
  );

  const totalMonthlyPayment = $derived(
    basePnI + monthlyTax + monthlyInsurance + monthlyPmi + monthlyHoa
  );

  const ltv = $derived(price > 0 ? (loanAmount / price) * 100 : 0);

  /* ------------------------------------------------------------------ */
  /*  Derived — amortization schedule                                     */
  /* ------------------------------------------------------------------ */

  const amortResult = $derived((): { schedule: ScheduleRow[]; scheduleNoExtras: ScheduleRow[] | null } => {
    const em = parseNum(extraMonthly);
    const ey = parseNum(extraYearly);
    const eo = parseNum(extraOneTime);
    const eoMonth = parseInt(extraOneTimeMonth) || 12;
    const hasExtras = em > 0 || ey > 0 || eo > 0;

    function generate(withExtras: boolean): ScheduleRow[] {
      const rows: ScheduleRow[] = [];
      let balance = loanAmount;
      if (balance <= 0 || monthlyRate <= 0) return rows;

      const startDate = new Date();
      startDate.setDate(1);
      startDate.setMonth(startDate.getMonth() + 1);

      for (let m = 1; m <= totalMonths && balance > 0.005; m++) {
        const interestPayment = balance * monthlyRate;
        let principalPayment = basePnI - interestPayment;
        let extra = 0;

        if (withExtras) {
          extra += em;
          if (m % 12 === 0) extra += ey;
          if (m === eoMonth) extra += eo;
        }

        const totalPossible = principalPayment + extra;
        if (totalPossible > balance) {
          const ratio = totalPossible > 0 ? balance / totalPossible : 1;
          principalPayment = principalPayment * ratio;
          extra = extra * ratio;
        }

        balance -= principalPayment + extra;
        if (balance < 0.005) balance = 0;

        const paymentDate = new Date(startDate);
        paymentDate.setMonth(paymentDate.getMonth() + (m - 1));

        rows.push({
          month: m,
          date: paymentDate.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          payment: interestPayment + principalPayment,
          principal: principalPayment,
          interest: interestPayment,
          extra,
          balance,
        });
      }
      return rows;
    }

    return {
      schedule: generate(hasExtras),
      scheduleNoExtras: hasExtras ? generate(false) : null,
    };
  });

  const schedule = $derived(amortResult().schedule);
  const scheduleNoExtras = $derived(amortResult().scheduleNoExtras);

  /* ---- Savings from extra payments ---- */
  const extraSavings = $derived((): { interestSaved: number; yearsSaved: number; remainingMonths: number } | null => {
    if (!scheduleNoExtras) return null;
    const totalInterestBase = scheduleNoExtras.reduce((s, r) => s + r.interest, 0);
    const totalInterestExtras = schedule.reduce((s, r) => s + r.interest, 0);
    const interestSaved = totalInterestBase - totalInterestExtras;
    const monthsSaved = scheduleNoExtras.length - schedule.length;
    const yearsSaved = Math.floor(monthsSaved / 12);
    const remainingMonths = monthsSaved % 12;
    return { interestSaved, yearsSaved, remainingMonths };
  });

  /* ---- Pie chart segments ---- */
  const pieSegments = $derived((): { label: string; value: number; color: string }[] => {
    if (schedule.length === 0) return [];
    const payoffMonths = schedule.length;
    const totalPrincipal = schedule.reduce((s, r) => s + r.principal, 0);
    const totalInterest = schedule.reduce((s, r) => s + r.interest, 0);
    const totalExtra = schedule.reduce((s, r) => s + r.extra, 0);
    const totalTax = monthlyTax * payoffMonths;
    const totalPmiTotal = monthlyPmi * payoffMonths;
    const totalInsuranceFees = (monthlyInsurance + monthlyHoa) * payoffMonths;

    const segments: { label: string; value: number; color: string }[] = [];
    if (totalPrincipal > 0) segments.push({ label: "Principal", value: totalPrincipal, color: "#c9952e" });
    if (totalInterest > 0) segments.push({ label: "Interest", value: totalInterest, color: "#4a90d9" });
    if (totalExtra > 0) segments.push({ label: "Extra Payments", value: totalExtra, color: "#e67e22" });
    if (totalTax > 0) segments.push({ label: "Taxes", value: totalTax, color: "#d95a4a" });
    if (totalPmiTotal > 0) segments.push({ label: "PMI", value: totalPmiTotal, color: "#9b59b6" });
    if (totalInsuranceFees > 0) segments.push({ label: "Insurance & Fees", value: totalInsuranceFees, color: "#2ecc71" });
    if (dp > 0) segments.push({ label: "Down Payment", value: dp, color: "#5dade2" });
    return segments;
  });

  const pieTotal = $derived(pieSegments().reduce((s, seg) => s + seg.value, 0));

  /* ---- Yearly summary ---- */
  const yearlySchedule = $derived((): { year: number; label: string; payment: number; principal: number; interest: number; extra: number; balance: number }[] => {
    const years: { year: number; label: string; payment: number; principal: number; interest: number; extra: number; balance: number }[] = [];
    let currentYear = 0;
    let accPayment = 0;
    let accPrincipal = 0;
    let accInterest = 0;
    let accExtra = 0;
    let lastBalance = 0;
    let label = "";

    for (const row of schedule) {
      const yr = Math.ceil(row.month / 12);
      if (yr !== currentYear) {
        if (currentYear > 0) {
          years.push({ year: currentYear, label, payment: accPayment, principal: accPrincipal, interest: accInterest, extra: accExtra, balance: lastBalance });
        }
        currentYear = yr;
        accPayment = 0;
        accPrincipal = 0;
        accInterest = 0;
        accExtra = 0;
      }
      accPayment += row.payment;
      accPrincipal += row.principal;
      accInterest += row.interest;
      accExtra += row.extra;
      lastBalance = row.balance;
      label = row.date;
    }
    if (currentYear > 0) {
      years.push({ year: currentYear, label, payment: accPayment, principal: accPrincipal, interest: accInterest, extra: accExtra, balance: lastBalance });
    }
    return years;
  });

  /* ------------------------------------------------------------------ */
  /*  Derived — Rate chart SVG geometry                                  */
  /* ------------------------------------------------------------------ */

  const currentRate = $derived(rateData[rateData.length - 1].rate);

  /* ------------------------------------------------------------------ */
  /*  Effects                                                             */
  /* ------------------------------------------------------------------ */

  // Auto-zero PMI when LTV <= 80%
  $effect(() => {
    if (price > 0) {
      if (ltv <= 80) {
        pmi = "0";
      } else if (pmi === "0") {
        pmi = "1";
      }
    }
  });

  // Rebuild chart whenever rateData or canvas changes
  $effect(() => {
    if (!chartCanvas || rateData.length === 0) return;
    buildChart();
  });

  /* ------------------------------------------------------------------ */
  /*  uPlot                                                               */
  /* ------------------------------------------------------------------ */

  function makeGradient(u: any) {
    const ctx = u.ctx;
    const grad = ctx.createLinearGradient(0, u.bbox.top, 0, u.bbox.top + u.bbox.height);
    grad.addColorStop(0,   "rgba(201,149,46,0.12)");
    grad.addColorStop(1,   "rgba(201,149,46,0)");
    return grad;
  }

  async function buildChart() {
    if (!chartCanvas) return;
    const uPlot = (await import("uplot")).default;

    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

    const xs    = rateData.map((_, i) => i);
    const rates = rateData.map((d) => d.rate);

    // Index where weekly section begins (-1 if no weekly data)
    const weeklyStartIdx = rateData.findIndex((d) => d.weekly);
    const hasWeekly = weeklyStartIdx >= 0;

    // ── Pre-compute custom axis label data ──────────────────────────
    // Year labels: every Q1 in the quarterly section
    const yearLabels: { idx: number; text: string }[] = [];
    rateData.forEach((d, i) => {
      if (hasWeekly && i >= weeklyStartIdx) return;
      if (d.label.startsWith("Q1")) {
        const m = d.label.match(/'(\d{2})$/);
        if (m) yearLabels.push({ idx: i, text: `'${m[1]}` });
      }
    });

    // Quarter labels: detect new-quarter month boundaries in the weekly section
    const quarterLabels: { idx: number; text: string }[] = [];
    if (hasWeekly) {
      const lastQLabel = rateData[weeklyStartIdx - 1]?.label ?? "Q4 '25";
      const baseYear = 2000 + parseInt(lastQLabel.match(/'(\d{2})$/)?.[1] ?? "25");
      const lastQNum  = parseInt(lastQLabel.match(/^Q(\d)/)?.[1] ?? "4");
      const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const Q_START: Record<string, number> = { Jan: 1, Apr: 2, Jul: 3, Oct: 4 };
      let prevMonthIdx = lastQNum * 3 - 1; // Q4 → 11, Q3 → 8, etc.
      let year = baseYear;
      for (let i = weeklyStartIdx; i < rateData.length; i++) {
        const mon = rateData[i].label.split(" ")[0];
        const mi  = MONTHS.indexOf(mon);
        if (mi < 0) continue;
        if (mi < prevMonthIdx) year++; // year rolled over
        prevMonthIdx = mi;
        const q = Q_START[mon];
        if (q !== undefined) {
          quarterLabels.push({ idx: i, text: `Q${q} '${String(year).slice(-2)}` });
        }
      }
    }

    const opts: any = {
      width:  chartCanvas.clientWidth || chartCanvas.parentElement!.clientWidth,
      height: 240,
      padding: [8, 16, 0, 0],
      cursor: {
        points: { size: 8, fill: "#c9952e", stroke: "#0a0a0a", width: 2 },
        drag:   { x: false, y: false },
      },
      legend: { show: false },
      scales: {
        x: { time: false },
        y: {
          range: (_u: any, min: number, max: number) => {
            const pad = Math.max(0.3, (max - min) * 0.1);
            const lo = Math.floor((min - pad) * 2) / 2;
            const hi = Math.ceil((max + pad) * 2) / 2;
            return [Math.max(0, lo), hi];
          },
        },
      },
      axes: [
        {
          // X axis: allocate 20px for canvas-drawn labels
          ticks:  { show: false },
          grid:   { show: false },
          border: { show: false },
          size:   20,
          splits: () => [],
          values: () => [],
        },
        {
          // Y axis — font matches Inter used elsewhere on page
          stroke: "#9ca3af",
          font:   `${Math.round(11 * devicePixelRatio)}px "Inter", system-ui, sans-serif`,
          ticks:  { show: false },
          grid:   { stroke: "rgba(255,255,255,0.04)", width: 1 },
          border: { show: false },
          size:   36,
          values: (_u: any, vals: number[]) => vals.map((v) => `${v}%`),
        },
      ],
      series: [
        {},
        {
          stroke: "#c9952e",
          width:  2,
          fill:   makeGradient,
          points: { show: false },
        },
      ],
      hooks: {
        drawAxes: [(u: any) => {
          const { ctx, bbox } = u;
          const dpr   = devicePixelRatio;
          const left  = bbox.left;
          const right = bbox.left + bbox.width;
          ctx.save();

          // Reference line at 7% if in view
          const yMin = u.scales.y.min ?? 0;
          const yMax = u.scales.y.max ?? 10;
          if (7 >= yMin && 7 <= yMax) {
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = "rgba(201,149,46,0.18)";
            ctx.lineWidth = 1;
            const y = Math.round(u.valToPos(7, "y", true));
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.stroke();
          }

          // Vertical separator at start of weekly section
          if (hasWeekly && weeklyStartIdx > 0) {
            ctx.setLineDash([2, 4]);
            ctx.strokeStyle = "rgba(201,149,46,0.22)";
            ctx.lineWidth = 1;
            const x = Math.round(u.valToPos(weeklyStartIdx, "x", true));
            ctx.beginPath();
            ctx.moveTo(x, bbox.top);
            ctx.lineTo(x, bbox.top + bbox.height);
            ctx.stroke();
          }

          // ── X-axis labels drawn on canvas ─────────────────────────
          // labelY is in the x-axis area (below plot bbox), in canvas px
          const labelY = bbox.top + bbox.height + Math.round(6 * dpr);
          ctx.setLineDash([]);
          ctx.textAlign    = "center";
          ctx.textBaseline = "top";
          ctx.font = `${Math.round(10 * dpr)}px "Inter", system-ui, sans-serif`;

          // Year labels (quarterly section)
          ctx.fillStyle = "rgba(156,163,175,0.70)";
          for (const { idx, text } of yearLabels) {
            const x = u.valToPos(idx, "x", true);
            ctx.fillText(text, x, labelY);
          }

          // Quarter labels (weekly section)
          ctx.fillStyle = "rgba(225,161,68,0.75)";
          for (const { idx, text } of quarterLabels) {
            const x = u.valToPos(idx, "x", true);
            ctx.fillText(text, x, labelY);
          }

          ctx.restore();
        }],
        setCursor: [(u: any) => {
          const idx = u.cursor.idx;
          if (idx == null) { tooltipEl?.style && (tooltipEl.style.display = "none"); return; }
          if (!tooltipEl) return;
          const lbl  = rateData[idx]?.label ?? "";
          const rate = rates[idx];
          tooltipEl.innerHTML =
            `<p class="text-gray-400 mb-0.5">${lbl}</p>` +
            `<p class="text-gold-400 font-semibold">${rate.toFixed(2)}%</p>`;
          const xPx = u.cursor.left ?? 0;
          const yPx = (u.valToPos(rate, "y", true) - u.bbox.top) / devicePixelRatio;
          tooltipEl.style.display = "block";
          tooltipEl.style.left    = `${xPx + 12}px`;
          tooltipEl.style.top     = `${Math.max(0, yPx - 36)}px`;
        }],
      },
    };

    // uPlot takes a container div and creates its own canvas inside it
    chartInstance = new uPlot(opts, [xs, rates], chartCanvas);

    // Labels are drawn on the canvas in the drawAxes hook above.
  }

  let tooltipEl = $state<HTMLDivElement | null>(null);

  /* ------------------------------------------------------------------ */
  /*  Lifecycle                                                           */
  /* ------------------------------------------------------------------ */

  onMount(() => {
    fetch("/api/mortgage-rates")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.data) && json.data.length > 0) rateData = json.data;
        if (json.ratesAsOf) ratesAsOf = json.ratesAsOf;
      })
      .catch(() => { /* keep fallback silently */ });

    return () => { if (chartInstance) chartInstance.destroy(); };
  });

  /* ------------------------------------------------------------------ */
  /*  Shared CSS classes                                                  */
  /* ------------------------------------------------------------------ */

  const inputCls =
    "w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors";
  const labelCls =
    "block text-sm text-gray-400 mb-1.5 uppercase tracking-wider";
</script>

<section id="calculator" class="pt-10 pb-20 px-6">
  <div class="max-w-6xl mx-auto">

    <!-- Heading -->
    <div class="grid md:grid-cols-[2fr_3fr] gap-8 mb-10">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <p class="text-gold-400 uppercase tracking-[0.3em] text-sm">Plan Your Purchase</p>
          <div class="h-px w-8 bg-gold-500/40 flex-shrink-0"></div>
        </div>
        <h2 class="text-4xl md:text-5xl font-heading font-bold text-white">
          Payment <span class="text-gold-400">Calculator</span>
        </h2>
      </div>
    </div>

    <div class="grid lg:grid-cols-[1fr_1fr] gap-8">

      <!-- ============================================================ -->
      <!-- Left column — Inputs                                         -->
      <!-- ============================================================ -->
      <div class="bg-dark-700 border border-dark-600/50 rounded-sm p-8 md:p-10">

        <!-- Core Fields -->
        <div class="space-y-5">

          <!-- Purchase Price -->
          <div>
            <label for="purchase-price" class={labelCls}>Purchase Price</label>
            <div class="relative w-44">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                id="purchase-price"
                inputmode="decimal"
                bind:value={purchasePrice}
                class="{inputCls} pl-8"
                placeholder="350,000"
              />
            </div>
          </div>

          <!-- Down Payment -->
          <div>
            <label for="down-payment" class={labelCls}>Down Payment</label>
            <div class="flex gap-2">
              <div class="relative w-44">
                {#if !downPaymentIsPercent}
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                {/if}
                <input
                  type="text"
                  id="down-payment"
                  inputmode="decimal"
                  bind:value={downPayment}
                  class="{inputCls} {downPaymentIsPercent ? 'pr-8' : 'pl-8'}"
                  placeholder=""
                />
                {#if downPaymentIsPercent}
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                {/if}
              </div>
              <button
                type="button"
                onclick={() => {
                  if (downPaymentIsPercent && price > 0) {
                    downPayment = Math.round((parseNum(downPayment) / 100) * price).toString();
                    downPaymentIsPercent = false;
                  }
                }}
                class="px-4 py-1.5 border rounded-sm text-sm transition-colors uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 {!downPaymentIsPercent ? 'btn-option-selected' : 'border-gray-600 text-gray-300 hover:border-gold-500/50 hover:text-gold-400'}"
              >
                $
              </button>
              <button
                type="button"
                onclick={() => {
                  if (!downPaymentIsPercent && price > 0) {
                    downPayment = ((parseNum(downPayment) / price) * 100).toFixed(1);
                    downPaymentIsPercent = true;
                  }
                }}
                class="px-4 py-1.5 border rounded-sm text-sm transition-colors uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 {downPaymentIsPercent ? 'btn-option-selected' : 'border-gray-600 text-gray-300 hover:border-gold-500/50 hover:text-gold-400'}"
              >
                %
              </button>
            </div>
          </div>

          <!-- Loan Amount — read-only -->
          <div>
            <label class={labelCls}>Loan Amount</label>
            <div class="w-44 bg-dark-900 border border-dark-600 rounded-sm px-4 py-1.5 text-gold-400 cursor-default">
              ${fmtInt(loanAmount)}
            </div>
          </div>

          <!-- Interest Rate -->
          <div>
            <label for="interest-rate" class={labelCls}>Interest Rate (%)</label>
            <div class="relative w-28">
              <input
                type="text"
                id="interest-rate"
                inputmode="decimal"
                bind:value={interestRate}
                class="{inputCls} pr-8"
                placeholder=""
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          <!-- Loan Term -->
          <div>
            <label class={labelCls}>Loan Term</label>
            <div class="btn-option-selected inline-block py-3 px-6 rounded-sm text-sm uppercase tracking-wider border">
              30 yr
            </div>
          </div>
        </div>

        <!-- Extra Payments (collapsible) -->
        <div class="mt-8 border-t border-dark-600/50 pt-6">
          <button
            type="button"
            onclick={() => showExtras = !showExtras}
            class="flex items-center justify-between w-full group focus-visible:outline-none focus-visible:text-gold-400 active:opacity-70"
          >
            <span class="text-sm uppercase tracking-wider text-gray-300 group-hover:text-gold-400 transition-colors">
              Extra Payments
            </span>
            <svg
              class="w-5 h-5 text-gold-400 transition-transform duration-300 {showExtras ? 'rotate-180' : ''}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {#if showExtras}
            <div class="mt-5 space-y-5 animate-fade-in">
              <div>
                <label for="extra-monthly" class={labelCls}>Additional Monthly Payment</label>
                <div class="relative w-44">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    id="extra-monthly"
                    inputmode="decimal"
                    bind:value={extraMonthly}
                    class="{inputCls} pl-8"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label for="extra-yearly" class={labelCls}>Additional Yearly Payment</label>
                <div class="relative w-44">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    id="extra-yearly"
                    inputmode="decimal"
                    bind:value={extraYearly}
                    class="{inputCls} pl-8"
                    placeholder="0"
                  />
                </div>
              </div>
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label for="extra-one-time" class={labelCls}>One-Time Payment</label>
                  <div class="relative w-40">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="text"
                      id="extra-one-time"
                      inputmode="decimal"
                      bind:value={extraOneTime}
                      class="{inputCls} pl-8"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label for="extra-one-time-month" class={labelCls}>In Month #</label>
                  <input
                    type="text"
                    id="extra-one-time-month"
                    inputmode="numeric"
                    bind:value={extraOneTimeMonth}
                    class="{inputCls} w-28"
                    placeholder="12"
                  />
                </div>
              </div>
            </div>
          {/if}
        </div>

        <!-- Homeowner Expenses (collapsible) -->
        <div class="mt-6 border-t border-dark-600/50 pt-6">
          <button
            type="button"
            onclick={() => showExpenses = !showExpenses}
            class="flex items-center justify-between w-full group focus-visible:outline-none focus-visible:text-gold-400 active:opacity-70"
          >
            <span class="text-sm uppercase tracking-wider text-gray-300 group-hover:text-gold-400 transition-colors">
              Homeowner Expenses
            </span>
            <svg
              class="w-5 h-5 text-gold-400 transition-transform duration-300 {showExpenses ? 'rotate-180' : ''}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {#if showExpenses}
            <div class="mt-5 space-y-5 animate-fade-in">

              <!-- Property Tax -->
              <div>
                <label for="property-tax" class={labelCls}>Property Tax (Annual)</label>
                <div class="flex gap-2">
                  <div class="relative w-44">
                    {#if !propertyTaxIsPercent}
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    {/if}
                    {#if propertyTaxIsPercent}
                      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    {/if}
                    <input
                      type="text"
                      id="property-tax"
                      inputmode="decimal"
                      bind:value={propertyTax}
                      class="{inputCls} {propertyTaxIsPercent ? 'pr-8' : 'pl-8'}"
                      placeholder={propertyTaxIsPercent ? "1.2" : "4,200"}
                    />
                  </div>
                  <button
                    type="button"
                    onclick={() => {
                      if (propertyTaxIsPercent && price > 0) {
                        propertyTax = Math.round((parseNum(propertyTax) / 100) * price).toString();
                        propertyTaxIsPercent = false;
                      }
                    }}
                    class="px-4 py-1.5 border rounded-sm text-sm transition-colors uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 {!propertyTaxIsPercent ? 'btn-option-selected' : 'border-gray-600 text-gray-300 hover:border-gold-500/50 hover:text-gold-400'}"
                  >
                    $
                  </button>
                  <button
                    type="button"
                    onclick={() => {
                      if (!propertyTaxIsPercent && price > 0) {
                        propertyTax = ((parseNum(propertyTax) / price) * 100).toFixed(2);
                        propertyTaxIsPercent = true;
                      }
                    }}
                    class="px-4 py-1.5 border rounded-sm text-sm transition-colors uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 {propertyTaxIsPercent ? 'btn-option-selected' : 'border-gray-600 text-gray-300 hover:border-gold-500/50 hover:text-gold-400'}"
                  >
                    %
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1.5">
                  Virginia Beach avg. rate (~0.99%) — edit to match your property.
                </p>
              </div>

              <!-- Insurance -->
              <div>
                <label for="insurance" class={labelCls}>Homeowner's Insurance (Annual)</label>
                <div class="relative w-44">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    id="insurance"
                    inputmode="decimal"
                    bind:value={insurance}
                    class="{inputCls} pl-8"
                    placeholder="1,200"
                  />
                </div>
                <p class="text-xs text-gray-500 mt-1.5">
                  Virginia Beach avg. (~$1,800/yr) — edit to match your policy.
                </p>
              </div>

              <!-- PMI -->
              <div>
                <label for="pmi" class={labelCls}>PMI (Annual %)</label>
                <div class="relative w-28">
                  <input
                    type="text"
                    id="pmi"
                    inputmode="decimal"
                    bind:value={pmi}
                    class="{inputCls} pr-8"
                    placeholder="1"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
                {#if ltv > 80}
                  <p class="text-xs text-gray-500 mt-1.5">
                    LTV is {ltv.toFixed(1)}% — PMI is typically required above 80% LTV and removed once you reach 80%. Note: PMI does not apply to VA loans.
                  </p>
                {/if}
              </div>

              <!-- HOA -->
              <div>
                <label for="hoa" class={labelCls}>HOA Fees (Monthly)</label>
                <div class="relative w-28">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    id="hoa"
                    inputmode="decimal"
                    bind:value={hoa}
                    class="{inputCls} pl-8"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          {/if}
        </div>

        <!-- ============================================================ -->
        <!-- Rate Chart — pure SVG area chart                             -->
        <!-- ============================================================ -->
        <div class="mt-6 border-t border-dark-600/50 pt-6">
          <div class="w-full">

            <!-- Header row -->
            <div class="flex items-end justify-between mb-3">
              <div>
                <p class="text-sm uppercase tracking-[0.25em] text-gray-400 font-semibold mb-0.5">
                  30-Yr Fixed Rate
                </p>
                <p class="text-[10px] text-gray-400 pl-3">2019 – Present</p>
              </div>
              <div class="flex items-baseline gap-1.5">
                <span class="text-gold-400 font-heading font-bold text-2xl leading-none">
                  {currentRate.toFixed(2)}%
                </span>
                <span class="text-[10px] text-gray-300 uppercase tracking-wider">today</span>
              </div>
            </div>

            <!-- uPlot chart — x-axis labels drawn on canvas in drawAxes hook -->
            <div class="relative">
              <div bind:this={chartCanvas} class="w-full [&_.u-wrap]:w-full [&_canvas]:!w-full"></div>
              <div
                bind:this={tooltipEl}
                class="pointer-events-none absolute hidden bg-dark-800 border border-gold-500/40 rounded-sm px-3 py-2 text-xs shadow-xl z-10"
              ></div>
            </div>

            <!-- Footer note -->
            <p class="text-[9px] text-gray-400 text-right mt-1.5">
              Freddie Mac PMMS · 30-yr fixed · quarterly / recent 12 weeks{ratesAsOf ? ` · updated ${new Date(ratesAsOf).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}
            </p>
          </div>
        </div>

      </div>

      <!-- ============================================================ -->
      <!-- Right column — Results                                       -->
      <!-- ============================================================ -->
      <div class="space-y-6">

        <!-- Empty state -->
        {#if basePnI === 0}
          <div class="flex flex-col items-center justify-center h-64 text-center text-gray-500 border border-dark-600/30 rounded-sm bg-dark-700/30">
            <svg class="w-10 h-10 mb-3 text-gold-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p class="text-sm uppercase tracking-widest">Enter at least a purchase price, down payment, and interest rate to see your estimate</p>
          </div>
        {/if}

        <!-- Monthly Payment Summary -->
        {#if basePnI > 0}
          <div class="relative overflow-hidden bg-dark-700 border border-dark-600/50 rounded-sm p-8 hover:-translate-y-1 hover:shadow-lg hover:shadow-gold-500/15 hover:border-gold-500/50 transition-[transform,box-shadow,border-color] duration-300 group">
            <h3 class="text-lg font-heading font-semibold mb-6 text-gold-400">
              Monthly Payment
            </h3>

            <div class="space-y-3">
              <div class="flex justify-between text-gray-300">
                <span>Principal &amp; Interest</span>
                <span>${fmt(basePnI)}</span>
              </div>

              {#if hasExpenses}
                {#if monthlyTax > 0}
                  <div class="flex justify-between text-gray-400 text-sm">
                    <span>Property Tax</span>
                    <span>${fmt(monthlyTax)}</span>
                  </div>
                {/if}
                {#if monthlyInsurance > 0}
                  <div class="flex justify-between text-gray-400 text-sm">
                    <span>Insurance</span>
                    <span>${fmt(monthlyInsurance)}</span>
                  </div>
                {/if}
                {#if monthlyPmi > 0}
                  <div class="flex justify-between text-gray-400 text-sm">
                    <span>PMI</span>
                    <span>${fmt(monthlyPmi)}</span>
                  </div>
                {/if}
                {#if monthlyHoa > 0}
                  <div class="flex justify-between text-gray-400 text-sm">
                    <span>HOA</span>
                    <span>${fmt(monthlyHoa)}</span>
                  </div>
                {/if}
                <div class="border-t border-dark-600/50 pt-3 mt-3"></div>
              {/if}

              <div class="flex justify-between text-lg font-semibold text-gold-400">
                <span>Total Monthly</span>
                <span>${fmt(hasExpenses ? totalMonthlyPayment : basePnI)}</span>
              </div>
            </div>

            {#if extraSavings() && (extraSavings()?.interestSaved ?? 0) > 0}
              {@const savings = extraSavings()!}
              <div class="mt-6 bg-dark-800 border border-gold-500/20 rounded-sm p-4">
                <p class="text-gold-400 text-sm font-semibold">
                  You save ${fmtInt(Math.round(savings.interestSaved))} in interest and pay off{" "}
                  {#if savings.yearsSaved > 0}{savings.yearsSaved} year{savings.yearsSaved !== 1 ? "s" : ""}{/if}{#if savings.yearsSaved > 0 && savings.remainingMonths > 0}, {/if}{#if savings.remainingMonths > 0}{savings.remainingMonths} month{savings.remainingMonths !== 1 ? "s" : ""}{/if}{" "}early
                </p>
              </div>
            {/if}
          </div>
        {/if}


      </div>
    </div>
  </div>
</section>

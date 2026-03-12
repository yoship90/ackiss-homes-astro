<script lang="ts">
  type Reaction = "up" | "down" | "sideways";
  type ItemStatus =
    | "pending-nate" | "pending-amanda" | "pending-jeremy"
    | "in-review" | "blocked" | "on-hold" | "completed" | "not-doing";

  interface FeedbackData {
    itemStatus: ItemStatus;
    reactions: { amanda: Reaction | null; jeremy: Reaction | null };
    reactionNotes: { amanda: string; jeremy: string };
    notes: { nate: string; amanda: string; jeremy: string };
  }

  let { entryId: _entryId, data, onSave }: {
    entryId: string;
    data: FeedbackData;
    onSave: (d: FeedbackData) => void;
  } = $props();

  let notesOpen = $state(false);

  const ITEM_STATUS_OPTIONS: { value: ItemStatus; label: string; hex: string }[] = [
    { value: "pending-nate",   label: "Pending · Nate",            hex: "#9ca3af" },
    { value: "pending-amanda", label: "Pending · Amanda",          hex: "#c9952e" },
    { value: "pending-jeremy", label: "Pending · Jeremy",          hex: "#c9952e" },
    { value: "in-review",      label: "Needs Review/Discussion",   hex: "#818cf8" },
    { value: "blocked",        label: "Blocked",                   hex: "#f87171" },
    { value: "on-hold",        label: "On Hold",                   hex: "#fb923c" },
    { value: "completed",      label: "Completed",                 hex: "#34d399" },
    { value: "not-doing",      label: "Scrapped",                  hex: "#4b5563" },
  ];

  function save(updated: FeedbackData) { onSave(updated); }

  function toggleReaction(person: "amanda" | "jeremy", reaction: Reaction) {
    save({ ...data, reactions: { ...data.reactions, [person]: data.reactions[person] === reaction ? null : reaction } });
  }

  let statusOption = $derived(ITEM_STATUS_OPTIONS.find(o => o.value === data.itemStatus) ?? ITEM_STATUS_OPTIONS[0]);
  let noteCount = $derived(Object.values(data.notes).filter((n: string) => n.trim()).length);

  function thumbColor(type: Reaction, active: boolean): string {
    if (!active) return "#4b5563";
    return type === "up" ? "#34d399" : type === "down" ? "#f87171" : "#fbbf24";
  }
  function thumbRotation(type: Reaction): string {
    return type === "down" ? "180deg" : type === "sideways" ? "-90deg" : "0deg";
  }
  function thumbTitle(type: Reaction): string {
    return type === "up" ? "Looks good" : type === "down" ? "Not a fan" : "Needs discussion";
  }
</script>

<div class="mt-4 pt-4 border-t border-dark-600/25">
  <!-- Status + reactions row -->
  <div class="flex items-center justify-between gap-3 flex-wrap mb-3">

    <!-- Status dropdown -->
    <div class="flex items-center gap-2">
      <span class="text-xs uppercase tracking-[0.2em] text-gray-500">Status</span>
      <div class="relative">
        <select
          value={data.itemStatus}
          onchange={(e) => save({ ...data, itemStatus: (e.target as HTMLSelectElement).value as ItemStatus })}
          class="bg-dark-700/70 border border-dark-600/40 hover:border-dark-500 rounded-sm text-[11px] pl-2.5 pr-6 py-1.5 focus:outline-none focus:border-gold-500/50 appearance-none cursor-pointer transition-[border-color] duration-200"
          style="color: {statusOption.hex}"
        >
          {#each ITEM_STATUS_OPTIONS as opt}
            <option value={opt.value} style="color: {opt.hex}; background: #1a1a1a">{opt.label}</option>
          {/each}
        </select>
        <svg class="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Thumbs — Amanda & Jeremy -->
    <div class="flex items-center gap-3">
      {#each (["amanda", "jeremy"] as const) as person}
        <div class="flex items-center gap-0.5">
          <span class="text-xs uppercase tracking-[0.1em] text-gray-400 mr-1.5 font-semibold capitalize">{person[0]}</span>
          {#each (["up", "down", "sideways"] as Reaction[]) as type}
            {@const active = data.reactions[person] === type}
            <button
              type="button"
              title={thumbTitle(type)}
              onclick={() => toggleReaction(person, type)}
              class="w-7 h-7 rounded flex items-center justify-center transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500 active:scale-90 {active ? 'bg-dark-600/80' : 'hover:bg-dark-600/40'}"
              style="color: {thumbColor(type, active)}"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style="transform: rotate({thumbRotation(type)})">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
            </button>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <!-- Sideways expansion — discussion notes per person -->
  {#each (["amanda", "jeremy"] as const) as person}
    {#if data.reactions[person] === "sideways"}
      <div class="mb-3">
        <label class="block text-[9px] uppercase tracking-[0.25em] text-amber-500/60 mb-1.5 capitalize">
          {person} — what needs discussing?
        </label>
        <textarea
          value={data.reactionNotes[person]}
          oninput={(e) => save({ ...data, reactionNotes: { ...data.reactionNotes, [person]: (e.target as HTMLTextAreaElement).value } })}
          rows={2}
          placeholder="Add discussion notes…"
          class="w-full bg-dark-700/50 border border-amber-500/15 rounded-sm px-3 py-2 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-amber-500/30 transition-[border-color] duration-200 resize-none"
        ></textarea>
      </div>
    {/if}
  {/each}

  <!-- Notes toggle -->
  <button
    type="button"
    onclick={() => notesOpen = !notesOpen}
    class="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-gray-500 hover:text-gray-300 transition-[color] duration-150 focus-visible:outline-none focus-visible:text-gold-400"
  >
    <svg
      class="w-3 h-3 transition-transform duration-200"
      class:rotate-180={notesOpen}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
    Notes
    {#if noteCount > 0}<span class="text-gold-500/50 ml-0.5">{noteCount}</span>{/if}
  </button>

  {#if notesOpen}
    <div class="mt-3 space-y-3">
      {#each (["nate", "amanda", "jeremy"] as const) as person}
        <div>
          <label class="block text-[9px] uppercase tracking-[0.25em] text-gray-600 mb-1.5 capitalize">{person}</label>
          <textarea
            value={data.notes[person]}
            oninput={(e) => save({ ...data, notes: { ...data.notes, [person]: (e.target as HTMLTextAreaElement).value } })}
            rows={2}
            placeholder={person === "nate" ? "Your notes…" : `${person.charAt(0).toUpperCase() + person.slice(1)}'s notes…`}
            class="w-full bg-dark-700/50 border border-dark-600/30 rounded-sm px-3 py-2 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-gold-500/30 transition-[border-color] duration-200 resize-none"
          ></textarea>
        </div>
      {/each}
    </div>
  {/if}
</div>

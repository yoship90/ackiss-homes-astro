<script lang="ts">
  import TodoFeedbackSection from "./TodoFeedbackSection.svelte";

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

  const STATUS_CONFIG: Record<Status, { label: string; color: string; dot: string }> = {
    "in-progress": { label: "In Progress", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
    "todo":        { label: "To Do",       color: "bg-gray-500/10 text-gray-400 border-gray-500/20",   dot: "bg-gray-400" },
  };

  let { entry, feedbackData, onFeedbackSave, onEdit, isDragOver, isDragging, onDragStart, onDragOver, onDrop, onDragEnd }: {
    entry: Entry;
    feedbackData: FeedbackData;
    onFeedbackSave: (d: FeedbackData) => void;
    onEdit: (updates: { title: string; description: string }) => void;
    isDragOver: boolean;
    isDragging: boolean;
    onDragStart: () => void;
    onDragOver: () => void;
    onDrop: () => void;
    onDragEnd: () => void;
  } = $props();

  let editing = $state(false);
  const cfg = STATUS_CONFIG[entry.status];

  function handleEditSubmit(e: Event) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const title = (fd.get("title") as string ?? "").trim();
    const description = (fd.get("description") as string ?? "").trim();
    if (!title) return;
    onEdit({ title, description });
    editing = false;
  }
</script>

<div
  role="listitem"
  ondragover={(e) => { e.preventDefault(); onDragOver(); }}
  ondrop={(e) => { e.preventDefault(); onDrop(); }}
  class="relative bg-dark-700 border rounded-sm p-6 transition-[border-color,opacity] duration-300
    {isDragOver && !isDragging ? 'border-gold-500/50 bg-dark-700/80' : 'border-dark-600/50 hover:border-dark-600'}
    {isDragging ? 'opacity-40' : ''}"
>
  <!-- Top row -->
  <div class="flex items-start justify-between gap-4 mb-3">
    <div class="flex items-center gap-2 flex-wrap">
      <span class="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider px-2.5 py-1 rounded-full border {cfg.color}">
        <span class="w-1.5 h-1.5 rounded-full {cfg.dot}"></span>
        {cfg.label}
      </span>
      {#if entry.priority === "high"}
        <span class="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/20">
          ↑ High Priority
        </span>
      {/if}
      {#if entry.link}
        <a href={entry.link} class="text-xs font-bold text-gold-400 hover:text-gold-300 transition-colors uppercase tracking-wider">
          View →
        </a>
      {/if}
    </div>

    <!-- Date + actions -->
    <div class="flex items-center gap-1 shrink-0">
      <span class="text-xs text-gray-600 mr-1">{entry.date}</span>
      <button
        onclick={() => editing = true}
        title="Edit"
        class="p-1.5 rounded text-gold-500/50 hover:text-gold-400 transition-colors focus-visible:outline-none focus-visible:text-gold-400"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <div
        draggable="true"
        ondragstart={(e) => {
          (e as DragEvent).dataTransfer!.effectAllowed = "move";
          onDragStart();
        }}
        ondragend={onDragEnd}
        title="Drag to reorder"
        class="cursor-grab active:cursor-grabbing p-1.5 rounded"
      >
        <svg width="11" height="15" viewBox="0 0 10 14" fill="currentColor" class="text-gold-500/50 hover:text-gold-400 transition-colors">
          <circle cx="2.5" cy="2" r="1.5"/><circle cx="7.5" cy="2" r="1.5"/>
          <circle cx="2.5" cy="7" r="1.5"/><circle cx="7.5" cy="7" r="1.5"/>
          <circle cx="2.5" cy="12" r="1.5"/><circle cx="7.5" cy="12" r="1.5"/>
        </svg>
      </div>
    </div>
  </div>

  <!-- Title + Description — editable -->
  {#if editing}
    <form onsubmit={handleEditSubmit} class="mt-1 space-y-3">
      <input
        name="title"
        type="text"
        required
        autofocus
        value={entry.title}
        class="w-full bg-dark-800 border border-gold-500/30 rounded-sm px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:border-gold-500 transition-[border-color] duration-200"
      />
      <textarea
        name="description"
        rows={3}
        class="w-full bg-dark-800 border border-dark-600 rounded-sm px-3 py-2 text-gray-400 text-sm focus:outline-none focus:border-gold-500 transition-[border-color] duration-200 resize-none"
      >{entry.description}</textarea>
      <div class="flex gap-2">
        <button type="submit" class="btn-shimmer btn-shimmer-filled px-4 py-1.5 text-dark-900 font-semibold text-xs uppercase tracking-wider rounded-sm hover:scale-[1.015] active:scale-95 transition-transform duration-200 focus-visible:outline-none">
          <span class="relative z-[2]">Save</span>
        </button>
        <button type="button" onclick={() => editing = false} class="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors focus-visible:outline-none">Cancel</button>
      </div>
    </form>
  {:else}
    <h3 class="text-white font-semibold mb-2 leading-snug">{entry.title}</h3>
    <p class="text-gray-400 text-sm leading-relaxed">{entry.description}</p>
    {#if entry.previewImage}
      <div class="mt-4">
        <a href={entry.previewImage} target="_blank" rel="noopener noreferrer">
          <img
            src={entry.previewImage}
            alt="Preview"
            class="w-full rounded-sm border border-dark-600/50 opacity-80 hover:opacity-100 transition-opacity duration-200 cursor-zoom-in"
          />
        </a>
      </div>
    {/if}
  {/if}

  <TodoFeedbackSection entryId={entry.id} data={feedbackData} onSave={onFeedbackSave} />
</div>

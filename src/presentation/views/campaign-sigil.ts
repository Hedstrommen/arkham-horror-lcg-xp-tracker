const CAMPAIGN_SIGILS: Record<string, string> = {
  "Night of the Zealot":
    '<svg class="campaign-sigil" viewBox="0 0 32 32"><path d="M16 4 C10 8 7 13 7 18 C7 24 11 28 16 28 C21 28 25 24 25 18 C25 13 22 8 16 4 Z" fill="none" stroke="#8a2b1f" stroke-width="2"/><circle cx="16" cy="18" r="3.2" fill="#8a2b1f"/><path d="M16 8 L16 13 M11 14 L14 17 M21 14 L18 17" stroke="#8a2b1f" stroke-width="1.6" stroke-linecap="round"/></svg>',
  "The Dunwich Legacy":
    '<svg class="campaign-sigil" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#4a5d3a" stroke-width="2"/><path d="M16 6 C13 10 13 22 16 26 M16 6 C19 10 19 22 16 26 M8 12 C13 14 19 14 24 12 M8 20 C13 18 19 18 24 20" stroke="#4a5d3a" stroke-width="1.4" fill="none"/></svg>',
  "The Path to Carcosa":
    '<svg class="campaign-sigil" viewBox="0 0 32 32"><path d="M16 4 L20 12 L28 12 L21.5 17.5 L24 26 L16 21 L8 26 L10.5 17.5 L4 12 L12 12 Z" fill="none" stroke="#b8a12b" stroke-width="1.8" stroke-linejoin="round"/><circle cx="16" cy="15.5" r="1.6" fill="#b8a12b"/></svg>',
  "The Forgotten Age":
    '<svg class="campaign-sigil" viewBox="0 0 32 32"><path d="M16 5 L26 26 L6 26 Z" fill="none" stroke="#8a6a2a" stroke-width="2" stroke-linejoin="round"/><path d="M16 12 L21 22 L11 22 Z" fill="#8a6a2a"/><path d="M16 5 L16 9 M10.5 15 L13 15 M21.5 15 L19 15" stroke="#8a6a2a" stroke-width="1.4" stroke-linecap="round"/></svg>',
  "The Circle Undone":
    '<svg class="campaign-sigil" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10.5" fill="none" stroke="#5a4a7a" stroke-width="2"/><circle cx="16" cy="16" r="6.5" fill="none" stroke="#5a4a7a" stroke-width="1.4"/><circle cx="16" cy="16" r="2.4" fill="#5a4a7a"/><path d="M16 5.5 L16 9.5 M16 22.5 L16 26.5 M5.5 16 L9.5 16 M22.5 16 L26.5 16" stroke="#5a4a7a" stroke-width="1.6" stroke-linecap="round"/></svg>',
  "The Dream-Eaters":
    '<svg class="campaign-sigil" viewBox="0 0 32 32"><path d="M16 5 C20 8 22 12 22 16 C22 21 19.5 25 16 27 C12.5 25 10 21 10 16 C10 12 12 8 16 5 Z" fill="none" stroke="#3a6a8a" stroke-width="1.8"/><path d="M16 9 C18.5 11.5 19.5 14 19.5 16.5 C19.5 19.5 18 22 16 23.5 C14 22 12.5 19.5 12.5 16.5 C12.5 14 13.5 11.5 16 9 Z" fill="none" stroke="#3a6a8a" stroke-width="1.2"/><circle cx="16" cy="16" r="1.6" fill="#3a6a8a"/></svg>',
  "The Innsmouth Conspiracy":
    '<svg class="campaign-sigil" viewBox="0 0 32 32"><path d="M8 20 C8 12 11 6 16 4 C21 6 24 12 24 20" fill="none" stroke="#2a5a5a" stroke-width="2"/><path d="M10 21 C10 14 12 9 16 7 C20 9 22 14 22 21" fill="none" stroke="#2a5a5a" stroke-width="1.4"/><circle cx="16" cy="14" r="2.2" fill="#2a5a5a"/><path d="M6 23 C9 24 13 24.5 16 24.5 C19 24.5 23 24 26 23" fill="none" stroke="#2a5a5a" stroke-width="2" stroke-linecap="round"/></svg>',
  "Edge of the Earth":
    '<svg class="campaign-sigil" viewBox="0 0 32 32"><path d="M16 4 L19 13 L28 13 L21 18.5 L23.5 27.5 L16 22.5 L8.5 27.5 L11 18.5 L4 13 L13 13 Z" fill="none" stroke="#6a8ab8" stroke-width="1.6" stroke-linejoin="round"/><circle cx="16" cy="16" r="2.6" fill="#6a8ab8"/></svg>',
  "The Scarlet Keys":
    '<svg class="campaign-sigil" viewBox="0 0 32 32"><circle cx="11" cy="11" r="5" fill="none" stroke="#a82838" stroke-width="2.2"/><circle cx="11" cy="11" r="1.8" fill="#a82838"/><path d="M14.5 14.5 L25 25 M22 22 L25.5 18.5 M19.5 24.5 L23 28" stroke="#a82838" stroke-width="2.2" stroke-linecap="round"/></svg>',
  "The Feast of Hemlock Vale":
    '<svg class="campaign-sigil" viewBox="0 0 32 32"><path d="M16 5 C11 9 8 13.5 8 18 C8 23.5 11.5 27 16 27 C20.5 27 24 23.5 24 18 C24 13.5 21 9 16 5 Z" fill="none" stroke="#5a7a3a" stroke-width="1.9"/><path d="M16 9 C13 12 11.5 15 11.5 18 C11.5 21.5 13.5 23.5 16 23.5 C18.5 23.5 20.5 21.5 20.5 18 C20.5 15 19 12 16 9 Z" fill="#5a7a3a"/></svg>',
  "The Drowned City":
    '<svg class="campaign-sigil" viewBox="0 0 32 32"><path d="M6 12 L10 8 L14 12 L18 8 L22 12 L26 8" fill="none" stroke="#2a6a7a" stroke-width="2" stroke-linecap="round"/><path d="M6 18 L10 14 L14 18 L18 14 L22 18 L26 14" fill="none" stroke="#2a6a7a" stroke-width="2" stroke-linecap="round"/><path d="M9 28 L12 22 L16 26 L20 21 L24 26" fill="none" stroke="#2a6a7a" stroke-width="1.9" stroke-linecap="round"/></svg>',
  "Brethren of Ash":
    '<svg class="campaign-sigil" viewBox="0 0 32 32"><path d="M16 3 C19 8 20 13 18.5 18 C17.5 21 15 23 13 22 C11 21 10.5 18 12 16 C13.5 14 16 13.5 17.5 15" fill="none" stroke="#b85a1a" stroke-width="2" stroke-linecap="round"/><path d="M7 24 C10 25.5 13 26 16 26 C19 26 22 25.5 25 24" fill="none" stroke="#b85a1a" stroke-width="1.8" stroke-linecap="round"/><path d="M10 21 C11 21.7 12 22.2 13 22.5 M22 21 C21 21.7 20 22.2 19 22.5" fill="none" stroke="#b85a1a" stroke-width="1.5" stroke-linecap="round"/></svg>',
  "Children of Blood":
    '<svg class="campaign-sigil" viewBox="0 0 32 32"><path d="M16 26 C16 26 6 19 6 12 C6 8 9 5 12.5 5 C14.5 5 15.8 6 16 7 C16.2 6 17.5 5 19.5 5 C23 5 26 8 26 12 C26 19 16 26 16 26 Z" fill="none" stroke="#8a1f2f" stroke-width="2" stroke-linejoin="round"/><path d="M16 11 L16 17 M13 14 L19 14" stroke="#8a1f2f" stroke-width="1.7" stroke-linecap="round"/></svg>',
};

export function renderCampaignSigil(campaignName: string): string {
  return CAMPAIGN_SIGILS[campaignName] ?? "";
}

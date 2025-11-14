(function () {
  // Only run on supported streaming sites (check current frame's hostname)
  const supportedSites = ['hianime', 'aniwatch', 'zoro'];
  const hostname = window.location.hostname.toLowerCase();
  
  // Allow if hostname contains supported site OR if we're in an iframe (player might be cross-origin)
  const isSupported = supportedSites.some(site => hostname.includes(site)) || window.top !== window;
  
  if (!isSupported) return;

  const isTop = window.top === window;

  // ---------- Shared helpers ----------
  function sendPresence(payload, immediate = false) {
    try {
      chrome.runtime.sendMessage({ type: "presence", payload, immediate });
    } catch (e) {
      // Extension context invalidated (e.g., extension reloaded)
      console.log("Discord presence extension context lost - please refresh page");
    }
  }
  function clearPresence() {
    try {
      chrome.runtime.sendMessage({ type: "clear" });
    } catch (e) {
      // Extension context invalidated
      console.log("Discord presence extension context lost");
    }
  }

  // ---------- Subframe (player iframe): read <video> ----------
  if (!isTop) {
    const getVideo = () => document.querySelector("video");
    let bound = false, lastTick = 0;

    function sendUpstream(immediate = false) {
      const v = getVideo();
      if (!v) return;
      window.top.postMessage({
        kind: "HIPRES:VIDEO",
        current: isFinite(v.currentTime) ? v.currentTime : 0,
        duration: isFinite(v.duration) ? v.duration : 0,
        paused: !!v.paused,
        frameUrl: location.href
      }, "*");
    }

    function bindVideo() {
      const v = getVideo();
      if (!v || bound) return false;
      bound = true;
      v.addEventListener("play",  () => sendUpstream(true));
      v.addEventListener("pause", () => sendUpstream(true));
      v.addEventListener("timeupdate", () => {
        const now = Date.now();
        if (now - lastTick > 1000) { lastTick = now; sendUpstream(false); }
      });
      // initial
      sendUpstream(true);
      return true;
    }

    // retry until the player attaches
    let tries = 0;
    const iv = setInterval(() => {
      if (bindVideo() || ++tries > 120) clearInterval(iv);
    }, 500);

    window.addEventListener("beforeunload", () => {
      try { window.top.postMessage({ kind: "HIPRES:CLEAR" }, "*"); } catch {}
    });
    return;
  }

  // ---------- Top page: title/episode + relay ----------
  const PAGE_URL = () => location.href;

  function getAnimeTitleTop() {
    // Prefer embedded JSON you showed in the HTML dump
    const sync = document.querySelector("#syncData");
    if (sync?.textContent) {
      try {
        const j = JSON.parse(sync.textContent);
        if (j?.name) return String(j.name).trim();
      } catch {}
    }
    // Fallbacks
    const dyn = document.querySelector(".anisc-detail h2 .dynamic-name, .film-name a.dynamic-name");
    if (dyn?.textContent) return dyn.textContent.trim();
    const h1 = document.querySelector("h1, .title, .video-title");
    if (h1?.textContent) return h1.textContent.trim();
    return (document.title || "Anime").replace(/\s*\|\s*HiAnime.*$/i, "").trim();
  }

  function getAnimePosterTop() {
    // Try to get the poster image from various locations
    const posterImg = 
      document.querySelector(".film-poster img.film-poster-img") ||
      document.querySelector(".film-poster img") ||
      document.querySelector("img[alt*='poster']") ||
      document.querySelector(".anisc-poster img") ||
      document.querySelector("meta[property='og:image']");
    
    if (posterImg) {
      const src = posterImg.getAttribute("content") || posterImg.src;
      if (src && src.startsWith("http")) return src;
    }
    return null;
  }

  function guessEpisodeTop() {
    // Most reliable after the episode list renders
    const active =
      document.querySelector(".ep-item.active") ||
      document.querySelector(".ssl-item.active") ||
      document.querySelector(".eps.active, .ep.active") ||
      document.querySelector('[class*="episode"].active');

    // Try structured attributes first
    if (active) {
      const numAttr =
        active.getAttribute("data-number") ||
        active.querySelector("[data-number]")?.getAttribute("data-number") ||
        active.querySelector("[data-ep]")?.getAttribute("data-ep");
      if (numAttr && /\d+/.test(numAttr)) return `Ep ${numAttr.match(/\d+/)[0]}`;

      // Then try visible text
      const t = active.textContent?.trim();
      if (t) {
        const m = t.match(/(?:ep(?:isode)?)[^\d]*?(\d+)/i) || t.match(/(^|\D)(\d+)(\D|$)/);
        if (m) return `Ep ${m[1] || m[2]}`;
      }
    }

    // Document title sometimes includes an episode
    const ttl = document.title || "";
    const tm = ttl.match(/(?:ep(?:isode)?)[^\d]*?(\d+)/i);
    if (tm) return `Ep ${tm[1]}`;

    // URL heuristics (last number segment, best-effort)
    const url = location.href;
    const um = url.match(/[?&](?:ep|episode)=(\d+)/i) || url.match(/(?:episode[-_/ ]?)(\d+)/i);
    if (um) return `Ep ${um[1]}`;

    return "Episode";
  }

  let meta = {
    title: getAnimeTitleTop(),
    episode: "Episode",
    poster: getAnimePosterTop()
  };

  // update meta as DOM populates
  const mo = new MutationObserver(() => {
    const newTitle = getAnimeTitleTop();
    if (newTitle && newTitle !== meta.title) meta.title = newTitle;

    const newEp = guessEpisodeTop();
    if (newEp !== "Episode" && newEp !== meta.episode) meta.episode = newEp;

    const newPoster = getAnimePosterTop();
    if (newPoster && newPoster !== meta.poster) meta.poster = newPoster;
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // receive playback from iframe
  let lastPayload = null;
  window.addEventListener("message", (ev) => {
    const data = ev?.data || {};
    if (data.kind === "HIPRES:VIDEO") {
      const payload = {
        title: meta.title || "Anime",
        episode: meta.episode || "Episode",
        current: data.current || 0,
        duration: data.duration || 0,
        pageUrl: PAGE_URL(),
        paused: !!data.paused,
        posterUrl: meta.poster || null
      };
      lastPayload = payload;
      sendPresence(payload, true);
    } else if (data.kind === "HIPRES:CLEAR") {
      lastPayload = null;
      clearPresence();
    }
  });

  // keepalive every 15s in case events go quiet
  setInterval(() => {
    if (lastPayload) sendPresence(lastPayload, false);
  }, 15000);

  // clear on navigation away
  window.addEventListener("beforeunload", () => { clearPresence(); });
})();

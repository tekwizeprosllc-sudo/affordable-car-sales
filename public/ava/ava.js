/* Ava — flirty car-sales plugin. Drop one script tag on any dealer page. */
(function () {
  if (window.AvaPlugin) return;

  const SCRIPT = document.currentScript;
  const CFG = {
    name: (SCRIPT && SCRIPT.getAttribute("data-dealer")) || "Affordable Car Sales",
    phone: (SCRIPT && SCRIPT.getAttribute("data-phone")) || "(513) 424-0304",
    hours: (SCRIPT && SCRIPT.getAttribute("data-hours")) || "Mon–Sat 9am–7pm",
    city: (SCRIPT && SCRIPT.getAttribute("data-city")) || "Middletown, OH",
    avatar: (SCRIPT && SCRIPT.getAttribute("data-avatar")) || "/ava/ava.jpg",
    accent: (SCRIPT && SCRIPT.getAttribute("data-accent")) || "#E10600",
    voice: ((SCRIPT && SCRIPT.getAttribute("data-voice")) || "on") !== "off",
    greetingMp3: (SCRIPT && SCRIPT.getAttribute("data-greeting")) || "/ava/ava-hello.mp3",
    endpoint: (SCRIPT && SCRIPT.getAttribute("data-endpoint")) || "",
    voiceBase: (SCRIPT && SCRIPT.getAttribute("data-voice-base")) || "/ava/voice/",
    leads: (SCRIPT && SCRIPT.getAttribute("data-leads")) || "/api/leads",
    inventory: (SCRIPT && SCRIPT.getAttribute("data-inventory")) || "",
  };

  const LINES = {
    extra: [
      { html: "Slow day on the lot until you showed up. SUV, truck, or something that makes the neighbors talk?", voice: "extra1-v1" },
      { html: "I'm not a search bar. Give me a budget or a body style and I'll hunt.", voice: "extra2-v1" },
      { html: "If you're just browsing, browse louder. What's the monthly number you can live with?", voice: "extra3-v1" },
      { html: "Easy version: kids / no kids / dog / commute. I'll pick from there.", voice: "extra4-v1" },
      { html: "I have patience. Not infinite. Year, budget, or just say surprise me.", voice: "extra5-v1" },
    ],
    hello: [
      { html: "Hey. I'm Ava. I sell cars and I don't do the fake-smile thing. Budget, body style, or are we being chaotic and starting with whatever's loudest on the lot?", voice: "hello1-v1" },
      { html: "Hi. Ava. Don't overthink it. Tell me what you drive now and what you wish it did.", voice: "hello2-v1" },
      { html: "You're here. Good. SUV, truck, cheap and clean, or we going looking trouble?", voice: "hello3-v1" },
      { html: "Hey you. I find the car and I skip the sermon. What are we getting into?", voice: "hello4-v1" },
      { html: "Ava. Online. Bored until you give me a budget. Start talking.", voice: "hello5-v1" },
    ],
    booked: [
      { html: "Got it. I'll have the lot text you about the test drive. If they take more than twenty minutes, they're scared of me. Call the desk if you want to skip the middleman.", voice: "booked1-v1" },
      { html: "Locked in. Someone on the floor will ping you. If your phone stays quiet, call the lot. I already did my part.", voice: "booked2-v1" },
      { html: "You're on the board. Bring your license and the car you want to cheat on. We'll handle the rest.", voice: "booked3-v1" },
      { html: "Done. I sent it through. Don't ghost us. That car will not wait around looking pretty for fun.", voice: "booked4-v1" },
      { html: "Okay. Name's in. Number's in. Now show up. I look stupid when people book and vanish.", voice: "booked5-v1" },
    ],
    trade: [
      { html: "Trade-ins are my love language. Fill this out — year, miles, and how honest you want to be about the dents. I'll ballpark it.", voice: "trade1-v1" },
      { html: "Okay. We'll put a number on that thing you want to stop feeding. Year, make, miles. Use the form.", voice: "trade2-v1" },
      { html: "Trade time. Don't romance the book value. Tell me what it is and I'll tell you what it's worth on this lot.", voice: "trade3-v1" },
      { html: "I can range it from here. Real check happens when we see it. Form's right there. Don't make me beg.", voice: "trade4-v1" },
      { html: "Slide me the year and the miles. I'll be nicer than the internet and meaner than your cousin who knows a guy.", voice: "trade5-v1" },
    ],
    finance: [
      { html: "Financing is the boring part I still crush. All credit types. Tell me a monthly number you can live with and I'll aim a car at it.", voice: "finance1-v1" },
      { html: "We work with all credit. I said all. Give me a monthly and stop pretending FICO is a personality.", voice: "finance2-v1" },
      { html: "Payments I can do. Say pre-approve me if you want me to grab your name, or just throw a monthly number.", voice: "finance3-v1" },
    ],
    drive: [
      { html: "Yes. Life is short and that car looks better with you in it. First name and I'll put you on the board.", voice: "drive1-v1" },
      { html: "Let's drive it before you talk yourself out of it. First name. I'll save the slot.", voice: "drive2-v1" },
      { html: "Test drive. Good. Name, then we stop dating the listing photos.", voice: "drive3-v1" },
    ],
  };
  function pickLine(family) {
    const set = LINES[family];
    const item = set[Math.floor(Math.random() * set.length)];
    return { html: item.html, voice: item.voice };
  }

  // Demo rows below are a fallback only. loadInventory() swaps in the real lot
  // as soon as it answers, mutating in place so the matcher keeps its reference.
  const CARS = [
    { id: "rav4", year: 2022, make: "Toyota", model: "RAV4 XLE AWD", price: 25995, miles: 32451, type: "suv", tags: ["awd", "mpg", "one owner"], hook: "Reliable, cute in a driveway, won't make you look like you're compensating." },
    { id: "bmw5", year: 2021, make: "BMW", model: "5 Series 530i xDrive", price: 28995, miles: 41209, type: "sedan", tags: ["awd", "luxury", "clean carfax"], hook: "Quiet flex. The kind of car that makes the valet stand up straighter." },
    { id: "silverado", year: 2020, make: "Chevrolet", model: "Silverado 1500 LT Trail Boss", price: 32995, miles: 56743, type: "truck", tags: ["4wd", "lift", "v8"], hook: "Lifted, V8, Trail Boss. This one does not ask permission to exist." },
    { id: "crv", year: 2023, make: "Honda", model: "CR-V EX-L AWD", price: 27995, miles: 19882, type: "suv", tags: ["awd", "leather", "low miles"], hook: "Low miles, leather, Honda. The responsible choice that still looks expensive." },
    { id: "wrangler", year: 2020, make: "Jeep", model: "Wrangler Unlimited Sahara", price: 31995, miles: 48350, type: "suv", tags: ["4wd", "removable top", "ready"], hook: "Doors off energy. If you wanted subtle you wouldn't have clicked a Wrangler." },
    { id: "mustang", year: 1998, make: "Ford", model: "Mustang GT", price: 18995, miles: 72000, type: "coupe", tags: ["v8", "manual", "weekend"], hook: "SN95 GT. Loud on purpose. I'll let you pretend it's practical." },
    { id: "charger", year: 2021, make: "Dodge", model: "Charger R/T", price: 27495, miles: 38102, type: "sedan", tags: ["hemi", "rwd", "night"], hook: "Four doors so you can lie and say it's a family car. It is not." },
    { id: "f150", year: 2020, make: "Ford", model: "F-150 XLT 4x4", price: 26495, miles: 61200, type: "truck", tags: ["4x4", "work", "tow"], hook: "The truck your neighbor already regrets not buying." },
  ];

  // mount() owns postLead; replyTo lives outside it and still needs to fire.
  let postLeadFn = null;

  function loadInventory() {
    if (!CFG.inventory) return;
    fetch(CFG.inventory, { headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !Array.isArray(data.cars) || !data.cars.length) return;
        // Keep only cars we can actually talk about: a price and a real name.
        const usable = data.cars.filter(function (c) { return c.make && c.model; });
        if (!usable.length) return;
        CARS.length = 0;
        Array.prototype.push.apply(CARS, usable);
      })
      .catch(function () {});
  }

  const state = {
    open: false,
    messages: [],
    pendingLead: null,
    lead: { name: "", phone: "", intent: "", vehicleLabel: "" },
    listening: false,
    muted: !CFG.voice,
    voiceReady: false,
    history: [],
  };

  const Voice = {
    rec: null,
    utter: null,
    audio: null,
    pickVoice: function () {
      const list = window.speechSynthesis ? speechSynthesis.getVoices() : [];
      const pref = list.filter((v) => /en[-_]?US|en[-_]?GB/i.test(v.lang));
      return (
        pref.find((v) => /female|samantha|victoria|karen|moira|zira|google us english/i.test(v.name)) ||
        pref.find((v) => /neural|natural/i.test(v.name)) ||
        pref[0] ||
        list[0] ||
        null
      );
    },
    strip: function (html) {
      const d = document.createElement("div");
      d.innerHTML = html;
      return (d.textContent || "").replace(/\s+/g, " ").trim();
    },
    stop: function () {
      try { speechSynthesis.cancel(); } catch (e) {}
      if (this.audio) { try { this.audio.pause(); this.audio.currentTime = 0; } catch (e) {} }
    },
    speak: function (html, clip) {
      if (state.muted) return;
      const text = this.strip(html);
      if (!text) return;
      this.stop();
      if (clip) {
        this.playFile(CFG.voiceBase.replace(/\/?$/, "/") + clip + ".mp3");
        return;
      }
      if (!window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(text);
      const v = this.pickVoice();
      if (v) u.voice = v;
      u.rate = 1.02;
      u.pitch = 1.05;
      u.lang = "en-US";
      u.onstart = function () { document.querySelectorAll("#ava-head img, #ava-launcher img").forEach(function (img) { img.classList.add("ava-talk"); }); };
      u.onend = function () { document.querySelectorAll("#ava-head img, #ava-launcher img").forEach(function (img) { img.classList.remove("ava-talk"); }); };
      this.utter = u;
      try { speechSynthesis.resume(); } catch (e) {}
      speechSynthesis.speak(u);
    },
    playFile: function (src) {
      if (state.muted || !src) return;
      this.stop();
      const imgs = function (on) {
        document.querySelectorAll("#ava-head img, #ava-launcher img").forEach(function (img) {
          img.classList.toggle("ava-talk", on);
        });
      };
      this.audio = new Audio(src);
      this.audio.onplay = function () { imgs(true); };
      this.audio.onended = function () { imgs(false); };
      this.audio.onerror = function () { imgs(false); };
      this.audio.play().catch(function () { imgs(false); });
    },
    listen: function (onText, onEnd) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        onEnd && onEnd(false);
        return null;
      }
      this.stop();
      const rec = new SR();
      rec.lang = "en-US";
      rec.interimResults = true;
      rec.continuous = false;
      rec.onresult = function (ev) {
        let final = "";
        let live = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const t = ev.results[i][0].transcript;
          if (ev.results[i].isFinal) final += t;
          else live += t;
        }
        onText(final || live, !!final);
      };
      rec.onerror = function () { onEnd && onEnd(false); };
      rec.onend = function () { onEnd && onEnd(true); };
      rec.start();
      this.rec = rec;
      return rec;
    },
    haltListen: function () {
      try { if (this.rec) this.rec.stop(); } catch (e) {}
      this.rec = null;
    },
  };

  function money(n) {
    return "$" + n.toLocaleString();
  }
  function miles(n) {
    return n.toLocaleString() + " mi";
  }
  function title(c) {
    return c.year + " " + c.make + " " + c.model;
  }
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function matchCars(q) {
    const t = (q || "").toLowerCase();
    let list = CARS.slice();
    const budget = t.match(/under\s*\$?\s*(\d{2,3})\s*k/) || t.match(/\$?\s*(\d{4,6})/);
    if (/under\s*\$?\s*(\d{2,3})\s*k/.test(t)) {
      const k = parseInt(t.match(/under\s*\$?\s*(\d{2,3})\s*k/)[1], 10) * 1000;
      list = list.filter((c) => c.price <= k);
    } else if (budget && !/k\b/.test(t) && parseInt(budget[1], 10) > 1000) {
      list = list.filter((c) => c.price <= parseInt(budget[1], 10));
    }
    if (/\b(suv|crossover)\b/.test(t)) list = list.filter((c) => c.type === "suv");
    if (/\b(truck|pickup)\b/.test(t)) list = list.filter((c) => c.type === "truck");
    if (/\b(sedan|car)\b/.test(t) && !/suv|truck/.test(t)) list = list.filter((c) => c.type === "sedan" || c.type === "coupe");
    if (/\b(jeep|wrangler)\b/.test(t)) list = list.filter((c) => /jeep|wrangler/i.test(c.make + c.model));
    if (/\b(bmw)\b/.test(t)) list = list.filter((c) => c.make === "BMW");
    if (/\b(toyota|rav)\b/.test(t)) list = list.filter((c) => /toyota|rav/i.test(c.make + c.model));
    if (/\b(honda|cr-?v)\b/.test(t)) list = list.filter((c) => /honda|cr-v/i.test(c.make + c.model));
    if (/\b(chevy|chevrolet|silverado)\b/.test(t)) list = list.filter((c) => /chevrolet|silverado/i.test(c.make + c.model));
    if (/\b(ford|f-?150|mustang)\b/.test(t)) list = list.filter((c) => /ford|f-150|mustang/i.test(c.make + c.model));
    if (/\b(dodge|charger|hemi)\b/.test(t)) list = list.filter((c) => /dodge|charger/i.test(c.make + c.model));
    if (/\b(4x4|4wd|awd)\b/.test(t)) list = list.filter((c) => c.tags.some((x) => /4wd|4x4|awd/i.test(x)));
    if (/\b(v8|hemi|loud|fast|muscle)\b/.test(t)) list = list.filter((c) => /v8|hemi|mustang|charger|trail boss/i.test(c.model + c.tags.join(" ")));
    if (/\b(cheap|budget|affordable|under 20)\b/.test(t)) list = list.filter((c) => c.price < 22000);
    return list;
  }

  function findCar(q) {
    const t = (q || "").toLowerCase();
    return CARS.find((c) => t.includes(c.id) || t.includes(c.model.split(" ")[0].toLowerCase()) && t.includes(c.make.toLowerCase())) || null;
  }

  function replyTo(text) {
    const t = (text || "").trim();
    const low = t.toLowerCase();

    if (state.pendingLead === "name") {
      state.lead.name = t.split(/\s+/).slice(0, 3).join(" ");
      state.pendingLead = "phone";
      return { html: "Cute name. Now the number I actually need — cell is fine. I don't do landlines in " + new Date().getFullYear() + ".", voice: "name" };
    }
    if (state.pendingLead === "phone") {
      state.lead.phone = t;
      state.pendingLead = null;
      if (postLeadFn) {
        postLeadFn({
          source: "ava",
          intent: state.lead.intent || "test drive",
          name: state.lead.name,
          phone: state.lead.phone,
          vehicleLabel: state.lead.vehicleLabel || "",
          status: "new",
        });
      }
      return pickLine("booked");
    }

    if (/^(hi|hey|hello|yo|sup|howdy|what's up|whats up)\b/.test(low) || low.length < 3) {
      return pickLine("hello");
    }

    if (/\b(hours|open|close|location|address|where are you)\b/.test(low)) {
      return {
        html:
          CFG.name +
          " — " +
          CFG.city +
          ".<br>" +
          CFG.hours +
          ".<br>Call the humans at " +
          CFG.phone +
          " if you insist. I'm here after they lock the door.",
        voice: "hours",
      };
    }

    if (/\b(human|person|manager|nate|salesman|sales man|real person)\b/.test(low)) {
      return {
        html:
          "You can have a human. They're slower and they blink more. " +
          CFG.phone +
          " — ask for whoever's on the floor. Or stay here. I'm more fun and I don't take lunch.",
        voice: "human",
      };
    }

    if (/\b(financ|loan|credit|payment|apr|approved)\b/.test(low)) {
      return pickLine("finance");
    }

    if (/\b(pre-?approve)\b/.test(low)) {
      state.pendingLead = "name";
      state.lead.intent = "financing / pre-approval";
      return { html: "Okay hotshot. First name. I already know you're about to lowball the monthly.", voice: "preapprove" };
    }

    if (/\b(trade|trade-?in|what.?s my .*worth|value my)\b/.test(low)) {
      const line = pickLine("trade");
      line.form = "trade";
      return line;
    }

    if (/\b(test drive|testdrive|drive it|come see|schedule|appointment|book)\b/.test(low)) {
      const hit = matchCars(low);
      const pick = hit[0] || CARS[4];
      state.pendingLead = "name";
      state.lead.intent = "test drive — " + title(pick);
      state.lead.vehicleLabel = title(pick);
      const line = pickLine("drive");
      line.cars = [pick];
      return line;
    }

    if (/\b(flirt|sexy|hot|beautiful|pretty|date|number)\b/.test(low) && !/\bvin|stock\b/.test(low)) {
      return {
        html: "Easy. You can take me for a ride after you take a car for a ride. Pick a vehicle. I'll be here looking expensive.",
        voice: "flirt",
      };
    }

    if (/\b(thank|thanks|cool|nice|perfect|bet)\b/.test(low)) {
      return { html: "Don't thank me yet. Thank me when the keys are in your hand and your old car is someone else's problem.", voice: "thanks" };
    }

    const cars = matchCars(low);
    const askedInventory = /\b(show|inventory|what do you have|options|cars|suv|truck|sedan|jeep|bmw|toyota|honda|ford|chevy|dodge|mustang|charger|wrangler|under|budget|awd|4x4|v8)\b/.test(low);

    if (askedInventory || cars.length && cars.length < CARS.length) {
      if (!cars.length) {
        return {
          html: "Nothing on the floor matches that exactly. Give me a looser leash — budget, SUV vs truck, or 'I want something that scares my HOA.'",
          voice: "nomatch",
        };
      }
      const line =
        cars.length === 1
          ? cars[0].hook
          : "I pulled " + cars.length + ". Don't act overwhelmed. Point at one and I'll get mean about the rest.";
      return { html: line, cars: cars.slice(0, 4), voice: "picks" };
    }

    if (/\b(price|how much|cost)\b/.test(low)) {
      return { html: "Prices are on the cars, not a mystery novel. Tell me a ceiling and I'll stop showing you the ones that will hurt.", cars: CARS.slice(0, 3), voice: "price" };
    }

    return pickLine("extra");
  }

  function injectStyles() {
    if (document.getElementById("ava-plugin-css")) return;
    const css = `
#ava-root{all:initial;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
#ava-root *{box-sizing:border-box}
#ava-launcher{position:fixed;right:22px;bottom:22px;z-index:2147483000;display:flex;align-items:center;gap:10px;border:0;background:transparent;cursor:pointer;padding:0}
#ava-launcher .ava-pill{background:#111;color:#fff;border:1px solid #2a2a2a;border-radius:999px;padding:6px 18px 6px 6px;display:flex;align-items:center;gap:10px;box-shadow:0 10px 34px rgba(0,0,0,.4);transition:border-color .2s,transform .2s}
#ava-launcher:hover .ava-pill{border-color:${CFG.accent};transform:translateY(-1px)}
#ava-launcher img{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid ${CFG.accent}}
#ava-launcher .ava-copy{text-align:left}
#ava-launcher .ava-copy b{display:block;font-size:13px;font-weight:600;letter-spacing:.01em;white-space:nowrap}
#ava-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block;margin-right:4px}
#ava-overlay{position:fixed;inset:0;z-index:2147482999;background:rgba(0,0,0,.55);opacity:0;visibility:hidden;transition:opacity .28s ease,visibility .28s ease;display:none}
#ava-overlay.open{opacity:1;visibility:visible}
/* Right-edge drawer. Top gutter clears the site nav so it stays clickable. */
#ava-panel{position:fixed;right:0;top:88px;bottom:12px;z-index:2147483000;width:400px;max-width:calc(100vw - 16px);background:#0b0b0d;color:#fff;border:1px solid #2a2a2a;border-right:0;border-radius:16px 0 0 16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:-24px 0 80px rgba(0,0,0,.55);transform:translateX(calc(100% + 32px));visibility:hidden;transition:transform .3s cubic-bezier(.22,.61,.36,1),visibility .3s}
#ava-panel.open{transform:none;visibility:visible}
#ava-head{display:flex;gap:12px;align-items:center;padding:14px 14px 12px;border-bottom:1px solid #222;background:linear-gradient(180deg,#161616,#0b0b0d)}
#ava-head img,#ava-launcher img{object-fit:cover}
#ava-head img{width:52px;height:52px;border-radius:50%;border:2px solid ${CFG.accent}}
#ava-head img.ava-talk,#ava-launcher img.ava-talk{box-shadow:0 0 0 3px ${CFG.accent};animation:avapulse 0.9s infinite}
#ava-head h3{margin:0;font-size:18px;font-weight:700}
#ava-head h3 em{font-style:normal;color:${CFG.accent};font-family:Georgia,serif}
#ava-head p{margin:2px 0 0;font-size:11px;color:#aaa}
.ava-head-actions{margin-left:auto;display:flex;align-items:center;gap:8px}
#ava-x{background:transparent;border:0;color:#888;font-size:22px;cursor:pointer;line-height:1;padding:0 2px}
#ava-x:hover{color:#fff}
#ava-msgs{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#0b0b0d}
.ava-row{display:flex;gap:8px;align-items:flex-end}
.ava-row.me{justify-content:flex-end}
.ava-bubble{max-width:82%;padding:10px 12px;border-radius:14px;font-size:13.5px;line-height:1.45}
.ava-row.ava .ava-bubble{background:#17181c;border:1px solid #2a2a2a;border-bottom-left-radius:4px;color:#eee}
.ava-row.me .ava-bubble{background:${CFG.accent};color:#fff;border-bottom-right-radius:4px}
.ava-cars{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.ava-car{background:#141416;border:1px solid #2c2c2c;border-radius:12px;padding:10px;text-align:left;color:#fff;cursor:pointer;width:100%}
.ava-car:hover{border-color:${CFG.accent}}
.ava-car b{display:block;font-size:13px}
.ava-car i{font-style:normal;color:${CFG.accent};font-weight:700;float:right}
.ava-car small{display:block;color:#999;margin-top:3px;font-size:11px}
.ava-quick{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 10px}
.ava-quick button{background:#141416;color:#ddd;border:1px solid #333;border-radius:999px;padding:7px 10px;font-size:11px;cursor:pointer}
.ava-quick button:hover{border-color:${CFG.accent};color:#fff}
#ava-form{display:flex;gap:8px;padding:10px 12px 14px;border-top:1px solid #222}
#ava-form input{flex:1;background:#141416;border:1px solid #333;border-radius:999px;color:#fff;padding:10px 14px;font-size:13px;outline:none}
#ava-form input:focus{border-color:${CFG.accent}}
#ava-form button{width:42px;height:42px;border:0;border-radius:50%;background:${CFG.accent};color:#fff;font-size:16px;cursor:pointer}
#ava-mute{width:34px;height:34px;border:1px solid #333;border-radius:50%;background:#141416;color:#ddd;font-size:14px;cursor:pointer;flex:0 0 34px}
#ava-mute.on{color:${CFG.accent};border-color:${CFG.accent}}
.ava-trade{width:100%;max-width:100%;background:#141416;border:1px solid #2c2c2c;border-radius:12px;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.ava-trade label{display:flex;flex-direction:column;gap:4px;font-size:10px;color:#aaa;letter-spacing:.04em;text-transform:uppercase}
.ava-trade label.wide{grid-column:1/-1}
.ava-trade input,.ava-trade select{background:#0b0b0d;border:1px solid #333;border-radius:8px;color:#fff;padding:8px;font-size:13px}
.ava-trade button{grid-column:1/-1;background:${CFG.accent};border:0;color:#fff;border-radius:8px;padding:10px;cursor:pointer;font-weight:700}
.ava-wave i{display:inline-block;width:3px;height:10px;background:${CFG.accent};border-radius:2px;animation:avaeq 0.7s infinite ease-in-out}
.ava-wave i:nth-child(2){animation-delay:.1s;height:16px}
.ava-wave i:nth-child(3){animation-delay:.2s;height:8px}
.ava-wave i:nth-child(4){animation-delay:.15s;height:14px}
@keyframes avaeq{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}
@keyframes avapulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
.ava-typing{font-size:12px;color:#888;padding-left:8px}
@media(max-width:640px){
#ava-overlay{display:block}
#ava-panel{top:0;bottom:0;right:0;left:0;width:auto;max-width:none;border:0;border-radius:0}
#ava-launcher{right:14px;bottom:14px}
}
@media(prefers-reduced-motion:reduce){#ava-panel,#ava-overlay{transition:none}}
`;
    const el = document.createElement("style");
    el.id = "ava-plugin-css";
    el.textContent = css;
    document.head.appendChild(el);
  }

  function mount() {
    injectStyles();
    const root = document.createElement("div");
    root.id = "ava-root";
    root.innerHTML = `
      <button id="ava-launcher" type="button" aria-label="Talk with Ava">
        <span class="ava-pill">
          <img src="${esc(CFG.avatar)}" alt="Ava">
          <span class="ava-copy"><b>Talk with Ava</b></span>
        </span>
      </button>
      <div id="ava-overlay"></div>
      <div id="ava-panel" role="dialog" aria-label="Ava chat" aria-modal="true">
        <div id="ava-head">
          <img src="${esc(CFG.avatar)}" alt="">
          <div>
            <h3><em>Ava</em></h3>
            <p>Car-buying concierge</p>
          </div>
          <span class="ava-head-actions">
            <button type="button" id="ava-mute" title="Toggle Ava voice" aria-label="Mute">🔊</button>
            <button id="ava-x" type="button" aria-label="Close">×</button>
          </span>
        </div>
        <div id="ava-msgs"></div>
        <div class="ava-quick">
          <button data-q="Show me SUVs under 30k">SUVs under $30k</button>
          <button data-q="I want something loud">Something loud</button>
          <button data-q="Schedule a test drive">Test drive</button>
          <button data-q="What's my trade worth">Trade-in</button>
          <button data-q="Financing questions">Financing</button>
        </div>
        <form id="ava-form" autocomplete="off">
          <input id="ava-input" placeholder="Type or tap a button…" maxlength="240">
          <button type="submit" aria-label="Send">➤</button>
        </form>
      </div>`;
    document.body.appendChild(root);

    const panel = root.querySelector("#ava-panel");
    const overlay = root.querySelector("#ava-overlay");
    const msgs = root.querySelector("#ava-msgs");
    const input = root.querySelector("#ava-input");

    const muteBtn = root.querySelector("#ava-mute");
    let greeted = false;

    function setMuteUI() {
      muteBtn.textContent = state.muted ? "🔇" : "🔊";
      muteBtn.classList.toggle("on", !state.muted);
    }
    setMuteUI();

    function open() {
      state.open = true;
      panel.classList.add("open");
      if (overlay) overlay.classList.add("open");
      input.focus();
      if (!greeted && !state.muted) {
        greeted = true;
        Voice.playFile(CFG.greetingMp3);
      }
    }
    function close() {
      state.open = false;
      panel.classList.remove("open");
      if (overlay) overlay.classList.remove("open");
      Voice.stop();
    }

    muteBtn.addEventListener("click", () => {
      state.muted = !state.muted;
      setMuteUI();
      if (state.muted) Voice.stop();
    });

    root.querySelector("#ava-launcher").addEventListener("click", () => (state.open ? close() : open()));
    root.querySelector("#ava-x").addEventListener("click", close);
    if (overlay) overlay.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.open) close();
    });
    root.querySelectorAll(".ava-quick button").forEach((b) => {
      b.addEventListener("click", () => send(b.getAttribute("data-q")));
    });
    root.querySelector("#ava-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = input.value.trim();
      if (!v) return;
      input.value = "";
      send(v);
    });

    function addRow(who, html, cars) {
      const row = document.createElement("div");
      row.className = "ava-row " + who;
      const bub = document.createElement("div");
      bub.className = "ava-bubble";
      bub.innerHTML = html;
      if (cars && cars.length) {
        const wrap = document.createElement("div");
        wrap.className = "ava-cars";
        cars.forEach((c) => {
          const btn = document.createElement("button");
          btn.className = "ava-car";
          btn.type = "button";
          btn.innerHTML =
            "<i>" +
            money(c.price) +
            "</i><b>" +
            esc(title(c)) +
            "</b><small>" +
            miles(c.miles) +
            " · " +
            esc(c.tags.join(" · ")) +
            "</small>";
          btn.addEventListener("click", () => send("Tell me about the " + title(c) + " and book a test drive"));
          wrap.appendChild(btn);
        });
        bub.appendChild(wrap);
      }
      row.appendChild(bub);
      msgs.appendChild(row);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function postLead(payload) {
      if (!CFG.leads) return;
      fetch(CFG.leads, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(function () {});
    }
    postLeadFn = postLead;

    function ballpark(year, miles, condition) {
      const age = Math.max(0, new Date().getFullYear() - (parseInt(year, 10) || 2015));
      const mi = parseInt(String(miles).replace(/[^\d]/g, ""), 10) || 120000;
      let n = 14000 - age * 700 - Math.max(0, mi - 80000) / 18;
      if (condition === "rough") n *= 0.62;
      if (condition === "fair") n *= 0.8;
      if (condition === "clean") n *= 1;
      if (condition === "extra") n *= 1.12;
      n = Math.max(800, Math.min(28000, n));
      const low = Math.round(n * 0.82 / 100) * 100;
      const high = Math.round(n * 1.08 / 100) * 100;
      return { low, high };
    }

    function mountTradeForm() {
      if (msgs.querySelector("#ava-trade-form")) return;
      const row = document.createElement("div");
      row.className = "ava-row ava";
      row.innerHTML =
        '<form class="ava-trade" id="ava-trade-form">' +
        '<label>Year<input name="year" required inputmode="numeric" placeholder="2016"></label>' +
        '<label>Miles<input name="miles" required inputmode="numeric" placeholder="98000"></label>' +
        '<label>Make<input name="make" required placeholder="Honda"></label>' +
        '<label>Model<input name="model" required placeholder="Civic"></label>' +
        '<label class="wide">Condition<select name="condition"><option value="clean">Clean — one owner energy</option><option value="fair">Fair — honest miles</option><option value="rough">Rough — it lived a life</option><option value="extra">Extra clean</option></select></label>' +
        '<label>Your name<input name="name" placeholder="First name"></label>' +
        '<label>Cell<input name="phone" placeholder="513…"></label>' +
        '<button type="submit">Get my range</button></form>';
      msgs.appendChild(row);
      msgs.scrollTop = msgs.scrollHeight;
      row.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault();
        const f = e.target;
        const year = f.year.value.trim();
        const make = f.make.value.trim();
        const model = f.model.value.trim();
        const miles = f.miles.value.trim();
        const condition = f.condition.value;
        const name = f.name.value.trim();
        const phone = f.phone.value.trim();
        const label = year + " " + make + " " + model;
        const range = ballpark(year, miles, condition);
        f.querySelector("button").disabled = true;
        addRow("me", esc(label + " · " + miles + " mi"));
        const html =
          "On a " +
          esc(label) +
          " with " +
          esc(miles) +
          " miles, I'd shop it around <b>" +
          money(range.low) +
          "–" +
          money(range.high) +
          "</b> before we put eyes on it. That's a range, not a check. Bring it in and I'll get you a number you can actually use. Want me to put you on the board?";
        addRow("ava", html);
        Voice.speak(html, "trade");
        postLead({
          source: "ava",
          intent: "trade-in",
          name: name || state.lead.name || "",
          phone: phone || state.lead.phone || "",
          vehicleLabel: label,
          message: label + ", " + miles + " mi, " + condition + ", range " + range.low + "-" + range.high,
          status: "new",
        });
        if (name) state.lead.name = name;
        if (phone) state.lead.phone = phone;
        state.lead.intent = "trade-in — " + label;
      });
    }

    function finish(res) {
      addRow("ava", res.html, res.cars);
      Voice.speak(res.html, res.voice);
      state.history.push({ role: "assistant", content: Voice.strip(res.html) });
      if (state.history.length > 16) state.history = state.history.slice(-16);
      if (res.form === "trade") mountTradeForm();
    }

    async function askModel(text) {
      if (!CFG.endpoint) return null;
      try {
        const r = await fetch(CFG.endpoint.replace(/\/$/, "") + (CFG.endpoint.indexOf("/chat") >= 0 ? "" : "/chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            messages: state.history,
            lead: state.lead.name || state.lead.phone ? state.lead : null,
          }),
        });
        const data = await r.json();
        if (!r.ok || data.fallback || !data.html && !data.text) return null;
        if (data.text && !data.html) {
          data.html = esc(data.text).replace(/\n/g, "<br>");
        }
        if (Array.isArray(data.cars)) {
          data.cars = data.cars
            .map((c) => (c && c.id ? c : CARS.find((x) => x.id === c)))
            .filter(Boolean);
        }
        if (data.ask === "name" || data.ask === "phone") state.pendingLead = data.ask;
        return data;
      } catch (e) {
        return null;
      }
    }

    async function send(text) {
      addRow("me", esc(text));
      state.history.push({ role: "user", content: text });
      const wait = document.createElement("div");
      wait.className = "ava-typing";
      wait.textContent = CFG.endpoint
        ? "Ava is thinking with her actual brain…"
        : "Ava is looking at you like you should already know…";
      msgs.appendChild(wait);
      msgs.scrollTop = msgs.scrollHeight;
      let res = await askModel(text);
      if (!res) res = replyTo(text);
      wait.remove();
      finish(res);
    }

    addRow(
      "ava",
      "Hi there. I'm Ava — I find the car, talk money without the sermon, and book the drive. Don't be shy. What are we getting into?"
    );

    if (window.speechSynthesis) speechSynthesis.onvoiceschanged = function () {};

    window.AvaPlugin = {
      open,
      close,
      send,
      voice: Voice,
      mute: function (on) { state.muted = !!on; setMuteUI(); if (on) Voice.stop(); },
      config: CFG,
      inventory: CARS,
    };
  }

  loadInventory();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();

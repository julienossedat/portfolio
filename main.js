(function () {
  var I = window.I18N;

  /* Égaliseur de la page d'accueil */
  var eq = document.getElementById("eq");
  if (eq) {
    for (var i = 0; i < 40; i++) {
      var b = document.createElement("i");
      b.style.height = 20 + Math.abs(Math.sin(i * 0.55)) * 80 + "%";
      b.style.animationDelay = i * 0.07 + "s";
      eq.appendChild(b);
    }
  }

  /* Page Projets : catégories et cartes (données "categories" et "projets" dans projets.html) */
  var cats = document.getElementById("cats");
  var catRefs = [];
  var cardRefs = [];

  function pick(p, field) {
    if (I.get() === "en" && p.en && p.en[field]) return p.en[field];
    return p[field];
  }

  function buildCard(p) {
    var c = document.createElement("article");
    c.className = "card panel" + (p.lock ? " lock" : "");
    var iframe = "";
    if (!p.lock && p.yt) {
      iframe = '<iframe src="https://www.youtube.com/embed/' + p.yt + '?enablejsapi=1&playsinline=1" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>';
    }
    c.innerHTML =
      '<div class="media">' + iframe + "</div>" +
      '<div class="t"><span></span><span></span></div>' +
      "<h3></h3><p></p>" +
      '<div class="role"><b></b> <span></span></div>' +
      '<div class="tags"></div>';
    var r = {
      p: p,
      media: c.querySelector(".media"),
      iframe: c.querySelector("iframe"),
      type: c.querySelectorAll(".t span")[0],
      annee: c.querySelectorAll(".t span")[1],
      h3: c.querySelector("h3"),
      desc: c.querySelector("p"),
      role: c.querySelector(".role"),
      roleB: c.querySelector(".role b"),
      roleS: c.querySelector(".role span"),
      tags: c.querySelector(".tags"),
      link: null,
      alt: null
    };
    if (!p.lock && !p.yt && p.lien) {
      r.link = document.createElement("a");
      r.link.href = p.lien;
      r.link.target = "_blank";
      r.link.rel = "noopener";
      r.media.appendChild(r.link);
    }
    (p.outils || []).forEach(function (o) {
      var s = document.createElement("span");
      s.textContent = o;
      r.tags.appendChild(s);
    });
    if (p.yt && p.lien) {
      r.alt = document.createElement("a");
      r.alt.className = "alt";
      r.alt.href = p.lien;
      r.alt.target = "_blank";
      r.alt.rel = "noopener";
      c.appendChild(r.alt);
    }
    r.card = c;
    cardRefs.push(r);
    return c;
  }

  function applyProjects() {
    var en = I.get() === "en";
    catRefs.forEach(function (k) {
      k.h.textContent = (en && k.k.titre_en) || k.k.titre;
    });
    cardRefs.forEach(function (r) {
      var p = r.p;
      var title = p.lock ? I.t("proj.soonTitle") : pick(p, "titre");
      r.type.textContent = pick(p, "type") || "";
      r.annee.textContent = p.annee || "";
      r.h3.textContent = title;
      r.desc.textContent = p.lock ? I.t("proj.soonDesc") : pick(p, "desc") || "";
      r.roleB.textContent = I.t("proj.role");
      var role = pick(p, "role");
      r.roleS.textContent = role || "";
      r.role.hidden = !role;
      r.tags.hidden = !(p.outils && p.outils.length);
      if (r.iframe) r.iframe.title = I.t("proj.player") + " " + title;
      if (r.link) r.link.textContent = I.t("proj.watch");
      if (!r.iframe && !r.link) r.media.textContent = I.t("proj.soon");
      if (r.alt) r.alt.textContent = I.t("home.yt");
    });
  }

  if (cats && window.projets) {
    (window.categories || []).forEach(function (k) {
      var sec = document.createElement("section");
      var h = document.createElement("h2");
      h.className = "st";
      var g = document.createElement("div");
      g.className = "grid";
      var items = window.projets.filter(function (p) { return p.cat === k.id; });
      if (!items.length) items = [{ lock: true }];
      items.forEach(function (p) { g.appendChild(buildCard(p)); });
      sec.appendChild(h);
      sec.appendChild(g);
      cats.appendChild(sec);
      catRefs.push({ k: k, h: h });
    });
    I.onChange(applyProjects);

    /* La carte s'agrandit à la lecture, rétrécit à l'arrêt */
    var players = [];
    window.onYouTubeIframeAPIReady = function () {
      document.querySelectorAll(".card iframe").forEach(function (f) {
        var card = f.closest(".card");
        var pl = new YT.Player(f, {
          events: {
            onStateChange: function (e) {
              if (e.data === 1) {
                players.forEach(function (o) {
                  if (o.p !== pl && o.p.pauseVideo) o.p.pauseVideo();
                });
                document.querySelectorAll(".card.big").forEach(function (x) {
                  if (x !== card) x.classList.remove("big");
                });
                card.classList.add("big");
                setTimeout(function () {
                  card.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 200);
              } else if (e.data === 2 || e.data === 0) {
                setTimeout(function () {
                  if (e.data === 0 || pl.getPlayerState() !== 1) {
                    card.classList.remove("big");
                    if (!document.querySelector(".card.big")) {
                      setTimeout(function () {
                        var sec = card.closest("section") || document.getElementById("projets");
                        var top = sec.getBoundingClientRect().top + window.pageYOffset - 84;
                        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
                      }, 600);
                    }
                  }
                }, 400);
              }
            }
          }
        });
        players.push({ p: pl, c: card });
      });
    };
    if (document.querySelector(".card iframe")) {
      var ys = document.createElement("script");
      ys.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(ys);
    }
  }

  /* Formulaire de contact (FormSubmit) */
  var cf = document.getElementById("cf");
  if (cf) {
    cf.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var st = document.getElementById("cs");
      var bt = cf.querySelector("button");
      if (cf.elements["_honey"].value) return;
      bt.disabled = true;
      st.textContent = I.t("form.sending");
      fetch("https://formsubmit.co/ajax/julien.ossedat1@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: cf.elements["name"].value,
          email: cf.elements["email"].value,
          message: cf.elements["message"].value,
          _subject: "Nouveau message depuis ton portfolio",
          _template: "table"
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && (d.success === true || d.success === "true")) {
            cf.reset();
            st.textContent = I.t("form.ok");
          } else {
            throw new Error("échec");
          }
        })
        .catch(function () {
          st.textContent = I.t("form.fail");
        })
        .finally(function () { bt.disabled = false; });
    });
  }

  I.apply();
})();

(function () {
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

  /* Cartes de la page Projets (liste "projets" définie dans projets.html) */
  var grid = document.getElementById("grid");
  if (grid && window.projets) {
    window.projets.forEach(function (p) {
      var c = document.createElement("article");
      c.className = "card panel" + (p.lock ? " lock" : "");
      var media;
      if (p.lock) {
        media = "Bientôt disponible";
      } else if (p.yt) {
        media = '<iframe src="https://www.youtube.com/embed/' + p.yt + '?enablejsapi=1&playsinline=1" title="Lecteur vidéo : ' + p.titre.replace(/"/g, "") + '" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>';
      } else if (p.lien) {
        media = '<a href="' + p.lien + '" target="_blank" rel="noopener">Voir la vidéo</a>';
      } else {
        media = "Extrait à venir";
      }
      c.innerHTML =
        '<div class="media">' + media + "</div>" +
        '<div class="t"><span></span><span></span></div>' +
        "<h3></h3><p></p>" +
        '<div class="role"><b>Rôle :</b> <span></span></div>' +
        '<div class="tags"></div>';
      var t = c.querySelectorAll(".t span");
      t[0].textContent = p.type || "";
      t[1].textContent = p.annee || "";
      c.querySelector("h3").textContent = p.titre;
      c.querySelector("p").textContent = p.desc || "";
      if (p.role) {
        c.querySelector(".role span").textContent = p.role;
      } else {
        c.querySelector(".role").remove();
      }
      var tags = c.querySelector(".tags");
      (p.outils || []).forEach(function (o) {
        var s = document.createElement("span");
        s.textContent = o;
        tags.appendChild(s);
      });
      if (!(p.outils && p.outils.length)) tags.remove();
      if (p.yt && p.lien) {
        var a = document.createElement("a");
        a.className = "alt";
        a.href = p.lien;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "Vidéo indisponible ? Ouvrir sur YouTube";
        c.appendChild(a);
      }
      grid.appendChild(c);
    });

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
                        document.getElementById("projets").scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 350);
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
      st.textContent = "Envoi en cours…";
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
            st.textContent = "Merci ! Ton message a bien été envoyé.";
          } else {
            throw new Error("échec");
          }
        })
        .catch(function () {
          st.textContent = "L'envoi a échoué. Réessaie ou écris-moi directement à julien.ossedat1@gmail.com.";
        })
        .finally(function () { bt.disabled = false; });
    });
  }
})();

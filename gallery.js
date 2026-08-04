// Lightbox gallery — vanilla JS, no dependencies, works offline.
(function () {
    "use strict";

    var links = Array.prototype.slice.call(document.querySelectorAll(".gallery-grid a"));
    if (!links.length) return;

    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.innerHTML =
        '<button class="lb-close" aria-label="Close">&times;</button>' +
        '<button class="lb-nav lb-prev" aria-label="Previous">&#8249;</button>' +
        '<img alt="">' +
        '<div class="lb-caption"></div>' +
        '<button class="lb-nav lb-next" aria-label="Next">&#8250;</button>';
    document.body.appendChild(lightbox);

    var img = lightbox.querySelector("img");
    var caption = lightbox.querySelector(".lb-caption");
    var current = -1;

    function show(i) {
        current = (i + links.length) % links.length;
        var a = links[current];
        img.src = a.getAttribute("href");
        img.alt = a.getAttribute("data-caption") || a.querySelector("img").alt || "";
        caption.textContent = img.alt;
    }

    function open(i) {
        show(i);
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function close() {
        lightbox.classList.remove("open");
        document.body.style.overflow = "";
    }

    links.forEach(function (a, i) {
        a.addEventListener("click", function (e) {
            e.preventDefault();
            open(i);
        });
    });

    lightbox.querySelector(".lb-close").addEventListener("click", close);
    lightbox.querySelector(".lb-prev").addEventListener("click", function (e) {
        e.stopPropagation();
        show(current - 1);
    });
    lightbox.querySelector(".lb-next").addEventListener("click", function (e) {
        e.stopPropagation();
        show(current + 1);
    });
    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
        if (!lightbox.classList.contains("open")) return;
        if (e.key === "Escape") close();
        else if (e.key === "ArrowLeft") show(current - 1);
        else if (e.key === "ArrowRight") show(current + 1);
    });
})();

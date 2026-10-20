document$.subscribe(function () {
  var container = document.getElementById("pdf-slideshow");
  if (!container) return;

  var pdfUrl = container.getAttribute("data-pdf");
  var canvas = document.getElementById("pdf-canvas");
  var ctx = canvas.getContext("2d");
  var prevBtn = document.getElementById("pdf-prev");
  var nextBtn = document.getElementById("pdf-next");
  var pageInfo = document.getElementById("pdf-page-info");

  var pdfDoc = null;
  var currentPage = 1;
  var direction = "next";
  var jumpLinks = document.querySelectorAll(".pdf-jump-link");
  var jumpPages = [1, 5, 19, 31, 36, 41];

  function updateJumpActive(num) {
    var active = 0;
    for (var i = 0; i < jumpPages.length; i++) {
      if (num >= jumpPages[i]) active = i;
    }
    jumpLinks.forEach(function (el, i) {
      el.classList.toggle("active", i === active);
    });
  }

  jumpLinks.forEach(function (el) {
    el.addEventListener("click", function () {
      var target = parseInt(el.getAttribute("data-page"));
      direction = target > currentPage ? "next" : "prev";
      currentPage = target;
      renderPage(currentPage);
    });
  });

  function renderPage(num) {
    var outClass = direction === "next" ? "swipe-out-left" : "swipe-out-right";
    var inClass  = direction === "next" ? "swipe-in-left"  : "swipe-in-right";

    canvas.classList.add(outClass);

    setTimeout(function () {
      pdfDoc.getPage(num).then(function (page) {
        var dpr = window.devicePixelRatio || 1;
        var viewport = page.getViewport({ scale: 1 });
        var containerWidth = container.offsetWidth;
        var scale = (containerWidth / viewport.width) * dpr;
        var scaled = page.getViewport({ scale: scale });

        canvas.width = scaled.width;
        canvas.height = scaled.height;
        canvas.style.width = (scaled.width / dpr) + "px";
        canvas.style.height = (scaled.height / dpr) + "px";

        page.render({ canvasContext: ctx, viewport: scaled }).promise.then(function () {
          pageInfo.textContent = "Slide " + num + " of " + pdfDoc.numPages;
          prevBtn.disabled = num <= 1;
          nextBtn.disabled = num >= pdfDoc.numPages;
          updateJumpActive(num);

          // Snap to incoming position without transition, then animate in
          canvas.style.transition = "none";
          canvas.classList.remove(outClass);
          canvas.classList.add(inClass);

          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              canvas.style.transition = "";
              canvas.classList.remove(inClass);
            });
          });
        });
      });
    }, 150);
  }

  prevBtn.addEventListener("click", function () {
    if (currentPage > 1) { direction = "prev"; currentPage--; renderPage(currentPage); }
  });

  nextBtn.addEventListener("click", function () {
    if (currentPage < pdfDoc.numPages) { direction = "next"; currentPage++; renderPage(currentPage); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      if (currentPage < pdfDoc.numPages) { direction = "next"; currentPage++; renderPage(currentPage); }
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      if (currentPage > 1) { direction = "prev"; currentPage--; renderPage(currentPage); }
    }
  });

  var pdfjsLib = window["pdfjs-dist/build/pdf"];
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  pdfjsLib.getDocument(pdfUrl).promise.then(function (pdf) {
    pdfDoc = pdf;
    renderPage(currentPage);
  });
});

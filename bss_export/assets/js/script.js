fetch(new URL("changelog2.html", document.baseURI))
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Could not load changelog2.html: ${response.status}`);
        }

        return response.text();
    })
    .then((html) => {
        const sourceDocument = new DOMParser().parseFromString(html, "text/html");
        const sourceImage = sourceDocument.querySelector(
            'main img[alt="Logs screen"][src^="data:image/"]'
        );
        const changelogImage = document.querySelector(
            'main img[alt="Logs screen"]'
        );

        if (sourceImage && changelogImage) {
            changelogImage.src = sourceImage.getAttribute("src");
        } else {
            console.warn("The original Logs screen image was not found in changelog2.html.");
        }
    })
    .catch((error) => {
        console.warn("Could not restore the Logs screen image:", error);
    });

(() => {
    const preview = document.getElementById("image-preview");
    if (!preview) return;

    const previewImage = preview.querySelector("img");
    const closeButton = preview.querySelector(".image-preview-close");
    let activeImage = null;
    let previousBodyOverflow = "";

    function prepareImage(image) {
        if (preview.contains(image)) return;

        image.classList.add("zoomable-image");

        if (!image.hasAttribute("tabindex")) {
            image.tabIndex = 0;
        }

        image.setAttribute("role", "button");
        image.setAttribute("aria-haspopup", "dialog");

        if (!image.hasAttribute("aria-label")) {
            image.setAttribute("aria-label", `Enlarge ${image.alt || "image"}`);
        }
    }

    function openPreview(image) {
        activeImage = image;
        previewImage.src = image.currentSrc || image.src;
        previewImage.alt = image.alt;
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        preview.hidden = false;
        closeButton.focus();
    }

    function closePreview() {
        if (preview.hidden) return;

        preview.hidden = true;
        document.body.style.overflow = previousBodyOverflow;

        if (activeImage) {
            activeImage.focus();
        }

        activeImage = null;
    }

    document.querySelectorAll("img").forEach(prepareImage);

    document.addEventListener("click", (event) => {
        const image = event.target.closest?.("img");

        if (image && !preview.contains(image)) {
            if (image.closest("a")) {
                event.preventDefault();
            }

            openPreview(image);
        }
    });

    document.addEventListener("keydown", (event) => {
        const image = event.target.closest?.("img");

        if (
            image &&
            !preview.contains(image) &&
            (event.key === "Enter" || event.key === " ")
        ) {
            event.preventDefault();
            openPreview(image);
        }

        if (!preview.hidden && event.key === "Escape") {
            closePreview();
        }

        if (!preview.hidden && event.key === "Tab") {
            event.preventDefault();
            closeButton.focus();
        }
    });

    closeButton.addEventListener("click", closePreview);

    preview.addEventListener("click", (event) => {
        if (event.target === preview) {
            closePreview();
        }
    });

    new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType !== Node.ELEMENT_NODE) return;

                if (node.matches("img")) {
                    prepareImage(node);
                }

                node.querySelectorAll("img").forEach(prepareImage);
            });
        });
    }).observe(document.body, { childList: true, subtree: true });
})();
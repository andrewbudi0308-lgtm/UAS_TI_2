(() => {
    document.body.classList.add("motion-ready");

    const revealElements = document.querySelectorAll(".card, .team-card, .story-card, .mascot-card, .container");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!reducedMotion.matches && revealElements.length > 0) {
        for (const element of revealElements) {
            element.classList.add("scroll-reveal");
        }
        document.body.classList.add("scroll-reveal-ready");

        function revealVisibleElements() {
            revealTimer = 0;
            for (const element of revealElements) {
                if (element.classList.contains("is-visible")) continue;
                const bounds = element.getBoundingClientRect();
                if (bounds.top < window.innerHeight * 0.9 && bounds.bottom > 0) {
                    element.classList.add("is-visible");
                }
            }
        }

        window.addEventListener("scroll", revealVisibleElements, { passive: true });
        window.addEventListener("resize", revealVisibleElements, { passive: true });
        revealVisibleElements();
    } else {
        for (const element of revealElements) {
            element.classList.add("is-visible");
        }
    }

    const canvas = document.getElementById("homepage-stars");
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const context = canvas.getContext("2d");
    if (!context) {
        console.error("Could not initialize the homepage star animation canvas.");
        return;
    }

    const pointer = { x: 0.5, y: 0.5 };
    const stars = [];
    let width = 0;
    let height = 0;
    let frameId = 0;
    let previousFrame = 0;

    function resizeCanvas() {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const count = Math.min(64, Math.max(28, Math.round((width * height) / 26000)));
        stars.length = 0;
        for (let index = 0; index < count; index += 1) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: 0.8 + Math.random() * 1.8,
                vx: (Math.random() - 0.5) * 0.12,
                vy: (Math.random() - 0.5) * 0.12,
                phase: Math.random() * Math.PI * 2,
                color: Math.random() < 0.65 ? "#ffffff" : "#fbffc7"
            });
        }

        drawStars(performance.now(), 0);
    }

    function drawStars(time, frameScale) {
        context.clearRect(0, 0, width, height);
        const pointerX = (pointer.x - 0.5) * 8;
        const pointerY = (pointer.y - 0.5) * 8;

        for (const star of stars) {
            if (!reducedMotion.matches && frameScale > 0) {
                star.x += star.vx * frameScale;
                star.y += star.vy * frameScale;

                if (star.x < -4) star.x = width + 4;
                if (star.x > width + 4) star.x = -4;
                if (star.y < -4) star.y = height + 4;
                if (star.y > height + 4) star.y = -4;
            }

            const alpha = reducedMotion.matches
                ? 0.3
                : 0.16 + (Math.sin(time * 0.0015 + star.phase) + 1) * 0.17;
            const parallax = star.radius / 2.6;
            const x = star.x - pointerX * parallax;
            const y = star.y - pointerY * parallax;

            context.globalAlpha = alpha;
            context.fillStyle = star.color;
            context.shadowColor = star.color;
            context.shadowBlur = star.radius * 3;
            context.beginPath();
            context.arc(x, y, star.radius, 0, Math.PI * 2);
            context.fill();

            if (star.radius > 1.8) {
                context.globalAlpha = alpha * 0.5;
                context.fillRect(x - 0.5, y - star.radius * 2.5, 1, star.radius * 5);
                context.fillRect(x - star.radius * 2.5, y - 0.5, star.radius * 5, 1);
            }
        }

        context.globalAlpha = 1;
        context.shadowBlur = 0;
    }

    function animate(time) {
        if (document.visibilityState === "hidden") {
            frameId = 0;
            return;
        }

        const frameScale = previousFrame ? Math.min((time - previousFrame) / 16.67, 2) : 0;
        previousFrame = time;
        drawStars(time, frameScale);
        frameId = window.requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (frameId) window.cancelAnimationFrame(frameId);
        previousFrame = 0;
        if (reducedMotion.matches) {
            drawStars(performance.now(), 0);
            frameId = 0;
            return;
        }
        frameId = window.requestAnimationFrame(animate);
    }

    canvas.setAttribute("aria-hidden", "true");
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("pointermove", (event) => {
        pointer.x = event.clientX / Math.max(width, 1);
        pointer.y = event.clientY / Math.max(height, 1);
    }, { passive: true });
    document.addEventListener("visibilitychange", startAnimation);
    reducedMotion.addEventListener("change", startAnimation);

    resizeCanvas();
    startAnimation();
})();

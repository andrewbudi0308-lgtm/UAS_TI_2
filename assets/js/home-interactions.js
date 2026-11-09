(() => {
    document.body.classList.add("motion-ready");

    const navigation = document.querySelector(".site-nav");
    const navigationPill = navigation?.querySelector(".nav-pill");
    const activeNavigationLink = navigation?.querySelector('a[aria-current="page"]');

    if (navigation && navigationPill && activeNavigationLink) {
        function positionNavigationPill() {
            const navBounds = navigation.getBoundingClientRect();
            const linkBounds = activeNavigationLink.getBoundingClientRect();
            const pillBounds = navigationPill.getBoundingClientRect();
            const x = linkBounds.left - navBounds.left + (linkBounds.width - pillBounds.width) / 2;
            const y = linkBounds.top - navBounds.top + (linkBounds.height - pillBounds.height) / 2;
            navigationPill.style.transform = `translate(${x}px, ${y}px)`;
        }

        positionNavigationPill();
        window.addEventListener("resize", positionNavigationPill, { passive: true });
    }

    const revealElements = document.querySelectorAll(".card, .team-card, .story-card, .mascot-card, .container");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    document.addEventListener("click", (event) => {
        if (reducedMotion.matches) return;

        const target = event.target instanceof Element ? event.target : null;
        const shape = target?.closest("a, button, .card, .team-card, .story-card, .mascot-card, [role='button']");
        const bounds = shape?.getBoundingClientRect();
        const centerX = event.detail === 0 && bounds ? bounds.left + bounds.width / 2 : event.clientX;
        const centerY = event.detail === 0 && bounds ? bounds.top + bounds.height / 2 : event.clientY;
        const width = bounds?.width ?? 18;
        const height = bounds?.height ?? 18;
        const colors = ["#ffffff", "#ffdf57", "#ff1fa9", "#ffffff", "#ffdf57", "#ff1fa9", "#ffffff", "#ffdf57"];

        colors.forEach((color) => {
            const angle = Math.random() * Math.PI * 2;
            const horizontalEdge = Math.abs(Math.cos(angle) * height) > Math.abs(Math.sin(angle) * width);
            const edgeOffset = Math.random() - 0.5;
            const x = centerX + (horizontalEdge ? Math.sign(Math.cos(angle)) * width / 2 : edgeOffset * width);
            const y = centerY + (horizontalEdge ? edgeOffset * height : Math.sign(Math.sin(angle)) * height / 2);
            const distance = 12 + Math.random() * 14;
            const sparkle = document.createElement("span");
            sparkle.className = "click-sparkle";
            sparkle.setAttribute("aria-hidden", "true");
            sparkle.textContent = "✦";
            sparkle.style.left = `${x}px`;
            sparkle.style.top = `${y}px`;
            sparkle.style.setProperty("--spark-x", `${Math.cos(angle) * distance}px`);
            sparkle.style.setProperty("--spark-y", `${Math.sin(angle) * distance}px`);
            sparkle.style.setProperty("--spark-color", color);
            sparkle.addEventListener("animationend", () => sparkle.remove(), { once: true });
            document.body.append(sparkle);
        });
    });

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

        const count = Math.min(84, Math.max(36, Math.round((width * height) / 20000)));
        const edge = Math.max(64, Math.min(Math.min(width, height) * 0.22, 180));
        stars.length = 0;
        for (let index = 0; index < count; index += 1) {
            const side = ["top", "right", "bottom", "left"][Math.floor(Math.random() * 4)];
            let x;
            let y;

            if (side === "top") {
                x = Math.random() * width * 1.1 - width * 0.05;
                y = Math.random() * edge;
            } else if (side === "right") {
                x = width - edge + Math.random() * edge;
                y = Math.random() * height * 1.1 - height * 0.05;
            } else if (side === "bottom") {
                x = Math.random() * width * 1.1 - width * 0.05;
                y = height - edge + Math.random() * edge;
            } else {
                x = Math.random() * edge;
                y = Math.random() * height * 1.1 - height * 0.05;
            }

            const isDecorativeStar = Math.random() < 0.12;
            stars.push({
                x,
                y,
                side,
                radius: isDecorativeStar ? 5 + Math.random() * 3 : 1.4 + Math.random() * 2.4,
                isDecorativeStar,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1,
                phase: Math.random() * Math.PI * 2,
                color: ["#ff1fa9", "#2563eb", "#ffdf57"][Math.floor(Math.random() * 3)]
            });
        }

        drawStars(performance.now(), 0);
    }

    function drawStars(time, frameScale) {
        context.clearRect(0, 0, width, height);
        const pointerX = (pointer.x - 0.5) * 8;
        const pointerY = (pointer.y - 0.5) * 8;
        const edge = Math.max(64, Math.min(Math.min(width, height) * 0.22, 180));

        for (const star of stars) {
            if (!reducedMotion.matches && frameScale > 0) {
                star.x += star.vx * frameScale;
                star.y += star.vy * frameScale;

                const minX = star.side === "left" ? 0 : star.side === "right" ? width - edge : 0;
                const maxX = star.side === "left" ? edge : width;
                const minY = star.side === "top" ? 0 : star.side === "bottom" ? height - edge : 0;
                const maxY = star.side === "top" ? edge : height;

                if (star.x < minX || star.x > maxX) star.vx *= -1;
                if (star.y < minY || star.y > maxY) star.vy *= -1;
                star.x = Math.max(minX, Math.min(maxX, star.x));
                star.y = Math.max(minY, Math.min(maxY, star.y));
            }

            const alpha = reducedMotion.matches
                ? 0.65
                : 0.38 + (Math.sin(time * 0.0015 + star.phase) + 1) * 0.22;
            const parallax = star.radius / 2.6;
            const x = star.x - pointerX * parallax;
            const y = star.y - pointerY * parallax;

            context.globalAlpha = alpha;
            context.fillStyle = star.color;
            context.shadowColor = star.color;
            context.shadowBlur = star.radius * 5;
            context.beginPath();
            if (star.isDecorativeStar) {
                for (let point = 0; point < 8; point += 1) {
                    const angle = (point * Math.PI) / 4 - Math.PI / 2 + star.phase * 0.04;
                    const radius = point % 2 === 0 ? star.radius : star.radius * 0.28;
                    const pointX = x + Math.cos(angle) * radius;
                    const pointY = y + Math.sin(angle) * radius;
                    if (point === 0) context.moveTo(pointX, pointY);
                    else context.lineTo(pointX, pointY);
                }
                context.closePath();
            } else {
                context.arc(x, y, star.radius, 0, Math.PI * 2);
            }
            context.fill();

            if (star.radius > 1.8 && !star.isDecorativeStar) {
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

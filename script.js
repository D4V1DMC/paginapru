document.addEventListener("DOMContentLoaded", () => {

    // --- Reproducción automática al primer click ---
    document.addEventListener("click", function () {
        const audio = document.getElementById("bg-music");
        if (audio && audio.paused) {
            audio.play().catch(() => {});
        }
    }, { once: true }); // solo al primer click

    // --- Botón de música ---
    const audio = document.getElementById("bg-music");
    const btn = document.getElementById("music-toggle");

    btn.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            btn.textContent = "⏸ Pausar";
        } else {
            audio.pause();
            btn.textContent = "▶ Música";
        }
    });

    // --- Función para mostrar "pi" tipo karaoke ---
    function showPi(text, startTime, duration) {
        const piEl = document.createElement("div");
        piEl.textContent = text;
        piEl.className = "pi-floating";
        piEl.style.position = "absolute";
        piEl.style.top = "50%";
        piEl.style.left = "50%";
        piEl.style.transform = "translate(-50%, -50%)";
        piEl.style.fontSize = "60px";
        piEl.style.color = "#5bb8ff";
        piEl.style.opacity = "0";
        piEl.style.transition = "opacity 0.3s ease, transform 0.3s ease";

        document.body.appendChild(piEl);

        const checkTime = () => {
            if (audio.currentTime >= startTime) {
                piEl.style.opacity = "1";
                piEl.style.transform = "translate(-50%, -50%) scale(1.2)";

                setTimeout(() => {
                    piEl.style.opacity = "0";
                    piEl.style.transform = "translate(-50%, -50%) scale(1)";
                    setTimeout(() => piEl.remove(), 300);
                }, duration * 1000);

                audio.removeEventListener("timeupdate", checkTime);
            }
        };

        audio.addEventListener("timeupdate", checkTime);
    }

    // Frutas interactivas
    const fruits = document.querySelectorAll(".floating");

    fruits.forEach(fruit => {
        fruit.addEventListener("mouseover", () => {
            fruit.textContent = "💥";
            setTimeout(() => {
                if (fruit.classList.contains("fruit1")) fruit.textContent = "🍓";
                if (fruit.classList.contains("fruit2")) fruit.textContent = "🍑";
                if (fruit.classList.contains("fruit3")) fruit.textContent = "🍉";
            }, 1000);
        });
    });

    // Easter egg icon
    const icon = document.querySelector(".icon");
    let heartClicks = 0;

    const heartMessages = {
        5: "¡5 clicks! Curiosa usted 😄💙",
        10: "¡10 clicks! Persistente 😎💙",
        30: "¡30 clicks! ¿Cansada? 💖",
        50: "¡50 clicks! ¡Ya, no hay mas! 💖",
        100: "¡100 clicks! Que terca!",
        150: "¡150 clicks! Ya en serio 💙",
        200: "¡Ups! Sé que a veces desaparezco… pero gracias por seguir jugando conmigo y aguantandome y ahora sí esto era lo último 💙"
    };

    icon.addEventListener("click", () => {
        heartClicks++;

        if (heartMessages[heartClicks]) {
            showHeartMessage(heartMessages[heartClicks]);
        }
        if (heartClicks >= 300) heartClicks = 0;
    });

    function showHeartMessage(msg) {
        const bubble = document.createElement("div");
        bubble.textContent = msg;
        bubble.style.position = "fixed";
        bubble.style.top = "40%";
        bubble.style.left = "50%";
        bubble.style.transform = "translate(-50%, -50%) scale(0.8)";
        bubble.style.padding = "15px 25px";
        bubble.style.background = "#5bb8ff";
        bubble.style.color = "white";
        bubble.style.borderRadius = "12px";
        bubble.style.fontWeight = "bold";
        bubble.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
        bubble.style.opacity = "0";
        bubble.style.transition = "all 0.5s ease";

        document.body.appendChild(bubble);

        setTimeout(() => {
            bubble.style.opacity = "1";
            bubble.style.transform = "translate(-50%, -50%) scale(1)";
        }, 50);

        setTimeout(() => {
            bubble.style.opacity = "0";
            bubble.style.transform = "translate(-50%, -50%) scale(0.8)";
            setTimeout(() => bubble.remove(), 500);
        }, 3000);
    }

    // --- Todos los "pi" ---
    showPi("'pi'", 51, 0.5);
    showPi("'pi'", 51.5, 0.5);
    showPi("'pi'", 52, 0.5);
    showPi("'pi'", 52.5, 0.3);

    showPi("'pi'", 67, 0.5);
    showPi("'pi'", 67.5, 0.5);
    showPi("'pi'", 68, 0.5);
    showPi("'pi'", 68.5, 0.3);

    showPi("'pi'", 116.5, 0.5);
    showPi("'pi'", 117, 0.5);
    showPi("'pi'", 117.5, 0.5);
    showPi("'pi'", 118, 0.3);

    showPi("'pi'", 133, 0.5);
    showPi("'pi'", 133.5, 0.5);
    showPi("'pi'", 134, 0.5);
    showPi("'pi'", 134.5, 0.3);

    showPi("'pi'", 166, 0.5);
    showPi("'pi'", 166.5, 0.5);
    showPi("'pi'", 167, 0.5);
    showPi("'pi'", 167.5, 0.3);

});

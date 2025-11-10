(() => {
    const track = document.getElementById('slider-track');
    if (!track) return;

    // ★ 追加：スライダー幅（px）を毎回取得
    const slider = document.querySelector('.slider');
    const cw = () => slider?.clientWidth || 0;

    const slides = Array.from(track.children);
    const dotsWrap = document.getElementById('slider-dots');

    let index = 0;
    const length = slides.length;

    // ドット生成
    slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `画像 ${i + 1}`);
        b.addEventListener('click', () => goto(i));
        dotsWrap.appendChild(b);
    });

    const dots = Array.from(dotsWrap.children);

    function update() {
        // ★ 変更：%ではなく px で移動
        track.style.transform = `translateX(${-index * cw()}px)`;
        dots.forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
    }

    function goto(i) {
        index = (i + length) % length;
        update();
    }

    // 矢印
    document.querySelector('.prev')?.addEventListener('click', () => goto(index - 1));
    document.querySelector('.next')?.addEventListener('click', () => goto(index + 1));

    // キーボード
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goto(index - 1);
        if (e.key === 'ArrowRight') goto(index + 1);
    });

    // ドラッグ / スワイプ
    let startX = 0, dragging = false;
    const onStart = (x) => { startX = x; dragging = true; };
    const onMove = (x) => {
        if (!dragging) return;
        const delta = x - startX;
        // ★ 変更：現在位置（px）＋ドラッグ量（px）
        track.style.transform = `translateX(${(-index * cw()) + delta}px)`;
    };
    const onEnd = (x) => {
        if (!dragging) return;
        const delta = x - startX;
        dragging = false;
        if (Math.abs(delta) > 60) {
            goto(index + (delta < 0 ? 1 : -1));
        } else {
            update(); // 戻す
        }
    };

    track.addEventListener('pointerdown', (e) => { track.setPointerCapture(e.pointerId); onStart(e.clientX); });
    track.addEventListener('pointermove', (e) => onMove(e.clientX));
    track.addEventListener('pointerup', (e) => onEnd(e.clientX));
    track.addEventListener('pointercancel', (e) => onEnd(e.clientX));

    // ★ 追加：リサイズ時も位置再計算
    window.addEventListener('resize', update);

    // 初期表示
    update();
})();

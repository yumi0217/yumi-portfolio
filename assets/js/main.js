document.addEventListener('DOMContentLoaded', () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const links = document.querySelectorAll('.jelly-link');

    // pop アニメを確実にリスタート
    const restartPop = (el) => {
        el.classList.remove('pop');
        // Reflow でアニメ再適用を保証
        // eslint-disable-next-line no-unused-expressions
        el.offsetWidth;
        el.classList.add('pop');
        el.addEventListener('animationend', () => el.classList.remove('pop'), { once: true });
    };

    // クリック位置から小さな泡を飛ばす
    const spawnBubbles = (el, ev) => {
        if (prefersReduced) return; // 省モーションなら泡は出さない

        const rect = el.getBoundingClientRect();
        // pointer/click どちらでも座標が取れるように
        const cx = (ev && typeof ev.clientX === 'number') ? ev.clientX : rect.left + rect.width / 2;
        const cy = (ev && typeof ev.clientY === 'number') ? ev.clientY : rect.top + rect.height / 2;

        const x = ((cx - rect.left) / rect.width) * 100;
        const y = ((cy - rect.top) / rect.height) * 100;

        const count = 3;
        for (let i = 0; i < count; i++) {
            const b = document.createElement('span');
            b.className = 'bubble';
            // 左右にランダムドリフト
            b.style.setProperty('--bx', (Math.random() * 22 - 11) + 'px');
            // 生成位置（%）に配置
            b.style.left = x + '%';
            b.style.top = y + '%';
            el.appendChild(b);
            b.addEventListener('animationend', () => b.remove(), { once: true });
        }
    };

    // 入力系ハンドラ（pointer → すぐ反応／keyboard → アクセシブル）
    links.forEach((link) => {
        // マウス/タップ即反応
        link.addEventListener('pointerdown', (e) => {
            restartPop(link);
            spawnBubbles(link, e);
        }, { passive: true });

        // クリックのみで使いたい場合にも対応（保険）
        link.addEventListener('click', (e) => {
            restartPop(link);
            spawnBubbles(link, e);
        });

        // Enter / Space で弾ける
        link.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            restartPop(link);
            spawnBubbles(link, null);
        });
    });
    // ==== 水泡生成（CSSアニメ任せ／毎フレーム処理なし） ====
    (function () {
        const layer = document.querySelector('.bubble-layer');
        if (!layer) return;

        // 画面面積に応じて泡の個数を決める（目安）
        const countForArea = () => {
            const area = window.innerWidth * window.innerHeight;
            // 目安: フルHDで ~32 個。小画面は減らし、大画面は増やす。
            return Math.round(Math.min(60, Math.max(18, area / 120000)));
        };

        let current = 0;

        const spawn = (n) => {
            const frag = document.createDocumentFragment();
            for (let i = 0; i < n; i++) {
                const b = document.createElement('div');
                b.className = 'bubble';

                // ランダムパラメータ
                const size = Math.random() * 18 + 6;                // 6–24px
                const left = (Math.random() * 100).toFixed(2) + '%';  // 0–100%
                const dur = (Math.random() * 10 + 10).toFixed(2) + 's'; // 10–20s
                const delay = (Math.random() * 20).toFixed(2) + 's';   // 0–20s
                const dx = (Math.random() * 40 - 20).toFixed(1) + 'px'; // -20–20px
                const scale = (Math.random() * 0.8 + 0.8).toFixed(2);  // 0.8–1.6

                b.style.setProperty('--size', size + 'px');
                b.style.setProperty('--left', left);
                b.style.setProperty('--duration', dur);
                b.style.setProperty('--delay', delay);
                b.style.setProperty('--dx', dx);
                b.style.setProperty('--scale', scale);

                frag.appendChild(b);
            }
            layer.appendChild(frag);
            current += n;
        };

        const tune = () => {
            const target = countForArea();
            if (target > current) {
                spawn(target - current);
            } else if (target < current) {
                // 余った分を間引き（先頭から単純に削除）
                const removeN = current - target;
                for (let i = 0; i < removeN; i++) {
                    const el = layer.firstElementChild;
                    if (!el) break;
                    el.remove();
                }
                current = target;
            }
        };

        // 初期生成
        tune();

        // 画面サイズが大きく変わったら個数だけ調整
        let to;
        window.addEventListener('resize', () => {
            clearTimeout(to);
            to = setTimeout(tune, 200);
        }, { passive: true });
    })();


});

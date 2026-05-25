'use client';

import { useEffect } from 'react';

export default function LandingInteractivity() {
  useEffect(() => {
    const faqItems = document.querySelectorAll('.landing-page .faq-item');
    const faqHandlers: Array<{ el: Element; fn: () => void }> = [];

    faqItems.forEach((it) => {
      const fn = () => it.classList.toggle('open');
      it.addEventListener('click', fn);
      faqHandlers.push({ el: it, fn });
    });

    const sw = document.getElementById('bill-switch');
    const labels = document.querySelectorAll('.landing-page .t-label');
    const proPrice = document.getElementById('pro-price') as HTMLElement | null;

    const onSwitchClick = () => {
      if (!sw || !proPrice) return;
      sw.classList.toggle('on');
      const yearly = sw.classList.contains('on');
      labels[0]?.classList.toggle('active', !yearly);
      labels[1]?.classList.toggle('active', yearly);
      proPrice.textContent = yearly
        ? proPrice.dataset.yearly ?? '$9'
        : proPrice.dataset.monthly ?? '$12';
    };

    sw?.addEventListener('click', onSwitchClick);

    return () => {
      faqHandlers.forEach(({ el, fn }) => el.removeEventListener('click', fn));
      sw?.removeEventListener('click', onSwitchClick);
    };
  }, []);

  return null;
}

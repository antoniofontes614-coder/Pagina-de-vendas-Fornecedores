/* ==========================================================================
   FORNECEDORES TOP BRÁS — SCRIPT DA PÁGINA DE VENDAS (MOBILE FIRST)
   Funcionalidades: FAQ Accordion, Sticky CTA Bar, Checkout & Meta Pixel Events
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 1. FAQ ACCORDION (INTERATIVO & ACESSÍVEL)
  // ------------------------------------------------------------------------
  const faqCards = document.querySelectorAll('.faq-card');
  faqCards.forEach(card => {
    const trigger = card.querySelector('.faq-trigger');
    const content = card.querySelector('.faq-content');
    
    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = card.classList.contains('open');

        // Fecha os outros para leitura compacta
        faqCards.forEach(other => {
          if (other !== card && other.classList.contains('open')) {
            other.classList.remove('open');
            const otherContent = other.querySelector('.faq-content');
            if (otherContent) otherContent.style.maxHeight = null;
          }
        });

        if (isOpen) {
          card.classList.remove('open');
          content.style.maxHeight = null;
        } else {
          card.classList.add('open');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });

  // ------------------------------------------------------------------------
  // 2. STICKY CTA BAR (SURGE APÓS A PRIMEIRA DOBRA NO MOBILE)
  // ------------------------------------------------------------------------
  const stickyCtaBar = document.getElementById('stickyCtaBar');
  const heroSection = document.querySelector('.hero');
  const offerSection = document.getElementById('oferta');

  function handleScroll() {
    if (!stickyCtaBar) return;
    const scrollY = window.scrollY || window.pageYOffset;
    const heroHeight = heroSection ? heroSection.offsetHeight : 450;
    
    let isPastHero = scrollY > (heroHeight * 0.65);
    let isInOffer = false;

    if (offerSection) {
      const rect = offerSection.getBoundingClientRect();
      if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        isInOffer = true;
      }
    }

    if (isPastHero && !isInOffer) {
      stickyCtaBar.classList.add('visible');
    } else {
      stickyCtaBar.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ------------------------------------------------------------------------
  // 3. CHECKOUT CTAs & META PIXEL INITIATECHECKOUT (INICIALIZAÇÃO DE COMPRA)
  // ------------------------------------------------------------------------
  const CAKTO_CHECKOUT_URL = 'https://pay.cakto.com.br/dega2d9_1273419';
  const checkoutButtons = document.querySelectorAll('.btn-checkout');

  checkoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href');

      // Se for link de âncora interna (ex: #oferta), deixa rolar suavemente
      if (href && href.startsWith('#')) {
        return;
      }

      e.preventDefault();
      const targetUrl = href || CAKTO_CHECKOUT_URL;

      // Dispara evento padrão InitiateCheckout no Meta Pixel
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'InitiateCheckout', {
          content_name: 'Fornecedores Top Brás',
          content_category: 'Guia Digital',
          content_ids: ['top-bras-2990'],
          content_type: 'product',
          value: 29.90,
          currency: 'BRL',
          num_items: 1
        });
      }

      // Redireciona com tempo de segurança para a requisição de rede do Pixel disparar
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 180);
    });
  });

  // ------------------------------------------------------------------------
  // 4. META PIXEL VIEWCONTENT (AO VISUALIZAR A OFERTA OU O GUIA DO BRÁS)
  // ------------------------------------------------------------------------
  if (offerSection && 'IntersectionObserver' in window) {
    let viewContentFired = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !viewContentFired) {
          viewContentFired = true;
          if (typeof window.fbq === 'function') {
            window.fbq('track', 'ViewContent', {
              content_name: 'Oferta Fornecedores Top Brás',
              content_category: 'Guia Digital',
              content_ids: ['top-bras-2990'],
              content_type: 'product',
              value: 29.90,
              currency: 'BRL'
            });
          }
        }
      });
    }, { threshold: 0.25 });
    observer.observe(offerSection);
  }

  const cardGuia = document.getElementById('catCardGuia');
  if (cardGuia) {
    cardGuia.addEventListener('click', (e) => {
      e.preventDefault();

      if (typeof window.fbq === 'function') {
        window.fbq('track', 'ViewContent', {
          content_name: 'Guia do Brás',
          content_category: 'Roteiro e Polos'
        });
      }

      const guiaSection = document.getElementById('guia-do-bras');
      if (guiaSection) {
        guiaSection.scrollIntoView({ behavior: 'smooth' });
        guiaSection.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
        guiaSection.style.boxShadow = '0 0 30px rgba(244, 185, 66, 0.4)';
        guiaSection.style.borderColor = 'rgba(244, 185, 66, 0.8)';
        setTimeout(() => {
          guiaSection.style.boxShadow = '';
          guiaSection.style.borderColor = '';
        }, 2000);
      }
    });
  }

  // ------------------------------------------------------------------------
  // 5. META PIXEL PURCHASE (DISPARO AUTOMÁTICO DE COMPRA SE RETORNAR VIA URL)
  // ------------------------------------------------------------------------
  function checkPurchaseFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const isPurchase = params.has('compra') || 
                         params.get('status') === 'approved' || 
                         params.get('status') === 'paid' || 
                         params.get('status') === 'completed' || 
                         params.has('purchase') || 
                         params.has('sucesso') || 
                         params.has('obrigado');

      if (isPurchase) {
        const alreadyTracked = sessionStorage.getItem('meta_purchase_tracked');
        if (!alreadyTracked && typeof window.fbq === 'function') {
          window.fbq('track', 'Purchase', {
            content_name: 'Fornecedores Top Brás',
            content_category: 'Guia Digital',
            content_ids: ['top-bras-2990'],
            content_type: 'product',
            value: 29.90,
            currency: 'BRL',
            num_items: 1
          });
          sessionStorage.setItem('meta_purchase_tracked', 'true');
        }

        if (typeof window.showToast === 'function') {
          window.showToast('🎉 Pagamento confirmado com sucesso! Bem-vindo(a)!');
        }
      }
    } catch (err) {}
  }
  checkPurchaseFromUrl();

  // ------------------------------------------------------------------------
  // 6. TOAST NOTIFICATION
  // ------------------------------------------------------------------------
  let toastTimeout = null;
  window.showToast = function(msg) {
    let toast = document.getElementById('toastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  };
});

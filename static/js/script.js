// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let activeDropdown = null;
let currentSlideIndex = 0;
let totalSlides = 0;
let gallerySlider = null;

let projectCarousels = {
    repair: { index: 0, total: 3, initialized: false, carousel: null },
    dev: { index: 0, total: 3, initialized: false, carousel: null }
};

let calcCarouselPhotos = [];
let calcCarouselIndex = 0;


// ===== КАЛЬКУЛЯТОР УСЛУГ (СЕКЦИЯ "УСЛУГИ") =====
function formatPrice(price) {
    return Math.round(price).toLocaleString('ru-RU') + ' ₽';
}

function updateCalcTotal() {
    let total = 0;
    document.querySelectorAll('.calc-service-item.selected input[type="checkbox"]').forEach(cb => {
        total += parseInt(cb.getAttribute('data-price') || 0);
    });
    const totalPriceEl = document.getElementById('totalPrice');
    if (totalPriceEl) totalPriceEl.textContent = formatPrice(total);
    updateCalcCarousel();
}

// Карусель фото выбранных услуг в блоке "Ваш заказ".
// Показывается только когда выбрана хотя бы одна услуга с фото (data-image),
// при снятии галочки фото сразу пропадает из карусели.
function updateCalcCarousel() {
    const container = document.getElementById('calcPhotoCarousel');
    const track = document.getElementById('calcCarouselTrack');
    if (!container || !track) return;

    calcCarouselPhotos = [];
    document.querySelectorAll('.calc-service-item.selected input[type="checkbox"]').forEach(cb => {
        const src = cb.getAttribute('data-image');
        if (!src) return;
        const label = cb.closest('.calc-service-item');
        const name = label?.querySelector('.calc-service-name')?.textContent?.trim() || '';
        calcCarouselPhotos.push({ src, name });
    });

    if (calcCarouselPhotos.length === 0) {
        container.style.display = 'none';
        track.innerHTML = '';
        calcCarouselIndex = 0;
        return;
    }

    container.style.display = 'block';
    if (calcCarouselIndex >= calcCarouselPhotos.length) {
        calcCarouselIndex = calcCarouselPhotos.length - 1;
    }

    track.innerHTML = calcCarouselPhotos.map(photo => `
        <div class="calc-carousel-slide">
            <img src="${photo.src}" alt="${photo.name}" onerror="this.closest('.calc-carousel-slide').style.display='none'">
            <span class="calc-carousel-caption">${photo.name}</span>
        </div>
    `).join('');

    updateCalcCarouselPosition();
}

function updateCalcCarouselPosition() {
    const track = document.getElementById('calcCarouselTrack');
    const counter = document.getElementById('calcCarouselCounter');
    if (track) track.style.transform = `translateX(${-calcCarouselIndex * 100}%)`;
    if (counter && calcCarouselPhotos.length > 0) {
        counter.textContent = `${calcCarouselIndex + 1} / ${calcCarouselPhotos.length}`;
    }
}

function calcCarouselPrev() {
    if (calcCarouselPhotos.length === 0) return;
    calcCarouselIndex = (calcCarouselIndex - 1 + calcCarouselPhotos.length) % calcCarouselPhotos.length;
    updateCalcCarouselPosition();
}

function calcCarouselNext() {
    if (calcCarouselPhotos.length === 0) return;
    calcCarouselIndex = (calcCarouselIndex + 1) % calcCarouselPhotos.length;
    updateCalcCarouselPosition();
}

function toggleCalcAccordion(titleEl) {
    const body = titleEl.nextElementSibling;
    const isOpen = titleEl.classList.contains('open');

    document.querySelectorAll('.calc-accordion-title.open').forEach(t => {
        if (t !== titleEl) {
            t.classList.remove('open');
            if (t.nextElementSibling) t.nextElementSibling.classList.remove('open');
        }
    });

    titleEl.classList.toggle('open', !isOpen);
    if (body) body.classList.toggle('open', !isOpen);
}

function resetAllSelections() {
    document.querySelectorAll('.calc-service-item').forEach(item => {
        item.classList.remove('selected');
        const cb = item.querySelector('input[type="checkbox"]');
        if (cb) cb.checked = false;
    });
    updateCalcTotal();
}

function submitAllServices() {
    let message = 'ВЫБРАННЫЕ УСЛУГИ:\n\n';
    let hasServices = false;

    const repairItems = document.querySelectorAll('.calc-service-item.selected .repair-checkbox');
    if (repairItems.length > 0) {
        message += 'РЕМОНТ ТЕХНИКИ:\n';
        repairItems.forEach(cb => {
            const label = cb.closest('.calc-service-item');
            const name = label?.querySelector('.calc-service-name')?.textContent?.trim() || 'Услуга';
            const price = label?.querySelector('.calc-service-price')?.textContent?.trim() || '';
            message += `• ${name} — ${price}\n`;
            hasServices = true;
        });
        message += '\n';
    }

    const devItems = document.querySelectorAll('.calc-service-item.selected .dev-checkbox');
    if (devItems.length > 0) {
        message += 'РАЗРАБОТКА И ДИЗАЙН:\n';
        devItems.forEach(cb => {
            const label = cb.closest('.calc-service-item');
            const name = label?.querySelector('.calc-service-name')?.textContent?.trim() || 'Услуга';
            const price = label?.querySelector('.calc-service-price')?.textContent?.trim() || '';
            message += `• ${name} — ${price}\n`;
            hasServices = true;
        });
        message += '\n';
    }

    if (!hasServices) {
        alert('Пожалуйста, выберите хотя бы одну услугу.');
        return;
    }

    const totalPrice = document.getElementById('totalPrice')?.textContent || '0 ₽';
    message += `ИТОГОВАЯ СТОИМОСТЬ: ${totalPrice}`;

    alert(message);
}

function initCalculator() {
    console.log('Инициализация калькулятора...');

    document.querySelectorAll('.calc-service-item').forEach(item => {
        const cb = item.querySelector('input[type="checkbox"]');
        if (!cb) return;

        item.addEventListener('click', function(e) {
            if (e.target === cb) return;
            e.preventDefault();
            cb.checked = !cb.checked;
            item.classList.toggle('selected', cb.checked);
            updateCalcTotal();
        });

        cb.addEventListener('change', function() {
            item.classList.toggle('selected', this.checked);
            updateCalcTotal();
        });
    });

    updateCalcTotal();
    console.log('✅ Калькулятор инициализирован');
}


// ===== ГАЛЕРЕЯ МАСТЕРСКОЙ (СЕКЦИЯ "НАША МАСТЕРСКАЯ") =====
function initGalleryCarousel() {
    gallerySlider = document.getElementById('gallerySlider');
    if (!gallerySlider) {
        console.warn('Элемент #gallerySlider не найден');
        return false;
    }

    const slides = document.querySelectorAll('.gallery-slide');
    totalSlides = slides.length;

    if (totalSlides === 0) {
        console.warn('Нет слайдов в галерее');
        return false;
    }

    updateGalleryDots();
    console.log(`✅ Галерея инициализирована, слайдов: ${totalSlides}`);
    return true;
}

function updateGallerySlider() {
    if (!gallerySlider) return;
    const translateValue = -currentSlideIndex * 100;
    gallerySlider.style.transform = `translateX(${translateValue}%)`;
    updateGalleryDots();
}

function updateGalleryDots() {
    const dots = document.querySelectorAll('.gallery-dot');
    dots.forEach((dot, index) => {
        if (index === currentSlideIndex) {
            dot.style.background = '#000';
            dot.style.transform = 'scale(1.2)';
        } else {
            dot.style.background = '#ccc';
            dot.style.transform = 'scale(1)';
        }
    });
}

function galleryPrevSlide() {
    if (totalSlides === 0) return;
    currentSlideIndex--;
    if (currentSlideIndex < 0) currentSlideIndex = totalSlides - 1;
    updateGallerySlider();
    console.log(`⬅️ Слайд ${currentSlideIndex + 1} из ${totalSlides}`);
}

function galleryNextSlide() {
    if (totalSlides === 0) return;
    currentSlideIndex++;
    if (currentSlideIndex >= totalSlides) currentSlideIndex = 0;
    updateGallerySlider();
    console.log(`➡️ Слайд ${currentSlideIndex + 1} из ${totalSlides}`);
}

function galleryGoToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    currentSlideIndex = index;
    updateGallerySlider();
    console.log(`🎯 Переход к слайду ${index + 1}`);
}


// ===== КАРУСЕЛЬ "СФЕРЫ ДЕЯТЕЛЬНОСТИ" (РЕМОНТ / РАЗРАБОТКА) =====
function initProjectCarousel(type) {
    const carousel = document.getElementById(`${type}Carousel`);
    if (!carousel) {
        console.warn(`Карусель ${type}Carousel не найдена`);
        return false;
    }

    const slides = carousel.querySelectorAll('.works-slide');
    const totalSlidesCount = slides.length;

    if (totalSlidesCount === 0) {
        console.warn(`В карусели ${type} нет слайдов`);
        return false;
    }

    projectCarousels[type].carousel = carousel;
    projectCarousels[type].total = totalSlidesCount;
    projectCarousels[type].initialized = true;

    const dotsContainer = document.getElementById(`${type}Dots`);
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlidesCount; i++) {
            const dot = document.createElement('span');
            dot.className = 'carousel-dot';
            if (i === projectCarousels[type].index) dot.classList.add('active');
            dot.onclick = (function(idx) {
                return function() { goToProjectSlide(type, idx); };
            })(i);
            dotsContainer.appendChild(dot);
        }
    }

    updateProjectCarousel(type);
    console.log(`✅ Карусель ${type} инициализирована, слайдов: ${totalSlidesCount}`);
    return true;
}

function updateProjectCarousel(type) {
    const state = projectCarousels[type];
    if (!state.initialized || !state.carousel) return;

    const translateValue = -state.index * 100;
    state.carousel.style.transform = `translateX(${translateValue}%)`;

    const dots = document.querySelectorAll(`#${type}Dots .carousel-dot`);
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === state.index);
    });
}

function slideProjectCarousel(type, direction) {
    const state = projectCarousels[type];
    if (!state.initialized) {
        if (!initProjectCarousel(type)) return;
    }

    if (direction === 'prev') {
        state.index = (state.index - 1 + state.total) % state.total;
    } else {
        state.index = (state.index + 1) % state.total;
    }

    updateProjectCarousel(type);
    console.log(`🔄 Карусель ${type}: слайд ${state.index + 1} из ${state.total}`);
}

function goToProjectSlide(type, index) {
    const state = projectCarousels[type];
    if (!state.initialized) {
        if (!initProjectCarousel(type)) return;
    }

    if (index >= 0 && index < state.total) {
        state.index = index;
        updateProjectCarousel(type);
        console.log(`🎯 Карусель ${type}: переход к слайду ${index + 1}`);
    }
}


function showWorksTab(tabName) {
    console.log('showWorksTab вызван с параметром:', tabName);

    const repairWorks = document.getElementById('repairWorks');
    const devWorks = document.getElementById('devWorks');
    const tabs = document.querySelectorAll('.works-tab');

    if (!repairWorks || !devWorks) {
        console.error('Один из блоков проектов не найден!');
        return;
    }

    repairWorks.classList.remove('active');
    devWorks.classList.remove('active');

    tabs.forEach((tab, idx) => {
        if ((idx === 0 && tabName === 'repair') ||
            (idx === 1 && tabName === 'dev')) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    if (tabName === 'repair') {
        repairWorks.classList.add('active');
        if (projectCarousels.repair) {
            projectCarousels.repair.index = 0;
            updateProjectCarousel('repair');
        }
        console.log('✅ Показан раздел "Ремонт техники"');
    } else if (tabName === 'dev') {
        devWorks.classList.add('active');
        if (projectCarousels.dev) {
            projectCarousels.dev.index = 0;
            updateProjectCarousel('dev');
        }
        console.log('✅ Показан раздел "Разработка ПО"');
    }
}


// ===== ВЫПАДАЮЩИЕ МЕНЮ КАЛЬКУЛЯТОРА =====
function toggleServiceCategory(category) {
    console.log('toggleServiceCategory вызван для категории:', category);

    const repairBtn = document.getElementById('repairMainBtn');
    const devBtn = document.getElementById('devMainBtn');
    const repairDropdown = document.getElementById('repairDropdown');
    const devDropdown = document.getElementById('devDropdown');

    if (!repairBtn || !devBtn || !repairDropdown || !devDropdown) {
        console.error('Элементы выпадающих меню не найдены!');
        return;
    }

    if (activeDropdown === category) {
        closeDropdown(category);
        return;
    }

    if (activeDropdown) {
        closeDropdown(activeDropdown);
    }

    if (category === 'repair') {
        repairDropdown.classList.add('active');
        repairBtn.classList.add('active');
        activeDropdown = 'repair';
        document.body.style.overflow = 'hidden';
        console.log('✅ Открыто меню ремонта');
    } else if (category === 'dev') {
        devDropdown.classList.add('active');
        devBtn.classList.add('active');
        activeDropdown = 'dev';
        document.body.style.overflow = 'hidden';
        console.log('✅ Открыто меню разработки');
    }
}

function closeDropdown(category) {
    console.log('closeDropdown вызван для категории:', category);

    const repairBtn = document.getElementById('repairMainBtn');
    const devBtn = document.getElementById('devMainBtn');
    const repairDropdown = document.getElementById('repairDropdown');
    const devDropdown = document.getElementById('devDropdown');

    if (category === 'repair') {
        if (repairDropdown) repairDropdown.classList.remove('active');
        if (repairBtn) repairBtn.classList.remove('active');
        console.log('❌ Закрыто меню ремонта');
    } else if (category === 'dev') {
        if (devDropdown) devDropdown.classList.remove('active');
        if (devBtn) devBtn.classList.remove('active');
        console.log('❌ Закрыто меню разработки');
    }

    activeDropdown = null;
    document.body.style.overflow = 'auto';
}


// ===== МАСКА ДЛЯ ПОЛЯ ТЕЛЕФОНА =====
function applyPhoneMask(input) {
    if (!input) return;
    input.addEventListener('input', function(e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
        e.target.value = !x[2] ? x[1] : '+7 (' + x[2] + ') ' + x[3] + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
    });
}


// ===== АНИМАЦИИ ПРИ СКРОЛЛЕ =====
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.scroll-fade-up, .scroll-fade-left, .scroll-fade-right, .scroll-zoom');

    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
}

function animateCardsStaggered() {
    const cards = document.querySelectorAll('.why-card, .calc-service-item');

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.5s ease';

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Декоративная полоска в секции "О нас" — рисуется из центра при появлении на экране
function initAboutDecorationAnimation() {
    const decoration = document.getElementById('aboutDecoration');
    if (!decoration) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                decoration.classList.add('visible');
                observer.unobserve(decoration);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(decoration);
}

// Декоративная полоска в секции "Почему мы" — с небольшой задержкой
function initWhyDecorationAnimation() {
    const whyDecoration = document.getElementById('whyDecoration');
    if (!whyDecoration) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    whyDecoration.classList.add('visible');
                }, 300);
                observer.unobserve(whyDecoration);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(whyDecoration);
}

// Таймлайн истории компании — блоки появляются по очереди с задержкой
function initTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (!timelineItems.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(timelineItems).indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 250); // 250ms задержка между блоками
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    timelineItems.forEach(item => observer.observe(item));
}


// ===== 3D-ЭФФЕКТЫ ПРИ НАВЕДЕНИИ КУРСОРА =====
function init3DCards() {
    const cards = document.querySelectorAll('.why-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

function init3DServiceItems() {
    const items = document.querySelectorAll('.calc-service-item');

    items.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 30;
            const rotateY = (centerX - x) / 30;

            item.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(5px) translateY(-2px)`;
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
        });
    });
}


// ===== TOUCH-СВАЙП ДЛЯ КАРУСЕЛЕЙ (МОБИЛЬНЫЕ УСТРОЙСТВА) =====
function initSimpleCarouselSwipe() {
    const carouselWrappers = document.querySelectorAll('#repairWorks .works-carousel-wrapper, #devWorks .works-carousel-wrapper');

    carouselWrappers.forEach(wrapper => {
        let touchStartX = 0;
        let touchEndX = 0;

        const getCarouselType = () => {
            const parentWorks = wrapper.closest('.works-grid');
            if (parentWorks && parentWorks.id === 'repairWorks') return 'repair';
            if (parentWorks && parentWorks.id === 'devWorks') return 'dev';
            return null;
        };

        wrapper.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        wrapper.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            const threshold = 50;

            if (Math.abs(diff) > threshold) {
                const type = getCarouselType();
                if (type) {
                    if (diff < 0) {
                        slideProjectCarousel(type, 'next');
                        console.log(`👉 Свайп влево на карусели ${type}`);
                    } else {
                        slideProjectCarousel(type, 'prev');
                        console.log(`👈 Свайп вправо на карусели ${type}`);
                    }
                }
            }
        }, { passive: true });
    });

    console.log('✅ Touch-свайп активирован для каруселей (ремонт и разработка)');
}


// ===== СЛАЙДЕР ГЕРОЙ-СЕКЦИИ (СЛАЙДШОУ ФОНОВЫХ ФОТО) =====
function initHeroSlider() {
    const slides = document.querySelectorAll('.slideshow-container .slide');
    if (!slides.length) return;

    const intervals = [12000, 13000, 15000];
    let currentIndex = 0;
    let timeoutId = null;
    let isAnimating = false;

    function showSlide(index) {
        if (isAnimating) return;
        isAnimating = true;

        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            slide.style.animation = 'none';
            slide.offsetHeight;
        });

        slides[index].classList.add('active');
        slides[index].style.animation = 'slowZoom 20s ease-in-out infinite';

        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);

        if (timeoutId) clearTimeout(timeoutId);
        const nextInterval = intervals[currentIndex];
        timeoutId = setTimeout(nextSlide, nextInterval);
    }

    showSlide(0);
    timeoutId = setTimeout(nextSlide, intervals[0]);

    window.addEventListener('beforeunload', function() {
        if (timeoutId) clearTimeout(timeoutId);
    });
}


// ===== ШАПКА: ПРОЗРАЧНАЯ НА СЛАЙДШОУ → БЕЛАЯ ПОСЛЕ HERO =====
function initHeaderScrollState() {
    const hero = document.querySelector('.hero');
    const header = document.querySelector('.header');
    if (!header) return;

    if (hero) {
        const heroObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                hero.classList.toggle('hero-visible', entry.isIntersecting);
                header.classList.toggle('scrolled', !entry.isIntersecting);
            });
        }, { threshold: 0.15 });
        heroObserver.observe(hero);
    } else {
        // На страницах без hero (политика, услуги и т.д.) шапка сразу сплошная
        header.classList.add('scrolled');
    }
}

// Живой индикатор "Открыто/Закрыто" для часов работы в шапке
function initHeaderHoursIndicator() {
    const dot = document.querySelector('.header-hours-dot');
    const label = document.querySelector('.header-hours-label');
    if (!dot || !label) return;

    const currentHour = new Date().getHours();
    const isOpen = currentHour >= 9 && currentHour < 21;
    dot.classList.add(isOpen ? 'open' : 'closed');
    label.textContent = isOpen ? 'Сейчас открыто' : 'Сейчас закрыто';
}


// ===== ГАЛЕРЕЯ МАСТЕРСКОЙ: СВАЙП НА ТЕЛЕФОНАХ =====
function initGallerySwipe() {
    const galleryContainer = document.getElementById('galleryContainer');
    if (!galleryContainer) return;

    let touchStartX = 0, touchEndX = 0;
    galleryContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    galleryContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            galleryNextSlide();
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            galleryPrevSlide();
        }
    }, { passive: true });
}

// ===== ВКЛАДКИ "НАШИ ПРОЕКТЫ" =====
function initWorksTabs() {
    const repairWorks = document.getElementById('repairWorks');
    const devWorks = document.getElementById('devWorks');

    if (repairWorks && devWorks) {
        console.log('✅ Блоки "Наши проекты" найдены');
        repairWorks.classList.add('active');
        devWorks.classList.remove('active');

        const tabs = document.querySelectorAll('.works-tab');
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                if (index === 0) {
                    showWorksTab('repair');
                } else if (index === 1) {
                    showWorksTab('dev');
                }
            });
        });
    } else {
        console.warn('⚠️ Блоки "Наши проекты" не найдены на этой странице');
    }
}

// Закрытие выпадающих меню калькулятора по клику вне их / по Escape
function initDropdownGlobalClose() {
    document.addEventListener('click', function(event) {
        if (!activeDropdown) return;

        const repairBtn = document.getElementById('repairMainBtn');
        const devBtn = document.getElementById('devMainBtn');
        const repairDropdown = document.getElementById('repairDropdown');
        const devDropdown = document.getElementById('devDropdown');

        if (activeDropdown === 'repair' && repairBtn && repairDropdown &&
            !repairBtn.contains(event.target) && !repairDropdown.contains(event.target)) {
            closeDropdown('repair');
        }

        if (activeDropdown === 'dev' && devBtn && devDropdown &&
            !devBtn.contains(event.target) && !devDropdown.contains(event.target)) {
            closeDropdown('dev');
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && activeDropdown) {
            closeDropdown(activeDropdown);
        }
    });
}

// ===== АВТО-СКРЫТИЕ FLASH-СООБЩЕНИЙ =====
function initFlashMessagesAutoHide() {
    setTimeout(function() {
        const flashes = document.querySelectorAll('.flash-message');
        flashes.forEach(flash => {
            flash.style.opacity = '0';
            flash.style.transform = 'translateX(100px)';
            setTimeout(() => flash.remove(), 300);
        });
    }, 5000);
}

// ===== ПЕЧАТНАЯ МАШИНКА В ФУТЕРЕ =====
function initFooterTyping() {
    const phrases = [
        'PlusPC',
        'Ремонт компьютеров с душой',
        'Ваш ПК — наша забота',
        'Сделаем ваш компьютер лучше',
        'Профессионалы своего дела',
        'Цена = качество',
        'Подарим вашему пк вторую жизнь',
        'PlusPC'
    ];

    let phraseIndex = 0, charIndex = 0, isDeleting = false;
    const typingEl = document.querySelector('.typing-text');
    const cursorEl = document.querySelector('.typing-cursor');

    if (!typingEl || !cursorEl) return;

    function type() {
        const phrase = phrases[phraseIndex];
        typingEl.textContent = isDeleting
            ? phrase.substring(0, charIndex - 1)
            : phrase.substring(0, charIndex + 1);
        charIndex += isDeleting ? -1 : 1;

        let delay = isDeleting ? 30 : 80;

        if (!isDeleting && charIndex === phrase.length) {
            delay = 2500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            delay = 500;
        }
        setTimeout(type, delay);
    }

    setTimeout(type, 1000);
}


// ===== ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ (ЗАПУСКАЕТСЯ ПОСЛЕ ЗАГРУЗКИ DOM) =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ PlusPC JavaScript загружен');

    // --- Базовая инициализация блоков ---
    applyPhoneMask(document.getElementById('phone'));
    initGalleryCarousel();
    initProjectCarousel('repair');
    initProjectCarousel('dev');
    initCalculator();
    initHeroSlider();

    // --- Анимации при скролле ---
    initScrollAnimations();
    animateCardsStaggered();
    initAboutDecorationAnimation();
    initWhyDecorationAnimation();
    initTimelineAnimation();

    // --- 3D-эффекты и свайпы ---
    init3DCards();
    init3DServiceItems();
    initSimpleCarouselSwipe();
    initGallerySwipe();

    // --- Шапка сайта ---
    initHeaderScrollState();
    initHeaderHoursIndicator();

    // --- Вкладки "Наши проекты" и выпадающие меню калькулятора (см. пометки ⚠️ выше) ---
    initWorksTabs();
    initDropdownGlobalClose();

    // --- Прочее ---
    initFlashMessagesAutoHide();
    initFooterTyping();
});


// ===== ЕДИНЫЙ ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ (ДЛЯ onclick="..." В HTML) =====
window.showWorksTab = showWorksTab;
window.toggleServiceCategory = toggleServiceCategory;
window.closeDropdown = closeDropdown;
window.toggleCalcAccordion = toggleCalcAccordion;
window.updateCalcTotal = updateCalcTotal;
window.resetAllSelections = resetAllSelections;
window.submitAllServices = submitAllServices;
window.formatPrice = formatPrice;
window.galleryPrevSlide = galleryPrevSlide;
window.galleryNextSlide = galleryNextSlide;
window.galleryGoToSlide = galleryGoToSlide;
window.slideProjectCarousel = slideProjectCarousel;
window.goToProjectSlide = goToProjectSlide;
window.prevCarouselSlide = function(type) { slideProjectCarousel(type, 'prev'); };
window.nextCarouselSlide = function(type) { slideProjectCarousel(type, 'next'); };
window.goToCarouselSlide = function(type, index) { goToProjectSlide(type, index); };
window.calcCarouselPrev = calcCarouselPrev;
window.calcCarouselNext = calcCarouselNext;

document.addEventListener('DOMContentLoaded', () => {
    const spreads = document.querySelectorAll('.spread');
    const book = document.querySelector('.book');
    const menuBar = document.querySelector('.menu-bar');
    let currentSpreadIndex = 0;
    let isAnimating = false;

    // Initialize active spread
    spreads.forEach((spread, i) => {
        spread.classList.remove('active');
        if (i === 0) spread.classList.add('active');
    });

    book.addEventListener('click', (event) => {
        if (isAnimating) return;
        const clickedPage = event.target.closest('.page, .front-cover');
        if (!clickedPage) return;

        const halfWidth = clickedPage.parentElement.offsetWidth / 2;
        if (clickedPage.offsetLeft > halfWidth - 10) {
            turnPage(1);
        } else {
            turnPage(-1);
        }
    });

    // Event listener for the menu bar
    if (menuBar) {
        menuBar.addEventListener('click', (event) => {
            if (isAnimating) return;
            const menuItem = event.target.closest('.menu-item');
            if (!menuItem) return;
            event.preventDefault();

            const targetIndex = parseInt(menuItem.dataset.targetSpread, 10);
            
            if (targetIndex === currentSpreadIndex) return;

            const direction = targetIndex > currentSpreadIndex ? 1 : -1;
            
            // Pass the target index to the turnPage function
            turnPage(direction, targetIndex);
        });
    }
    
    // Updated turnPage function to handle the jump
    function turnPage(direction, targetIndex = null) {
        const newIndex = currentSpreadIndex + direction;
        if (newIndex < 0 || newIndex >= spreads.length) {
            return;
        }

        const currentSpread = spreads[currentSpreadIndex];
        const newSpread = spreads[newIndex];

        let animatedPage;
        let removeClass, addClass;

        if (direction === 1) {
            animatedPage = currentSpread.querySelector('.page:nth-child(2), .front-cover');
            removeClass = 'flipping-backwards';
            addClass = 'flipping';
        } else {
            animatedPage = currentSpread.querySelector('.page:nth-child(1), .back-cover');
            removeClass = 'flipping';
            addClass = 'flipping-backwards';
        }

        if (!animatedPage) {
            return;
        }

        isAnimating = true;

        let content;
        if (animatedPage.classList.contains('front-cover')) {
            content = animatedPage.querySelectorAll('.book-title, .author-name');
        } else {
            content = animatedPage.querySelector('.page-content');
            if (content) content = [content];
        }
        if (content) content.forEach(el => el.style.opacity = 0);

        if (currentSpreadIndex === 0 && direction === 1) book.classList.remove('closed');

        animatedPage.classList.remove(removeClass);
        void animatedPage.offsetWidth;
        animatedPage.classList.add(addClass);

        animatedPage.addEventListener('transitionend', function handler(e) {
            if (e.propertyName !== 'transform') return;

            // Remove active class from the old spread
            currentSpread.classList.remove('active');
            
            if (targetIndex !== null && newIndex !== targetIndex) {
                // INSTANTLY JUMP TO THE FINAL SPREAD
                spreads[targetIndex].classList.add('active');
                currentSpreadIndex = targetIndex;
            } else {
                // Regular one-page flip
                newSpread.classList.add('active');
                currentSpreadIndex = newIndex;
            }

            animatedPage.classList.remove(addClass);

            if (content) content.forEach(el => el.style.opacity = 1);

            if (currentSpreadIndex === 0) book.classList.add('closed');

            animatedPage.removeEventListener('transitionend', handler);
            isAnimating = false;
        });
    }
});
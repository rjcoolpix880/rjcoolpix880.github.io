// Create modal elements when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.zIndex = '1000';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
    modal.style.cursor = 'pointer';

    // Create close button
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '25px';
    closeBtn.style.top = '10px';
    closeBtn.style.color = '#f1f1f1';
    closeBtn.style.fontSize = '40px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';

    // Create modal image
    const modalImg = document.createElement('img');
    modalImg.id = 'modalImg';
    modalImg.style.margin = 'auto';
    modalImg.style.display = 'block';
    modalImg.style.maxWidth = '90%';
    modalImg.style.maxHeight = '90%';
    modalImg.style.position = 'relative';
    modalImg.style.top = '50%';
    modalImg.style.transform = 'translateY(-50%)';
    modalImg.style.cursor = 'pointer';

    // Add elements to modal
    modal.appendChild(closeBtn);
    modal.appendChild(modalImg);
    document.body.appendChild(modal);

    // Add click event to all images
    document.querySelectorAll('img').forEach(img => {
        if (!img.classList.contains('no-modal')) { // Skip images with 'no-modal' class
            img.style.cursor = 'pointer';
            img.addEventListener('click', function() {
                modal.style.display = 'block';
                modalImg.src = this.src;
            });
        }
    });

    // Close modal when clicking X, the image itself, or anywhere on modal
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
    modalImg.onclick = function() {
        modal.style.display = 'none';
    }
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    }

    // Close modal with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
});

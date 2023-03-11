const deleteProduct = async (btn) => {
    try {
        const productId = btn.parentNode.querySelector('[name=productId]').value;
        const csrfToken = btn.parentNode.querySelector('[name=_csrf]').value;
        const productElement = btn.closest('article');
        const res = await fetch(`/admin/product/${productId}`, {
            method: 'DELETE',
            headers: {
                'csrf-token': csrfToken
            }
        });
        const responseData = await res.json();
        if (responseData.success) {
            productElement.parentNode.removeChild(productElement);
        }
    } catch (error) {
        console.error(error);
    }
};

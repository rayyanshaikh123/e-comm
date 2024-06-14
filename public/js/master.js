document.addEventListener('DOMContentLoaded', () => {
    let usercat = document.getElementById('cat');
    let usertitle = document.getElementById('title');
    let description = document.getElementById('description');
    let image = document.getElementById('image');
    let images = document.getElementById('images');


    async function getpro() {
        try {
            const response = await fetch('http://localhost:3000/master/products');
            const products = await response.json();
            console.log(JSON.stringify(products));
            localStorage.setItem('products', JSON.stringify(products));

            putTitle(products);
        } catch (error) {
            console.error('rr get pro', error);
        }
    }

    function putTitle(products) {
        const categories = [...new Set(products.map(product => product.category))];
        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            usercat.appendChild(option);
        }
    }

    function fillTitle(titles) {
        let op = document.createElement('option');
        op.textContent = "select any";
        usertitle.appendChild(op);
        for (let i = 0; i < titles.length; i++) {
            const title = titles[i];
            const option = document.createElement('option');
            option.value = title;
            option.textContent = title;
            usertitle.appendChild(option);
        }
    }

    usercat.addEventListener('change', getusertTitle);
    usertitle.addEventListener('change', getproInfo);

    function getusertTitle() {
        usertitle.innerHTML = ''; 
        const selectcat = usercat.value;
        const products = JSON.parse(localStorage.getItem('products')); 
        if (!products) {
            getpro();
            return;
        }
        const titles = [];
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            if (product.category === selectcat) {
                for (let j = 0; j < product.mod.length; j++) {
                    const title = product.mod[j].title;
                    titles.push(title);
                }
            }
        }
        fillTitle(titles);
    }



    function getproInfo() {
        const selectcat = usercat.value;
        const selectitle = usertitle.value;
        const products = JSON.parse(localStorage.getItem('products')); 
        if (!products) {
            getpro();
            return;
        }
        const product = products.find(product => product.category === selectcat);
        if (!product) {
            console.error('no pro');
            return;
        }
        const selectedProduct = product.mod.find(m => m.title === selectitle);
        if (!selectedProduct) {
            console.error('title not');
            return;
        }
        description.textContent = selectedProduct.description;
        image.src = selectedProduct.image;
        images.value = selectedProduct.image;
    }

   

   
    getpro();
});

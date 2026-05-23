
let backendUrl = import.meta.env.VITE_BACKEND_URL
const fetchCategoryWiseProducts = async(category)=> {
    const response = await fetch(`${backendUrl}/product/category-product`,{
        method: "POST",
        headers: {
            "Content-type":"application/json"
        },
        body:JSON.stringify({
            category: category
        })
    })

    const dataResponse = await response.json()
    return dataResponse
}

export default fetchCategoryWiseProducts
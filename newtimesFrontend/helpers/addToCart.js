import {toast} from 'react-hot-toast'
let backendUrl = import.meta.env.VITE_BACKEND_URL


const addToCart = async(e,id) => {
    e?.stopPropagation()
    e?.preventDefault()

    const response = await fetch(`${backendUrl}/user/add-to-cart`,{
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({productId: id})
    })
  const responseData = await response.json()
  if(response.ok){
    toast.success(responseData.message)

  } else{
    toast.error(responseData.message)
  }
  return responseData
}

export default addToCart

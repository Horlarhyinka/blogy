
export default (err: any)=>{
    if(err.code === 11000){
        const key = Object.keys(err.keyValue)[0]
        const value = Object.values(err.keyValue)[0]
        return `${key} - ${value} already exists`
    }
    if(err.message?.includes("validation failed")){
   const res = Object.keys(err.errors).map(error=>err.errors[error].properties.message)
   return res
    }
}
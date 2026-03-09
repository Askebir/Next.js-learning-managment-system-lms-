
import { ReactNode, Suspense } from "react";

export default function AonsumerLayout({
    children

}:Readonly<{children:React.ReactNode}>){
    return(
             <div className="min-h-screen bg-green-400 flex-col justify-center items-center" >
               
                  {children}
        </div>
  

    )
}




// export default async function AuthLayout({
//     children
// }:{
//     children:React.ReactNode
// }){
//     return(
   
//     )
// }
import Link from "next/link"
import { FC } from "react"


export const Baner: FC =()=>{
    return(
        <div className="text-white flex flex-col  animate__animated animate__fadeIn animate__delay-1s p-48 pr-96 items-left">
    <div className="text-[#64ffda]">
       <h1>Hi, my name is</h1> 
         </div>
    <div>
      <h2 className="text-6xl font-semibold mt-6">Nikola Stankovic.</h2>  
        </div>
<div>
    <h3 className="text-6xl font-semibold text-[#ccd6f6] mt-6 ">I build everything from nothing.</h3></div>
<div>
    <p className="text-[#ccd6f6] leading-normal mt-6">Front End developer with industry experience building websites and web applications.
     I specialize in JavaScript and have professional experience working with C++, Typescript and Python.
     I also have experience working with Next and React. Currently, I’m focused on OTT Apps at 
      <Link className="text-[#64ffda]" href={"https://www.prototypenext.com/"}> Prototypenext</Link>.</p>
</div>
<div className="border-2 block text-[#64ffda] w-48 pl-6 mt-6 p-4 rounded-md border-[#64ffda]"><Link href={""} >Checkout my work</Link></div>
            </div>
    )
}
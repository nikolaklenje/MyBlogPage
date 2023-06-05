import { FC } from "react"
import style from "/con.module.css"
import Link from "next/link"

export const Conections: FC = ()=>{
    return(
        <div>
            <div className="fixed bottom-0 left-16">
                <ul>
                <li>AAA</li>
                <li>BBB</li>
                <li>AAA</li>
                <li>BBB</li>
                <li>BBB</li>
                </ul>
            </div>
            <div className="fixed z-50 bottom-0 right-16">
               <div className="flex-col relative text-[#ccd6f6] hover:text-[#64ffda]">
                <div className="text-dir-lr">
                    <Link href="www.google.com">nikola@prototypenext.com</Link>
                </div>
                <div className="w-[2px] mt-4 ml-2 h-32 bg-[#ccd6f6]"></div>

                </div>
            </div>
        </div>
    )
    
}
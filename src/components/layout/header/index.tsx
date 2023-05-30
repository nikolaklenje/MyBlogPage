import { FC } from "react";
import 'animate.css';

export const Header : FC =()=>{

    return(
        <div className="header-container relative w-full h-16 text-[#64ffda]">
        <div className="flex flex-row center justify-between p-4 pl-16 pr-16">
            <div className="font-black mt-4 animate__animated animate__fadeInDown">NICODE</div>
            <div className="flex-row flex ">
                <ul className="flex flex-row center  mt-4 space-x-4">
                    <li className="animate__animated animate__fadeInDownBig">01.<span className="text-white hover:text-[#64ffda]"> Home</span> </li>
                    <li className="animate__animated animate__fadeInDownBig">02.<span className="text-white hover:text-[#64ffda]"> About</span> </li>
                    <li className="animate__animated animate__fadeInDownBig ">03.<span className="text-white hover:text-[#64ffda]"> Contact</span> </li>
                </ul>
                <div className="border-2 block animate__animated animate__fadeInUpBig  text-[#64ffda] ml-4 mt-0 p-4 rounded-md border-[#64ffda]">Resume</div>
            </div>
        </div>
        </div>
    )

}
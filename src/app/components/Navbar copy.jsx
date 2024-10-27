//src/app/components/Navbar.jsx
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { FaTrophy } from "react-icons/fa6"
import { GiWhistle } from "react-icons/gi";

const Navbar = () => {
  return (
    <div className='w-full h-[7vh] text-[#1097d5] p-2 shadow-md flex justify-between'>
        <Image src="/pygma.png" width={120} height={120} alt="logo"/>
        <div className=' flex gap-2 justify-evenly'>
            <Link 
            href="/torneos" 
            className='flex flex-col items-center'
            >
                <FaTrophy size={20} />
                <p className="font-semibold text-sm">Torneos</p>
            </Link>
            <Link 
            href="/jueces" 
            className='flex flex-col items-center'
            >
                <GiWhistle size={20} />
                <p className="font-semibold text-sm">Jueces</p>
            </Link>
        </div>
    </div>
  )
}

export default Navbar
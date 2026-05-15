import { usePathname } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';


export default function MenuList(){
    const router = useRouter()
    const pathName = usePathname()


   const handleRedirect = (routeName: string) => {
    router.push(routeName)
  }

  const isActiveRoute =(routeName: string) => {
    const cleaned = pathName.startsWith("/") ? pathName.slice(1) : pathName;
    if(routeName == cleaned){
      return true
    }else{
      return false
    }
  }
    return(
        <div className="w-[100%] flex flex-col items-between bg-white px-6 2md:px-5 py-6 2md:py-2  gap-8">
            <div className="flex flex-col w-full gap-3">
                <div onClick={() => handleRedirect('/user-dashboard')} className="flex items-center gap-3">
                <p className="text-text-black font-medium text-base" style={{borderBottom: isActiveRoute('user-dashboard') ? '2px solid var(--color-blue)' : ''}}>Dashboard</p>
                </div>
                <div onClick={() => handleRedirect('/my-listing')}  className="flex items-center gap-3">
                <p className="text-text-black font-medium text-base" style={{borderBottom: isActiveRoute('my-listing') ? '2px solid var(--color-blue)' : ''}}>Listing</p>
                </div>
                <div className="flex items-center gap-3">
                <p className="text-text-black font-medium text-base">Leads</p>
                </div>
                <button className="w-min text-base animated-button px-7 lg:px-10 py-3 border border-blue text-center cursor-pointer">
                    <span className="gap-3 relative flex justify-center">
                        <img src='/assets/plus-sign.svg'/>
                        <p className={`text-nowrap font-medium`}>Post Property</p>
                    </span>
                </button>
            </div>
        </div>
    )
}
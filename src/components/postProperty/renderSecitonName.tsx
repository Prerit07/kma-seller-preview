export default function RenderSectionName({data, customClass}: {data: {name: string, subName: string}, customClass?: string}){

  return(
    <div className={`flex flex-col pb-3 ${customClass ? customClass : ''}`}>
        <div className="flex items-center gap-2">
          <div className=" border-r-3 border-text-blue rounded-r-[10px] h-[23px]"></div>
          <p className="text-text-black font-semibold text-base 2md:text-lg ">
            {data?.name ?? ''}
          </p>
        </div>

        {data?.subName && <p className="text-sm text-text-gray pt-1">
          {data?.subName ?? ''} 
        </p>}
      </div>
  )

}
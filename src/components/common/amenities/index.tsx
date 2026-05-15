import Image from "next/image";

export default function AmenitiesCard({icon, label, checked, count,  handleUpdateFurnishedCount, handleAddFurnished} : {icon:string, label: string, checked: boolean, count: number, handleAddFurnished: (name: string) => void, handleUpdateFurnishedCount: (name: string, count: number) => void }) {
  
  const handleDescresecount = (e) => {
    e.stopPropagation()
      e.preventDefault()
    if(checked){
      if(Number(count) > 0){
        handleUpdateFurnishedCount(label, Number(count) - 1)
      }
    }
  }

  const handleIncreasecount = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if(Number(count) < 100){
        handleUpdateFurnishedCount(label, Number(count) + 1)
      }
  }

  return (
    <div onClick={(e) => {
      e.stopPropagation()
      e.preventDefault()
      handleAddFurnished(label)
    }} className={`cursor-pointer min-w-[220px] sm:max-w-[220px] flex flex-1 justify-between border ${checked ? 'border-text-black bg-light-purple' : 'border-border'} rounded-[10px]`}>
      <div  className="  flex gap-3 items-center p-3">
        <Image alt="" src={icon} width={24} height={24}/>
        <p className="text-base text-text-black">{label}</p>
      </div>
      <div className={`bg-white rounded-r-[10px] flex flex-col items-center justify-center py-1 gap-1 px-2 border-l ${checked ? 'border-text-black' : 'border-border'}`}>
        <div onClick={handleDescresecount} className={`cursor-pointer select-none font-light border border-border rounded-full w-5 h-5 text-[16px] leading-[16px] text-center`}>
          –
        </div>
        <p>{count}</p>
        <div onClick={handleIncreasecount} className="cursor-pointer select-none font-light border border-border rounded-full w-5 h-5 text-[16px] leading-[16px] text-center">
          +
        </div>
      </div>
    </div>
  );
}

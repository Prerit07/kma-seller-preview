'use client'

export default function ContentLayout({cardContent, infoContent}: { cardContent: React.ReactNode, infoContent: React.ReactNode }){
    return(
        <div className="w-full grid grid-cols-1 md:flex md:flex-wrap justify-between items-start gap-8">
                <div style={{flex: '2.5 1 '}}>
                    {infoContent}
                </div>
                <div  style={{flex: '1.8 1 '}} className="mt-5 md:mt-0"> 
                    {cardContent}
                </div>
        </div>
    )
}
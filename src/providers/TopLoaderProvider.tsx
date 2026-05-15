'use client'
import NextTopLoader from 'nextjs-toploader';

export default function TopLoaderProvider(){
    return(
        <>
            <NextTopLoader
                color="#fff"
                showSpinner={false}
            />
        </>
    )
}
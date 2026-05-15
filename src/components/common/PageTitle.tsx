import React from 'react'

const PageTitle = ({ title, description, breadcrumps, actions }) => {
    return (
        <div className='flex flex-col items-center max-w-[610px]'>
            <h1 className="text-[40px] text-center font-semibold text-white">{title}</h1>
            {description && <p className="text-white text-center text-md mt-4 leading-7 font-light">{description}</p>}
            {/* {actions && (
                <div className="flex items-center mt-6 mb-3">
                    {actions.map((item, index) => (
                        <a key={index} href={item.link}>
                            <button className="w-auto text-sm 1xl:text-base text-black! hover:text-text-black! animated-button-white px-8 py-2 border border-white bg-white! text-center cursor-pointer">
                                <span className="gap-3 relative flex justify-center">
                                    <p className={`text-nowrap`}>{item.name}</p>
                                </span>
                            </button>
                        </a>
                    ))}
                </div>
            )} */}
            {breadcrumps && (

                <div className="flex items-center mt-4">
                    {breadcrumps.map((item, index) => (
                        <div key={index} className="flex items-center">
                            <a href={item.link} className="text-white hover:text-gray-300 flex items-center" style={!item.link ? { textDecoration: 'underline' } : {}}>
                                {item.icon && <span className="text-sm text-white mr-2">{item.icon}</span>}
                                {item.name}
                            </a>
                            {index < breadcrumps.length - 1 && <span className="text-sm text-white mx-2">/</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default PageTitle